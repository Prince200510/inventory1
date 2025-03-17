import React, { useState, useEffect } from 'react';
import { AiOutlineDelete, AiFillFileAdd } from 'react-icons/ai';
import database from './firebase';
import { ref, onValue, update, get, push, set } from 'firebase/database';
import Swal from 'sweetalert2';
import { useLocation, useNavigate, Link, Route, Routes, Outlet } from 'react-router-dom';
import './Dashboard.css';
import Bill from './Bill';

const NewSale = () => {
    const location = useLocation();
    const { userName } = location.state;
    const [currentComponent, setCurrentComponent] = useState();
    const [showContent, setShowContent] = useState(true);
    const username = location?.state?.userName;
    const [rows, setRows] = useState([{ id: 1 }]);
    const [productNames, setProductNames] = useState([]);
    const [salePrices, setSalePrices] = useState({});
    const [quantities, setQuantities] = useState({});
    const [customerName, setCustomerName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [discount, setDiscount] = useState(0);
    const [custid, setcustid] = useState(0);
    const [orderSubmitted, setOrderSubmitted] = useState(false);


    useEffect(() => {
        const fetchCustomerIDs = () => {
            const customerRef = ref(database, `${userName}Customers`);
            onValue(customerRef, (snapshot) => {
                if (snapshot.exists()) {
                    const customerData = snapshot.val();
                    const customerIDs = Object.keys(customerData).map(id => parseInt(id));
                    const maxID = Math.max(...customerIDs);
                    setcustid(maxID + 1); 
                } else {
                    setcustid(1); 
                }
            });
        };

        fetchCustomerIDs();
    }, []);

    const addNewRow = () => {
        const newRow = { id: rows.length + 1 };
        setRows([...rows, newRow]);
    };

    const handleDeleteRow = (id) => {
        const updatedRows = rows.filter(row => row.id !== id);
        setRows(updatedRows);
    };

    const handleviewbill = () => {
        setCurrentComponent(<Bill />);
        setShowContent(false);
    };

    const handleProductChange = (event, id) => {
        const selectedProductName = event.target.value;
        const productRef = ref(database, `${userName}Products/${selectedProductName}/saleprice`);
        onValue(productRef, (snapshot) => {
            if (snapshot.exists()) {
                setSalePrices(prevPrices => ({
                    ...prevPrices,
                    [id]: snapshot.val()
                }));
                setRows(prevRows => prevRows.map(row => {
                    if (row.id === id) {
                        return { ...row, productName: selectedProductName };
                    }
                    return row;
                }));
            } else {
                setSalePrices(prevPrices => ({
                    ...prevPrices,
                    [id]: ''
                }));
                setRows(prevRows => prevRows.map(row => {
                    if (row.id === id) {
                        return { ...row, productName: '' };
                    }
                    return row;
                }));
            }
        });
    };
    
    const handleQuantityChange = (event, id) => {
        const value = event.target.value;
        const salePrice = salePrices[id] || 0; 
        const itemTotal = parseFloat(value) * parseFloat(salePrice);
        
        setQuantities(prevQuantities => ({
            ...prevQuantities,
            [id]: value
        }));
    
        setRows(prevRows => prevRows.map(row => {
            if (row.id === id) {
                return { ...row, itemTotal: itemTotal };
            }
            return row;
        }));
    };

    const handleFinalButtonClick = async () => {
        if (!customerName || !customerAddress || !custid) {
            Swal.fire({
                title: 'Error!',
                text: 'Please fill in all the required fields.',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            return;
        }
    
        const currentTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        const orderDetails = {
            username: username,
            customerName: customerName,
            customerAddress: customerAddress,
            date: currentTime,
            products: [],
            orderTotal: calculateOrderTotal(),
            discount: discount,
            cgst: calculateCGST(),
            sgst: calculateSGST(),
            finalTotal: calculateFinalTotal(),
        };
    
      
        const customerDataRef = push(ref(database, `${userName}Customers/${custid}`),null);
        set(ref(database, `${userName}Customers/${custid}`), orderDetails)
        .then(() => {
        })
    
        let shouldSubmitData = true; 
    
        for (const id in quantities) {
            if (Object.prototype.hasOwnProperty.call(quantities, id)) {
                const selectedRow = rows.find(row => row.id === parseInt(id));
                if (selectedRow && selectedRow.productName) {
                    const selectedProductName = selectedRow.productName;
                    const productRef = ref(database, `${userName}Products/${selectedProductName}`);
                    const snapshot = await get(productRef);
                    if (snapshot.exists()) {
                        const productData = snapshot.val();
                        const requestedQuantity = parseInt(quantities[id]);
                        if (productData.quantity <= 0 || requestedQuantity > productData.quantity) {
                            // Product is out of stock or requested quantity exceeds available quantity
                            shouldSubmitData = false;
                            Swal.fire({
                                title: 'Out of Stock!',
                                text: 'One or more selected products are out of stock or requested quantity exceeds available quantity.',
                                icon: 'warning',
                                confirmButtonText: 'Ok'
                            });
                            break; // Exit the loop
                        }
                        const updatedQuantity = productData.quantity - requestedQuantity;
                        update(ref(database), { [`${userName}Products/${selectedProductName}/quantity`]: updatedQuantity });
                        orderDetails.products.push({
                            productName: selectedProductName,
                            salePrice: productData.saleprice,
                            quantity: requestedQuantity,
                            itemTotal: parseFloat(productData.saleprice) * requestedQuantity
                        });

                    }
                }
            }
        }
    
        if (shouldSubmitData) {
            setCustomerName('');
            setCustomerAddress('');
            setcustid(0);
            setRows([{ id: 1 }]);
            setDiscount(0);
            setQuantities({});
            setSalePrices({});
            setOrderSubmitted(true); 

            Swal.fire({
                title: 'Success!',
                text: 'Sale order has been placed successfully.',
                icon: 'success',
                confirmButtonText: 'Ok'
            });
    
            // Update order details in database
            update(customerDataRef, orderDetails)
            set(ref(database, `${userName}Customers/${custid}`), orderDetails)
                .then(() => {
                    console.log("Order details submitted successfully:", orderDetails);
                })
                .catch(error => {
                    console.error("Error submitting order details:", error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to submit sale order. Please try again.',
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                });
        } else {
            // Clear the customer data reference if submission is not required
            set(ref(database, `${userName}Customers/${custid}`), null);
        }
    };
    
    
    useEffect(() => {
        const productRef = ref(database, `${userName}Products`);
        onValue(productRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const productNamesArray = Object.keys(data);
                setProductNames(productNamesArray);
            } else {
                setProductNames([]);
            }
        });
    }, []);

    const calculateOrderTotal = () => {
        let total = 0;
        for (const row of rows) {
            total += row.itemTotal || 0;
        }
        return total;
    };
    
    const calculateCGST = () => {
        const orderTotal = calculateOrderTotal();
        const cgst = orderTotal * 0.08;
        return cgst.toFixed(2);
    };
    
    const calculateSGST = () => {
        const orderTotal = calculateOrderTotal();
        const sgst = orderTotal * 0.08;
        return sgst.toFixed(2);
    };
    
    const calculateFinalTotal = () => {
        const orderTotal = calculateOrderTotal();
        const discountAmount = discount || 0;
        const cgst = orderTotal * 0.08;
        const sgst = orderTotal * 0.08;
        const finalTotal = orderTotal - discountAmount + cgst + sgst;
        return finalTotal.toFixed(2);
    };
    
    return (
        <>
    
        <h1 className="supplier"><span>Sale</span>Order</h1>
        <div className="supplier-container">
            <div class="newsale-container">
                <div className="parent-purchase-product">
                    <div className="child-purchase-product">
                        <label>Customer Name</label><br />
                        <input type="text" placeholder='Enter customer name' value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                    </div>
                    <div className="child-purchase-product">
                        <label>Address</label><br />
                        <input type="text"  placeholder='Enter customer address' value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
                    </div>
                </div>
                <div className="child-purchase-product"  style={{marginTop: "8px"}}>
                    <label>Customer Id</label><br />
                    <input type="text" style={{ padding: "8px", marginTop: "10px" }} placeholder='Enter customer id' value={custid} onChange={(e) => setcustid(e.target.value)} readOnly />
                </div>
                <div className="parent-purchase-product-1">
                    <div className="child-purchase-product-1">
                        <table className="purchase-table">
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Sale Price</th>
                                    <th>Quantity</th>
                                    <th>Item Total</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(row => (
                                    <tr key={row.id}>
                                        <td>
                                            <select style={{padding: '8px'}} onChange={(event) => handleProductChange(event, row.id)}>
                                                {productNames.map(productName => (
                                                    <option key={productName} value={productName}>{productName}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <input type="text" value={salePrices[row.id] || ''} placeholder='Price' size="8" readOnly />
                                        </td>
                                        <td>
                                            <input type="text" placeholder='Qtn.' size="3" onChange={(event) => handleQuantityChange(event, row.id)} />
                                        </td>
                                        <td>
                                            <input type="text" value={row.itemTotal || ''} placeholder='₹' size="6" readOnly />
                                        </td>
                                        <td><button onClick={() => handleDeleteRow(row.id)}><AiOutlineDelete className="delete" /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="newsalebutton" onClick={addNewRow}>New Row</button>
                    </div>
                    <div className="child-purchase-product-2">
                        <label style={{ marginRight: '11px' }}>Order Total</label>
                        <input type="text" value={calculateOrderTotal()} readOnly /><br />

                        <label style={{ marginRight: '23px' }}>Discount </label>
                        <input type="text" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value))} /><br />

                        <label style={{ marginRight: '47px', fontWeight: "500" }}>CGST </label>
                        <input type="text" value={calculateCGST()} readOnly /><br />

                        <label style={{ marginRight: '47px', fontWeight: "500" }}>SGST </label>
                        <input type="text" value={calculateSGST()} readOnly /><br />

                        <label style={{ marginRight: '11px', fontWeight: "500" }}>Final Total </label>
                        <input type="text" value={calculateFinalTotal()} readOnly /><br />

                        <label style={{ marginRight: '24px' }}>Payment </label>
                        <select style={{ width: "181px" }}>
                            <option value="1">Cash Payment</option>
                            <option value="2">Cheque Payment</option>
                            <option value="3">Upi Payment</option>
                            <option value="4">Google Pay Payment</option>
                        </select><br />
                        <button className="newsalebutton" onClick={handleFinalButtonClick}>Final</button>
                      <button className="newsalebutton" style={{ marginLeft: "0px" }} onClick={handleviewbill}>View Bill</button>
                    </div>
                </div>
            </div>
        </div>{currentComponent}
        </>
    );
};

export default NewSale;
