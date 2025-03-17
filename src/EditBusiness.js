import React, { useState, useEffect } from 'react';
import database from './firebase';
import { ref, get, set } from 'firebase/database';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';

const EditBusiness = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userName } = location.state;
    const [businessInfo, setBusinessInfo] = useState({
        name: '',
        businessName: '',
        phoneNumber1: '',
        phoneNumber2: '',
        websiteName1: '',
        websiteName2: '',
        address: ''
    });

    useEffect(() => {
        const fetchBusinessInfo = async () => {
            try {
                const businessRef = ref(database, `${userName}BusinessInfo`);
                const snapshot = await get(businessRef);
                if (snapshot.exists()) {
                    setBusinessInfo(snapshot.val());
                } else {
                    console.log("No business information available.");
                }
            } catch (error) {
                console.error('Error fetching business information:', error);
            }
        };

        fetchBusinessInfo();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setBusinessInfo(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    const handleUpdate = () => {
        set(ref(database, `${userName}BusinessInfo`), businessInfo)
            .then(() => {
                console.log('Business information updated successfully!');
                Swal.fire({
                    title: 'Success!',
                    text: 'Business Information is Updated successfully.',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                });
                navigate("/Bussiness");
            })
            .catch((error) => {
                console.error('Error updating business information:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Error updating business information',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            });
    };

    return (
        <div className="supplier-container">
            <div className="parent-editbusiness">
                <div className="child-editbusiness">
                    <label>Name</label><br />
                    <input id="name" type="text" value={businessInfo.name} onChange={handleChange} />
                </div>
                <div className="child-editbusiness">
                    <label>Business Name</label><br />
                    <input id="businessName" type="text" value={businessInfo.businessName} onChange={handleChange} />
                </div>
            </div>
            <div className="parent-editbusiness">
                <div className="child-editbusiness">
                    <label>Phone Number 1</label><br />
                    <input id="phoneNumber1" type="text" value={businessInfo.phoneNumber1} onChange={handleChange} />
                </div>
                <div className="child-editbusiness">
                    <label>Phone Number 2</label><br />
                    <input id="phoneNumber2" type="text" value={businessInfo.phoneNumber2} onChange={handleChange} />
                </div>
                <div className="child-editbusiness">
                    <label>Website name 1</label><br />
                    <input id="websiteName1" type="text" value={businessInfo.websiteName1} onChange={handleChange} />
                </div>
                <div className="child-editbusiness">
                    <label>Website name 2</label><br />
                    <input id="websiteName2" type="text" value={businessInfo.websiteName2} onChange={handleChange} />
                </div>
            </div>
            <div className="parent-editbusiness">
                <div className="child-editbusiness">
                    <label>Address</label><br />
                    <textarea id="address" style={{ width: "300px", height: "50px", marginTop: "10px", resize: "none", padding: "8px" }} value={businessInfo.address} onChange={handleChange}></textarea>
                </div>
            </div>
            <div className="business-edit-button">
                <button onClick={handleUpdate}>Update</button>
            </div>
        </div>
    );
};
export default EditBusiness;