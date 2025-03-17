import React, { useState, useEffect } from 'react';
import database from './firebase';
import { ref, onValue, get, child } from 'firebase/database';
import './Dashboard.css';
import { FaTruck, FaChartBar, FaChartLine, FaShoppingCart, FaBoxOpen, FaUser, FaUserFriends } from 'react-icons/fa';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryPie, VictoryLabel, VictoryLine, VictoryArea } from 'victory';
import { useLocation } from 'react-router-dom';

const Report1 = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [purchaseOrderCount, setPurchaseOrderCount] = useState(0);
    const [supplierCount, setSupplierCount] = useState(0);
    const [historycount, sethistorycount] = useState(0);
    const [purchaseHistory, setPurchaseHistory] = useState({});
    const [chartType, setChartType] = useState('bar');
    const [sale, setSale] = useState(0);
    const [sale1, setSale1] = useState(0);
    const [customerName, SetCustomerName] = useState('');
    const location = useLocation();
    const { userName } = location.state; 

    useEffect(() => {
        const productsRef = ref(database, `${userName}Products`);
        onValue(productsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const productsArray = Object.values(data);
                setProducts(productsArray);

                if (productsArray.length > 0) {
                    setSelectedProduct(productsArray[0].name1);
                    setQuantity(productsArray[0].quantity);
                }
            } else {
                setProducts([]);
            }
        });

        const suppliersRef = ref(database, `${userName}suppliers`);
        onValue(suppliersRef, (snapshot) => {
        console.log("Suppliers Snapshot:", snapshot.val()); 
        if (snapshot.exists()) {
            let count = 0;
            snapshot.forEach(() => {
                count++;
            });
            setSupplierCount(count);
        } else {
            setSupplierCount(0);
        }
        });

        const saleRef = ref(database, `${userName}Customers`);
        onValue(saleRef, (snapshot) => {
        console.log("Sales Snapshot:", snapshot.val()); 
        if (snapshot.exists()) {
            let count = 0;
            snapshot.forEach(() => {
                count++;
            });
            setSale(count);
        } else {
            setSale(0);
        }
        });

        const currentDate = new Date();
const currentMonth1 = currentDate.getMonth() + 1; 

