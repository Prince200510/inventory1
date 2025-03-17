import React, { useEffect, useState } from 'react';
import database from './firebase';
import { ref, onValue, push, set } from 'firebase/database';
import { AiOutlineDelete } from 'react-icons/ai';
import Swal from 'sweetalert2';
import { useLocation } from 'react-router-dom';

const Purchase = () => {
    const location = useLocation();
    const { userName } = location.state; 
    const [supplierNames, setSupplierNames] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [selectedSupplierAddress, setSelectedSupplierAddress] = useState('');
    const [itemName, setItemName] = useState('');
    const [itemPrice, setItemPrice] = useState('');
    const [itemQuantity, setItemQuantity] = useState('');
    const [itemTotal, setItemTotal] = useState('');
    const [discount, setDiscount] = useState('');
    const [finalTotal, setFinalTotal] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    useEffect(() => {
        const suppliersRef = ref(database, `${userName}suppliers`);
        onValue(suppliersRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const supplierNamesArray = Object.keys(data);
                setSupplierNames(supplierNamesArray);
            } else {
                setSupplierNames([]);
            }
        });
    }, []);

    const handleSupplierChange = (event) => {
        const selectedSupplierName = event.target.value;
        setSelectedSupplier(selectedSupplierName);
        const supplierRef = ref(database, `${userName}suppliers/${selectedSupplierName}/address`);
        onValue(supplierRef, (snapshot) => {
            if (snapshot.exists()) {
                setSelectedSupplierAddress(snapshot.val());
            } else {
                setSelectedSupplierAddress('');
            }
        });
    };

    const handleItemPriceChange = (event) => {
        const price = event.target.value;
        setItemPrice(price);
        calculateItemTotal(itemQuantity, price);
    };

    const handleItemQuantityChange = (event) => {
        const quantity = event.target.value;
        setItemQuantity(quantity);
        calculateItemTotal(quantity, itemPrice);
    };

    const calculateItemTotal = (quantity, price) => {
        const total = parseFloat(quantity) * parseFloat(price);
        setItemTotal(total.toFixed(2));
    };

    const handleDiscountChange = (event) => {
        const discountValue = event.target.value;
        setDiscount(discountValue);
        calculateFinalTotal(itemTotal, discountValue);
    };

    const calculateFinalTotal = (total, discount) => {
        const final = parseFloat(total) - parseFloat(discount);
        setFinalTotal(final.toFixed(2));
    };

    const getCurrentISTDateTime = () => {
        const currentIST = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        return currentIST;
    };

    const handleSave = () => {
        if (!selectedSupplier || !selectedSupplierAddress || !itemName || !itemPrice || !itemQuantity || !itemTotal || !discount || !finalTotal) {
            Swal.fire({
                title: 'Error!',
                text: 'Please fill all the details',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            return;
        }

        const currentIST = getCurrentISTDateTime();

        const purchaseData = {
            supplierName: selectedSupplier,
            supplierAddress: selectedSupplierAddress,
            itemName,
            itemPrice,
            itemQuantity,
            itemTotal,
            discount,
            finalTotal,
            paymentMethod,
            dateTime: currentIST 
        };

        const newPurchaseRef = push(ref(database, `${userName}purchase/${itemName}`), null);
        const purchaseKey = newPurchaseRef.key;

        set(ref(database, `${userName}purchase/${itemName}`), purchaseData)
            .then(() => {
                Swal.fire({
                    title: "Your data has been recorded",
                    icon: "success"
                });
                setSelectedSupplier('');
                setSelectedSupplierAddress('');
                setItemName('');
                setItemPrice('');
                setItemQuantity('');
                setItemTotal('');
                setDiscount('');
                setFinalTotal('');
                setPaymentMethod('');
            })
            .catch((error) => {
                console.error('Error saving purchase data:', error);
            });
    };

    const handlePaymentMethodChange = (event) => {
        setPaymentMethod(event.target.value);
    };

    const handleclear = () => {
        setSelectedSupplier('');
        setSelectedSupplierAddress('');
        setItemName('');
        setItemPrice('');
        setItemQuantity('');
        setItemTotal('');
        setDiscount('');
        setFinalTotal('');
        setPaymentMethod('');
    };

    return (
        <>
            <h1 className="supplier"><span>Purchase</span>Order</h1>
            <div className="supplier-container">
                <div class="parent-purchase">
                    <div className="parent-purchase-product">
                        <div className="child-purchase-product">
                            <label>Supplier Name</label><br />
                            <select name="name" onChange={handleSupplierChange} value={selectedSupplier}>
                                <option value="">Select Supplier</option>
                                {supplierNames.map((supplierName, index) => (
                                    <option key={index} value={supplierName}>{supplierName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="child-purchase-product">
                            <label>Supplier Address</label><br />
                            <input type="text" value={selectedSupplierAddress} readOnly />
                        </div>
                    </div>
                    <div class="parent-purchase-product-1">
                        <div class="child-purchase-product-1">
                            <table class="purchase-table">
                                <thead>
                                    <tr>
                                        <th>Product Name</th>
                                        <th>Purchase Price</th>
                                        <th>Quantity</th>
                                        <th>Item Total</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><input type="text" placeholder='Product Name' size='18' value={itemName} onChange={(e) => setItemName(e.target.value)}></input></td>
                                        <td><input type="text" placeholder='Price' size="8" value={itemPrice} onChange={handleItemPriceChange}></input></td>
                                        <td><input type="text" placeholder='Qtn.' size="3" value={itemQuantity} onChange={handleItemQuantityChange}></input></td>
                                        <td><input type="text" placeholder='₹' size="6" value={itemTotal} readOnly></input></td>
                                        <td><button onClick={handleclear}><AiOutlineDelete className="delete" /></button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="child-purchase-product-2">
                            <label>Item Total</label><input type="text" value={itemTotal} readOnly></input><br></br>
                            <label style={{ marginRight: '23px' }}>Discount  </label><input type="text" value={discount} onChange={handleDiscountChange}></input><br></br>
                            <label style={{ marginRight: '11px', fontWeight: "500" }}>Final Total  </label><input type="text" value={finalTotal} readOnly></input><br></br>
                            <label style={{ marginRight: '24px' }}>Payment  </label><select style={{ width: "181px" }} onChange={handlePaymentMethodChange}><option value="1">Cash Payment</option><br></br>
                                <option value="2">Cheque Payment</option>
                                <option value="3">Upi Payment</option>
                                <option value="4">Google Pay Payment</option></select><br></br>
                            <button onClick={handleSave}>Save & Print</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Purchase;
