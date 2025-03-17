import { useLocation, Navigate, useNavigate, Link, Route, Routes, Outlet } from 'react-router-dom';
import './Dashboard.css';
import { AiOutlineSearch, AiOutlineDown, AiOutlineDelete } from 'react-icons/ai';
import { FaPalette, FaNewspaper, FaTruck, FaBox } from 'react-icons/fa';
import { IoCartOutline, IoPeopleOutline, IoSettingsOutline } from 'react-icons/io5';
import React, { useState } from 'react';
import Report1 from './Report1';
import Supplier from './Supplier';
import Product from './Product';
import Purchase from './Purchase';
import NewSale from './NewSale.js';
import HistorySale from './HistorySale';
import Bussiness from './Bussiness.js';
import EditBusiness from './EditBusiness';
import Bill from './Bill';

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const username = location?.state?.userName;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDropdownOpen1, setIsDropdownOpen1] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const toggleDropdown1 = () => {
        setIsDropdownOpen1(!isDropdownOpen1);
    };

    const [currentComponent, setCurrentComponent] = useState(<Report1 />);
    
    const handleDashboardClick = () => {
        setCurrentComponent(<Report1 />);
    };

    const handleSupplierClick = () => {
        setCurrentComponent(<Supplier />);
    };

    const handleProductClick = () => {
        setCurrentComponent(<Product />);
    };

    const handlePurchaseClick = () => {
        setCurrentComponent(<Purchase />);
    }

    const handleNewSaleClick = () => {
        setCurrentComponent(<NewSale />);
    }

    const handleHistorySaleClick = () => {
        setCurrentComponent(<HistorySale />);
    }

    const handleBussinessClick = () => {
        setCurrentComponent(<Bussiness />);
    }


    if (!username) {
        return <Navigate to="/login" />;
    }

    const handleLogout = () => {
        localStorage.removeItem('loggedInUser'); // Remove saved credentials from local storage
        navigate('/');
      };
    return (
        <div>
            <div class="login-details">
                <h2>Inventory Management</h2>
                <div class="nav-bar-login">
                    <ul>
                        <li><Link to="">admin</Link></li>
                        
                            <li><Link to="/" onClick={handleLogout}>Logout</Link></li>
  
                    </ul>
                </div>
            </div>
            <div class="dashboard">
                <div class="nav-bar">
                    <ul>
                    <li onClick={handleDashboardClick}><FaPalette className="icons" />Dashboard</li>
                        <li onClick={handleNewSaleClick}><FaNewspaper class="icons" />New Sale</li>
                        <li>
                            <div className="dropdown" onClick={toggleDropdown}>
                                <IoCartOutline className="icons" />Sales<span><AiOutlineDown className="icons" /></span>
                                {isDropdownOpen && (
                                    <ul className="dropdown-menu">
                                        <li  onClick={handleNewSaleClick} style={{ margin: "4px", marginLeft: "-20px" }}><FaNewspaper class="icons" />New Sale</li>
                                        <li onClick={handleHistorySaleClick} style={{ margin: "4px", marginBottom: "0px", marginLeft: "-20px" }}><AiOutlineSearch class="icons" />Sales History</li>
                                    </ul>
                                )}
                            </div>
                        </li>
                        <li onClick={handlePurchaseClick}><FaTruck class="icons" />Purchases</li>
                        <li onClick={handleProductClick}><FaBox class="icons" />Product</li>
                        <li onClick={handleSupplierClick}><IoPeopleOutline class="icons" />Suppliers</li>
                        <li>
                            <div className="dropdown1" onClick={toggleDropdown1}>
                                <IoSettingsOutline className="icons" />Settings<span style={{ marginLeft: "50px" }}><AiOutlineDown className="icons" /></span>
                                {isDropdownOpen1 && (
                                    <ul className="dropdown-menu">
                                        <li onClick={handleBussinessClick} style={{ margin: "4px", marginLeft: "-20px" }}><FaNewspaper class="icons" />My Business Info</li>
                                    </ul>
                                )}
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="main-content">
                {currentComponent}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
