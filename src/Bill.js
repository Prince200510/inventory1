import React, { useState, useEffect } from 'react';
import database from './firebase';
import { ref, onValue } from 'firebase/database';
import { useLocation } from 'react-router-dom';

const Bill = () => {
    const [businessInfo, setBusinessInfo] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('all');
    const location = useLocation();
    const { userName } = location.state;
    
    useEffect(() => {
        const businessRef = ref(database, `${userName}BusinessInfo`);
        onValue(businessRef, (snapshot) => {
            if (snapshot.exists()) {
                setBusinessInfo(snapshot.val());
            } else {
                setBusinessInfo(null);
            }
        });

        const fetchCustomerData = () => {
            const customerRef = ref(database, `${userName}Customers`);
            onValue(customerRef, (snapshot) => {
                if (snapshot.exists()) {
                    const customerList = Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
                    customerList.sort((a, b) => new Date(b.date) - new Date(a.date));
                    const mostRecentData = customerList.length > 0 ? [customerList[0]] : [];
                    setCustomers(mostRecentData);
                } else {
                    setCustomers([]);
                }
            });
        };
        fetchCustomerData();
    }, []);

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

    const customerNames = filteredCustomers.map((customer, index) => (
        <p key={index}>Customer Name : <span>{customer.customerName}</span></p>
    ));

    const date = filteredCustomers.map((customer, index) => (
        <p key={index}>Date : <span>{customer.date}</span></p>
    ));

    const discount = filteredCustomers.map((customer, index) => (
        <p key={index}>Discount : <span style={{marginLeft: "40px"}}>{customer.discount}</span></p>
    ));

    const totalorder = filteredCustomers.map((customer, index) => (
        <p key={index}>Total Price : <span style={{marginLeft: "27px"}}>{customer.orderTotal}</span></p>
    ));

    const cgst = filteredCustomers.map((customer, index) => (
        <p key={index}>CGST : <span style={{marginLeft: "64px"}}>{customer.cgst}</span></p>
    ));

    const sgst = filteredCustomers.map((customer, index) => (
        <p key={index}>SGST : <span style={{marginLeft: "64px"}}>{customer.sgst}</span></p>
    ));

    const finalTotal = filteredCustomers.map((customer, index) => (
        <p key={index}>Final Amount : <span>{customer.finalTotal}</span></p>
    ));

     const printInvoice = () => {
        const printContents = document.getElementById('parent-bill').innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
    };

    return (
        <div className="supplier-container">
            <div class="bill-center">
            <div className="parent-bill" id="parent-bill">
                <div className="child-bill" style={{ display: "flex", justifyContent: "center" }}>
                    <h2>Invoice</h2>
                </div>
                <div className="child-bill-1">
                    <h2>{businessInfo?.businessName}</h2>
                    <p>Contact No : <span>{businessInfo?.phoneNumber1} / {businessInfo?.phoneNumber1}</span></p>
                    <p>Website : <span>{businessInfo?.websiteName1}</span></p>
                    <p>Address : <span>{businessInfo?.address}</span></p>
                    <hr className="dashed-line" />
                    {customerNames}
                    {date}
                    <hr className="dashed-line" />
                    <table className="bill-table">
                        <thead>
                            <tr>
                                <th style={{paddingRight: "50px"}}>Purchased Product</th>
                                <th style={{paddingRight: "50px"}}>Qtn</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer, index) => (
                                    <tr key={index}>
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
                                        <td>
                                            {customer.products && customer.products.length > 0 ? (
                                                customer.products.map((product, index) => (
                                                    <div key={index}>
                                                        <div>{product.salePrice}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div>No quantities</div>
                                            )}
                                        </td>
                                    
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9">No data found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <p>-------------------------------------------------</p>
                    {discount}
                    {totalorder}
                    {cgst}
                    {sgst}
                    <p>-------------------------------------------------</p>
                    {finalTotal}
                </div>
                <button onClick={printInvoice} class="print">Print PDF</button>
                <p>Thank You for Shopping !!</p>
            </div>
            </div>
        </div>
    );
};

export default Bill;
