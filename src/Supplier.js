import React, { useState, useEffect } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import database from './firebase';
import { ref, push, onValue, remove, child, set, get, orderByChild, exists, forEachChild, val} from 'firebase/database';
import Swal from 'sweetalert2'
import { useLocation } from 'react-router-dom';

const Supplier = () => {
    const location = useLocation();
    const { userName } = location.state; 
    const [suppliers, setSuppliers] = useState([]);
    const [newSupplier, setNewSupplier] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        address: ''
    });

    useEffect(() => {
        const suppliersRef = ref(database, `${userName}suppliers`);
        onValue(suppliersRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const suppliersArray = Object.values(data);
                setSuppliers(suppliersArray);
            } else {
                setSuppliers([]);
            }
        });
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSupplier({ ...newSupplier, [name]: value });
    };

    const handleNewSupplierSubmit = () => {
        if (!newSupplier.name || !newSupplier.email || !newSupplier.phoneNumber || !newSupplier.address) {
            alert("Please fill out all fields");
            return;
        }
        const suppliersRef = ref(database, `${userName}suppliers`);
        const newSupplierRef = push(suppliersRef);
        const newSupplierKey = newSupplierRef.key;
        const supplierData = {
            name: newSupplier.name,
            email: newSupplier.email,
            phoneNumber: newSupplier.phoneNumber,
            address: newSupplier.address
        };
        const supplierNameRef = ref(database, `${userName}suppliers/` + newSupplier.name);
        set(supplierNameRef, supplierData);
        setNewSupplier({
            name: '',
            email: '',
            phoneNumber: '',
            address: ''
        });
    };
    
    const handleDeleteSupplier = async (supplierName) => {
        if (!supplierName) {
            console.error('Supplier name is not defined.');
            Swal.fire({
                title: 'Error!',
                text: 'Supplier name is not defined.',
                icon: 'error',
                confirmButtonText: 'Ok'
              })
            return;
        }
        try {
            const supplierRef = ref(database, `${userName}suppliers/` + supplierName);
            await remove(supplierRef);
            Swal.fire({
                title: "Supplier deatils have been deleted!",
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
    
    return (
        <>
            <h1 class="supplier">Suppliers</h1>
            <div class="supplier-container">
                <div class="parent-supplier">
                    <h3>Supplier Details</h3>
                    <hr></hr>
                    <div class="new-supplier-entry">
                        <div class="data">
                            <label>Name</label><br></br>
                            <input type="text" placeholder="Enter name" name="name" value={newSupplier.name} onChange={handleInputChange}></input>
                        </div>
                        <div class="data">
                            <label>Email</label><br></br>
                            <input type="text" placeholder="Enter email" name="email" value={newSupplier.email} onChange={handleInputChange}></input>
                        </div>
                        <div class="data">
                            <label>Phone Number</label><br></br>
                            <input type="text" placeholder="Enter phone number" name="phoneNumber" value={newSupplier.phoneNumber} onChange={handleInputChange}></input>
                        </div>
                        <div class="data">
                            <label>Address</label><br></br>
                            <input type="text" placeholder="Enter address" name="address" value={newSupplier.address} onChange={handleInputChange}></input>
                        </div>
                        <div class="data">
                            <label></label><br></br>
                            <button onClick={handleNewSupplierSubmit}>New Supplier</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="supplier-data-show">
                <table class="supplier-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                            <th>Address</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                    {suppliers.map((supplier, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{supplier.name}</td>
                            <td>{supplier.email}</td>
                            <td>{supplier.phoneNumber}</td>
                            <td>{supplier.address}</td>
                            <td>
                                <button onClick={() => handleDeleteSupplier(supplier.name)}>
                                    <AiOutlineDelete className="delete" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Supplier;
