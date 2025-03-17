import React, { useState, useEffect } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import database from './firebase';
import { ref, push, onValue, remove, child, set, get, orderByChild, exists, forEachChild, val} from 'firebase/database';
import Swal from 'sweetalert2'
import { useLocation } from 'react-router-dom';

const Product = () => {
    const [Products, setProducts] = useState([]);
    const location = useLocation();
    const { userName } = location.state;
    const [newProduct, setNewProduct] = useState({
        name1: '',
        name: '',
        purchaseprice: '',
        saleprice: '',
        quantity: ''
    });
    const [supplierNames, setSupplierNames] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    useEffect(() => {
        const ProductsRef = ref(database, `${userName}Products`);
        onValue(ProductsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const ProductsArray = Object.values(data);
                setProducts(ProductsArray);
                setFilteredProducts(ProductsArray); 
            } else {
                setProducts([]);
                setFilteredProducts([]);
            }
        });
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

    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({ ...newProduct, [name]: value }); 
    };

    const handleNewProductSubmit = async () => {
        const { name1, name, purchaseprice, saleprice, quantity } = newProduct;
        if (!name1 || !name || !purchaseprice || !saleprice || !quantity) {
            alert("Please fill out all fields");
            return;
        }

        const productData = {
            name,
            name1,
            purchaseprice,
            saleprice,
            quantity
        };

        try {
            const productsRef = ref(database, `${userName}Products/${name1}`);
            await set(productsRef, productData);
            setNewProduct({
                name1: '',
                name: '',
                purchaseprice: '',
                saleprice: '',
                quantity: '',
            });
            Swal.fire({
                title: "Product details have been added!",
                icon: "success"
            });
        } catch (error) {
            console.error('Error adding product:', error);
            Swal.fire({
                title: 'Error!',
                text: error.message || 'An error occurred while adding the product.',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    };
    const handleSearch = () => {
        const trimmedQuery = searchQuery.trim().toLowerCase();
        if (trimmedQuery === '') {
            setFilteredProducts(Products);
        } else {
            const filtered = Products.filter(product =>
                product.name1.toLowerCase().includes(trimmedQuery)
            );
            setFilteredProducts(filtered);
        }
    };
    
    const handleDeleteProduct = async (name1) => {
        if (!name1) {
            console.error('Supplier name is not defined.');
            Swal.fire({
                title: 'Error!',
                text: 'Product name is not defined.',
                icon: 'error',
                confirmButtonText: 'Ok'
              })
            return;
        }
        try {
            const supplierRef = ref(database, `${userName}Products/` + name1);
            await remove(supplierRef);
            Swal.fire({
                title: "Product deatils have been deleted!",
                icon: "success"
              });
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: error,
                icon: 'error',
                confirmButtonText: 'Cool'
              })
        }
    };

    
    
    const calculateTotalPurchasePrice = (quantity, purchaseprice) => {
        return (quantity * purchaseprice).toFixed(2);
    };

    const calculateTotalSalePrice = (quantity, saleprice) => {
        return (quantity * saleprice).toFixed(2);
    };
    

    const profit = (quantity, saleprice, purchaseprice) => {
        const salePrice = parseInt(calculateTotalSalePrice(quantity, saleprice));
        const purchasePrice = parseInt(calculateTotalPurchasePrice(quantity, purchaseprice));
        
        if (isNaN(salePrice) || isNaN(purchasePrice)) {
            return "Invalid input";
        }
        const profitValue = (salePrice - purchasePrice).toFixed(2); 
        return `${profitValue}`; 
    };

    const [totalProfit, setTotalProfit] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [totalPurchase, setTotalPurchase] = useState(0);
    const [purchase, setPurchase] = useState(0);
    const [sales, setSales] = useState(0);

    useEffect(() => {
        const ProductsRef = ref(database, `${userName}Products`);
        onValue(ProductsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const ProductsArray = Object.values(data);
                setProducts(ProductsArray);
                calculateTotals(ProductsArray);
            } else {
                setProducts([]);
                setTotalSales(0);
                setTotalPurchase(0);
                setTotalProfit(0);
                setSales(0);
                setPurchase(0);
            }
        });
    }, []);

    const calculateTotals = (products) => {
        let totalSalesValue = 0;
        let totalPurchaseValue = 0;
        let totalProfitValue = 0;
        let purchaseValue = 0;
        let salesValue = 0;
    
        products.forEach((product) => {
            const salePrice = parseFloat(product.saleprice);
            const purchasePrice = parseFloat(product.purchaseprice);
            const quantity = parseInt(product.quantity);
    
            if (!isNaN(salePrice) && !isNaN(purchasePrice) && !isNaN(quantity)) {
                const totalSalePrice = salePrice * quantity;
                const totalPurchasePrice = purchasePrice * quantity;
                const profit = totalSalePrice - totalPurchasePrice;
    
                totalSalesValue += totalSalePrice;
                totalPurchaseValue += totalPurchasePrice;
                totalProfitValue += profit;
    
                purchaseValue += purchasePrice;
                salesValue += salePrice;
            }
        });
    
        setTotalSales(totalSalesValue.toFixed(2));
        setTotalPurchase(totalPurchaseValue.toFixed(2));
        setTotalProfit(totalProfitValue.toFixed(2));
        setPurchase(purchaseValue.toFixed(2));
        setSales(salesValue.toFixed(2));
    };
    

    
    return (
        <>
            <h1 className="supplier">Products</h1>
            <div className="supplier-container">
                <div className="parent-supplier">
                    <h3>Product Details</h3>
                    <hr />
                    <div className="new-supplier-entry">
                        <div className="data">
                            <label>Supplier Name</label><br />
                            <select name="name" value={newProduct.name} onChange={handleInputChange}>
                                <option value="">Select Supplier</option>
                                {supplierNames.map((supplierName, index) => (
                                    <option key={index} value={supplierName}>{supplierName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="data">
                            <label>Product Name</label><br />
                            <input type="text" placeholder="Enter product name" name="name1" value={newProduct.name1} onChange={handleInputChange}></input>
                        </div>
                        <div className="data">
                            <label>Purchase Price</label><br />
                            <input type="number" min={1} max={1000000} placeholder="Purchase ₹" name="purchaseprice" value={newProduct.purchaseprice} onChange={handleInputChange}></input>
                        </div>
                        <div className="data">
                            <label>Sale Price</label><br />
                            <input type="number" min={1} max={10000000} placeholder="sale ₹" name="saleprice" value={newProduct.saleprice} onChange={handleInputChange}></input>
                        </div>
                        <div className="data">
                            <label>Quantity</label><br />
                            <input type="number" min={1} max={100} placeholder="Qtn." name="quantity" value={newProduct.quantity} onChange={handleInputChange}></input>
                        </div>
                        <div className="data">
                            <label></label><br />
                            <button onClick={handleNewProductSubmit}>New Product</button>
                        </div>
                        <div className="data">
                            <label>Search</label><br />
                            <input     type="text"     placeholder="Search product name"     value={searchQuery}     onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <div className="data">
                            <label></label><br />
                            <button onClick={handleSearch}>Go</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="supplier-data-show">
                <table className="supplier-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Supplier Name</th>
                            <th>Product Name</th>
                            <th>Quantity</th>
                            <th>Purchase Price</th>
                            <th>Sale Price</th>
                            <th>Total Purchase Price</th>
                            <th>Total Sale Price</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                    {(searchQuery.trim() === '' ? Products : filteredProducts).length > 0 ? (
        (searchQuery.trim() === '' ? Products : filteredProducts).map((Product, index) => (
            <tr key={index}>
                <td>{index + 1}</td>
                <td>{Product.name}</td>
                <td>{Product.name1}</td>
                <td>{Product.quantity}</td>
                <td>{parseFloat(Product.purchaseprice).toFixed(2)}</td>
                <td>{parseFloat(Product.saleprice).toFixed(2)}</td>
                <td>{calculateTotalPurchasePrice(Product.quantity, Product.purchaseprice)}</td>
                <td>{calculateTotalSalePrice(Product.quantity, Product.saleprice)}</td>
                <td>
                    <button onClick={() => handleDeleteProduct(Product.name1)}>
                        <AiOutlineDelete className="delete" />
                    </button>
                </td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan="10">No products found</td>
        </tr>
    )}

                    <td style={{fontWeight: "700"}}>Total</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td style={{fontWeight: "700"}}>{purchase}</td>
                    <td style={{fontWeight: "700"}}>{sales}</td>
                    <td style={{fontWeight: "700"}}>{totalPurchase}</td>
                    <td style={{fontWeight: "700"}}>{totalSales}</td>
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Product;
