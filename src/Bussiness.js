import React, { useState, useEffect } from 'react';
import { AiOutlineEnvironment, AiOutlineLink, AiOutlinePhone } from 'react-icons/ai';
import EditBusiness from './EditBusiness.js';
import database from './firebase';
import { ref, onValue } from 'firebase/database';
import { useLocation } from 'react-router-dom';

const Business = () => {
    const [currentComponent, setCurrentComponent] = useState();
    const [businessInfo, setBusinessInfo] = useState(null);
    const [showContent, setShowContent] = useState(true);
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
    }, []);

    const handleEditBusinessClick = () => {
        setCurrentComponent(<EditBusiness />);
        setShowContent(false);
    };

    return(
        <>
        <h1 className="supplier">My Business Information</h1>
        {(showContent || !businessInfo) && (
            <div className="supplier-container">
                <div className="parent-business">
                    <div className="sub-parent-business">
                        <div className="child-business">
                            <div className="sub-child-business">
                                <h3>{businessInfo ? businessInfo.name : 'No business information available'}</h3>
                                <hr />
                                <div className="business-details">
                                    <h2><AiOutlinePhone /></h2>
                                    <div className="sub-business-details">
                                        <p>{businessInfo ? businessInfo.phoneNumber1 : '-'}</p>
                                        <p>{businessInfo ? businessInfo.phoneNumber2 : '-'}</p>
                                    </div>
                                </div>
                                <div className="business-details">
                                    <h2><AiOutlineLink /></h2>
                                    <div className="sub-business-details">
                                        <p>{businessInfo ? businessInfo.websiteName1 : '-'}</p>
                                        <p>{businessInfo ? businessInfo.websiteName2 : '-'}</p>
                                    </div>
                                </div>
                                <div className="business-details">
                                    <h2><AiOutlineEnvironment /></h2>
                                    <div className="sub-business-details">
                                        <p className="line-break">{businessInfo ? businessInfo.address : '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="child-business">
                            <div className="business-icons">
                                <img style={{width: "50px", height: "auto", borderRadius: "50%", marginLeft: "55px"}} src="logo192.png" alt="Logo"></img>
                                <h2 class="line-break1" style={{color: "#fff", marginLeft: "-10px", marginTop: "0px"}}>{businessInfo ? businessInfo.businessName : 'No business information available'}</h2>
                            </div>
                            <img src="business.png" alt="Business"></img>
                        </div>
                    </div>
                </div>
                <div className="business-edit-button">
                    <button onClick={handleEditBusinessClick}>Edit</button>
                </div>
            </div>
        )}
        {currentComponent}
        </>
    );
};

export default Business;
