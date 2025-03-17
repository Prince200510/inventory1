import react, {useState} from 'react';
import { Link, useNavigate, Route, Routes } from 'react-router-dom';
import { ref, set, get } from "firebase/database";
import database from './firebase';

const Forgetpass = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [passcode, setPasscode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPasscode, setShowPasscode] = useState(false);
    const [readText, setReadText] = useState('read');

    const back = () => {
        navigate('/');
    }

    const handleSubmit = async () => {
        setErrorMessage('');
        setSuccessMessage('');
        
        if (!passcode && !username)  {
            setErrorMessage('Please enter a username or passcode.');
            return;
        }

        const userRef = ref(database, `login/${username}`);
        get(userRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    if (userData.passcode === passcode) {
                        setSuccessMessage('Passcode verified successfully!');
                    } else {
                        setErrorMessage('Incorrect passcode.');
                    }
                } else {
                    setErrorMessage('Username not found.');
                }
            })
            .catch((error) => {
                console.error('Error checking passcode:', error);
                setErrorMessage('Error checking passcode. Please try again later.');
            });
    };

    const handleChangePassword = async () => {
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
    
        if (!newPassword) {
            setErrorMessage('Please enter a new password.');
            return;
        }
    
        if (!passwordRegex.test(newPassword)) {
            setErrorMessage('Password must be at least 6 characters long and contain at least one numeric value and one special character.');
            return;
        }
            const userRef = ref(database, `login/${username}`);
        get(userRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    set(userRef, { ...userData, password: newPassword })
                        .then(() => {
                            setSuccessMessage('Password changed successfully!');
                            navigate('/')
                        })
                        .catch((error) => {
                            console.error('Error changing password:', error);
                            setErrorMessage('Error changing password. Please try again later.');
                        });
                } else {
                    setErrorMessage('User data not found.');
                }
            })
            .catch((error) => {
                console.error('Error retrieving user data:', error);
                setErrorMessage('Error retrieving user data. Please try again later.');
            });
    };
    const togglePasscodeVisibility = () => {
        setShowPasscode(!showPasscode);
        setReadText(showPasscode ? 'read' : 'close');
    };



    return (
        <>
        <div class="forgetpass-container">
            <div class="child-forgetpass">
                <h2 style={{display: "flex", justifyContent: "center"}}>Forget Password</h2>
                <hr></hr>
                <p style={{margin: "0px",}}>How to get passcode, <span style={{cursor: "pointer", color: "blue", textDecoration: "underline"}} onClick={togglePasscodeVisibility}>{readText}</span></p>
                {showPasscode && <p style={{margin: "3px 0px"}}>While registering, a user receives their passcode. It is necessary to keep a copy of this passcode as it is required in case the user forgets their password. If you do not have your passcode, please contact <span style={{color: "blue"}}>9987742369</span> or email <span style={{color: "blue"}}>princemaurya8879@gmail.com</span></p>}

                <hr></hr>
                <label>Username</label><br></br>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder='Enter your username'></input><br></br>
                <label>Passcode</label><br></br>
                <input type="text" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder='Enter your passcode'></input><br></br>
                <button style={{backgroundColor: "green", border: "none"}} onClick={handleSubmit}>Verify</button>
                <button style={{backgroundColor: "red", border: "none"}} onClick={back}>Go Back</button>
                {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
                {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
                {successMessage && (
                        <div className="change-password">
                        <h3>Change Password</h3>
                        <label>New Password</label><br />
                        <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder='Enter new password'/><br />
                        <button style={{backgroundColor: "green", border: "none"}}  onClick={handleChangePassword}>Submit</button>
                    </div>
                    )}
            </div>
        </div>
        </>
    );
};

export default Forgetpass;