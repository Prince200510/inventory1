import React, { useState, useEffect } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import database from './firebase';
import { ref, get, onValue } from 'firebase/database';
import { useLocation } from 'react-router-dom';

const HistorySale = () => {
    const [customers, setCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const location = useLocation();
    const { userName } = location.state;

    useEffect(() => {
        const fetchCustomerData = () => {
            const customerRef = ref(database, `${userName}Customers`);
            onValue(customerRef, (snapshot) => {
                if (snapshot.exists()) {
                    const customerList = Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
                    setCustomers(customerList);
                } else {
                    setCustomers([]);
                }
            });
        };
        
        fetchCustomerData();
    }, []);

    const calculateProfit = (product) => {
        return (product.quantity * (parseFloat(product.salePrice) - parseFloat(product.purchasePrice))).toFixed(2);
    };

    const filterCustomersByMonth = (customerList, month) => {
        if (month === 'all') {
            return customerList;
        } else {
            return customerList.filter(customer => {
                const customerDate = new Date(customer.date);
                return customerDate.getMonth() + 1 === parseInt(month);
            });
        }
    };

    const filteredCustomers = filterCustomersByMonth(customers, selectedMonth);

    return (
        <>
            <h1 className="supplier">Sales History</h1>
            <div className="supplier-container">
                <div className="parent-supplier">
                    <select style={{padding: "8px", marginLeft: "20px"}} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                        <option value="all">All Months</option>
                        {[...Array(12).keys()].map(month => (
                            <option key={month + 1} value={month + 1}>{month + 1}</option>
                        ))}
                    </select>
                </div>
                <div className="supplier-data-show">
                    <table className="supplier-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>username</th>
                                <th>Customer Name</th>
                                <th>Purchased Product</th>
                                <th>Qtn</th>
                                <th>Date</th>
                                <th>Discount</th>
                                <th>Order Total</th>
                                <th>CGST</th>
                                <th>SGST</th>
                                <th>Final Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{customer.username}</td>
                                        <td>{customer.customerName}</td>
                                        <td>
                                            {customer.products && customer.products.length > 0 ? (
                                                customer.products.map((product, index) => (
                                                    <div key={index}>
                                                        <div>{product.productName}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div>No products</div>
                                            )}
                                        </td>
                                        <td>
                                            {customer.products && customer.products.length > 0 ? (
                                                customer.products.map((product, index) => (
                                                    <div key={index}>
                                                        <div>{product.quantity}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div>No quantities</div>
                                            )}
                                        </td>
                                        <td>{customer.date}</td>
                                        <td>{customer.discount}</td>
                                        <td>{customer.orderTotal}</td>
                                        <td>{customer.cgst}</td>
                                        <td>{customer.sgst}</td>
                                        <td>{customer.finalTotal}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9">No data found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default HistorySale;