onValue(saleRef, (snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        let currentMonthCount = 0; 
        Object.values(data).forEach(order => {
            const dateTime = order.date; 
            if (dateTime) { 
                const [datePart, timePart] = dateTime.split(", "); 
                const [dateStr, timeStr] = datePart.split("/");
                const month = parseInt(dateStr); 
                const year = parseInt(timeStr);
                if (month === currentMonth1) {
                    currentMonthCount++;
                }
            }
        });
        
        console.log("Count of orders for the current month:", currentMonthCount);
        setSale1(currentMonthCount);
    } else {
        console.log("No data available.");
        setSale1(0);
    }
});

        
        

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const purchaseOrdersRef = ref(database, `${userName}purchase`);
    onValue(purchaseOrdersRef, (snapshot) => {
        if (snapshot.exists()) {
            let count = 0;
            snapshot.forEach((childSnapshot) => {
                const dateTime = childSnapshot.val().dateTime;
                const [datePart, timePart] = dateTime.split(", "); 
                const [dateStr, timeStr] = datePart.split("/");
                const month = parseInt(dateStr); 
                if (month === currentMonth) {
                    count++;
                }
            });
            setPurchaseOrderCount(count);
        } else {
            setPurchaseOrderCount(0);
        }

    });
    
    

    onValue(purchaseOrdersRef, (snapshot) => {
        if (snapshot.exists()) {
            let counts = 0;
            snapshot.forEach(() => {
                counts++;
            });
            sethistorycount(counts);
        } else {
            sethistorycount(0);
        }
    });

    onValue(purchaseOrdersRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const history = {};
            Object.values(data).forEach(order => {
                const dateTime = order.dateTime;
                const [datePart, timePart] = dateTime.split(", "); 
                const [dateStr, timeStr] = datePart.split("/");
                const month = parseInt(dateStr); 
                const year = parseInt(timeStr);

                if (!history[year]) {
                    history[year] = {};
                }

                if (!history[year][month]) {
                    history[year][month] = 0;
                }

                history[year][month]++;
            });

            setPurchaseHistory(history);
        } else {
            setPurchaseHistory({});
        }
    });

    onValue(saleRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const uniqueCustomers = new Set(); 
            Object.values(data).forEach(order => {
                const dateTime = order.date; 
                const customerName = order.customerName; 
                if (dateTime && customerName) { 
                    const [datePart, timePart] = dateTime.split(", "); 
                    const [dateStr, timeStr] = datePart.split("/");
                    const month = parseInt(dateStr); 
                    const year = parseInt(timeStr);
                    if (month === currentMonth) {
                        uniqueCustomers.add(customerName); 
                    }
                }
            });
            
            console.log("Count of unique customer names for the current month:", uniqueCustomers.size);
            SetCustomerName(uniqueCustomers.size);
        } else {
            console.log("No data available.");
            SetCustomerName('');
        }
    });

    }, []);

    const prepareChartData = () => {
        const data = [];
        const monthlyCounts = Array.from({ length: 12 }, () => 0);
        for (const year in purchaseHistory) {
            const yearData = purchaseHistory[year];
            for (let month = 1; month <= 12; month++) {
                const count = yearData[month] || 0;
                monthlyCounts[month - 1] += count; 
            }
        }
        for (let month = 1; month <= 12; month++) {
            data.push({ x: `${month}`, y: monthlyCounts[month - 1] });
        }
        return data;
    };
    const handleProductChange = (e) => {
        const selectedProductName = e.target.value;
        setSelectedProduct(selectedProductName);
        const selectedProduct = products.find(product => product.name1 === selectedProductName);
        if (selectedProduct) {
            setQuantity(selectedProduct.quantity);
        } else {
            setQuantity(0);
        }
    };
    
    const generateYAxisTicks = () => {
        const maxYValue = Math.ceil(Math.max(...prepareChartData().map(dataPoint => dataPoint.y)));
        return Array.from({ length: maxYValue }, (_, index) => index + 1);
    };
    const handleChangeChartType = (event) => {
        const selectedChartType = event.target.value;
        console.log("Selected Chart Type:", selectedChartType); 
        setChartType(selectedChartType);
    };
    
    const renderChart = () => {
        if (chartType === 'bar') {
            return (
                <div className="report-chart-bar">
                    <VictoryChart theme={VictoryTheme.material} domainPadding={20}>
                        <VictoryAxis label="Month" />
                        <VictoryAxis dependentAxis label="Purchase" tickValues={generateYAxisTicks()} />
                        <VictoryBar
                            data={prepareChartData()}
                            style={{ data: { fill: "green" } }}
                        />
                    </VictoryChart>
                </div>
            );
        } else if (chartType === 'pie') {
            return (
                <div className="report-chart-bar">
                    <VictoryPie
                        data={prepareChartData()}
                        colorScale="qualitative"
                        labelComponent={<VictoryLabel renderInPortal dy={20}/>}
                        labels={({ datum }) => `${datum.x}\n${datum.y}`}
                    />
                </div>
            );
        } else if (chartType === 'line') {
            return (
                <div className="report-chart-bar">
                    <VictoryChart theme={VictoryTheme.material} domainPadding={20}>
                        <VictoryAxis label="Month" />
                        <VictoryAxis dependentAxis label="Purchase" tickValues={generateYAxisTicks()} />
                        <VictoryLine
                            data={prepareChartData()}
                            style={{ data: { stroke: "blue" } }}
                        />
                    </VictoryChart>
                </div>
            );
        } else if (chartType === 'area') {
            return (
                <div className="report-chart-bar">
                    <VictoryChart theme={VictoryTheme.material} domainPadding={20}>
                        <VictoryAxis label="Month" />
                        <VictoryAxis dependentAxis label="Purchase" tickValues={generateYAxisTicks()} />
                        <VictoryArea
                            data={prepareChartData()}
                            style={{ data: { fill: "orange" } }}
                        />
                    </VictoryChart>
                </div>
            );
        }
    };

    
    return (
        <>
        <div class="report1-container">
            <h2>Dashboard</h2>
            <div class="report1-child">
                <div className="report-item">
                    <div class="logo-report">
                        <h2><FaTruck class="icons-report"/></h2>
                    </div>
                    <div class="report-content">
                        <p>Purchases</p>
                        <h3>{historycount}</h3>
                        <h4>New Purchases</h4>
                    </div>
                </div>
                <div className="report-item">
                    <div class="logo-report" style={{backgroundColor: "#23A7E3"}}>
                        <h2><FaChartBar class="icons-report" /></h2>
                    </div>
                    <div class="report-content">
                        <p>Sales - History</p>
                        <h3>{sale}</h3>
                        <h4>New Sales</h4>
                    </div>
                </div>
                <div className="report-item">
                    <div class="logo-report" style={{backgroundColor: "#23A7E3"}}>
                        <h2><FaShoppingCart class="icons-report" /></h2>
                    </div>
                    <div class="report-content">
                        <p>Sales Orders - {new Date().toLocaleString('default', { month: 'long' })}</p>
                        <h3>{sale1}</h3>
                        <h4>New Sale</h4>
                    </div>
                </div>
                <div className="report-item">
                    <div class="logo-report">
                        <h2><FaShoppingCart class="icons-report" /></h2>
                    </div>
                    <div class="report-content">
                        <p>Purchases Orders - {new Date().toLocaleString('default', { month: 'long' })}</p>
                        <h3>{purchaseOrderCount}</h3>
                        <h4>New Purchases</h4>
                    </div>
                </div>
                <div className="report-item">
                    <div class="logo-report" style={{backgroundColor: "grey"}}>
                        <h2><FaBoxOpen class="icons-report"/></h2>
                    </div>
                    <div class="report-content">
                        <p>Product<select value={selectedProduct} onChange={handleProductChange}>
                            {products.map((product, index) => (
                                <option key={index} value={product.name1}>{product.name1}</option>
                            ))}
                        </select></p> 
                        <h3>{quantity}</h3>
                        <h4>Quantity</h4>
                    </div>
                </div>
                <div className="report-item">
                    <div class="logo-report"  style={{backgroundColor: "orange"}}>
                        <h2><FaUser class="icons-report"/></h2>
                    </div>
                    <div class="report-content">
                        <p>Suppliers</p>
                        <h3>{supplierCount}</h3>
                        <h4>New Suppliers</h4>
                    </div>
                </div>
                <div className="report-item">
                    <div class="logo-report" style={{backgroundColor: "red"}}>
                        <h2><FaUserFriends class="icons-report"/></h2>
                    </div>
                    <div class="report-content">
                        <p>Customers</p>
                        <h3>{customerName}</h3>
                        <h4>New Customers</h4>
                    </div>
                </div>
            </div>
            <h2>Chart</h2>
            <div className="report1-container-1">
                {renderChart()}
            </div>
            <div class="report-selection">
                <select value={chartType} onChange={handleChangeChartType} class="bar">
                    <option value="bar">Bar Chart</option>
                    <option value="pie">Pie Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="area">Area Chart</option>
                </select>
                <p>Purchase Report </p>
            </div>
        </div>
        </>
    );
};

export default Report1;