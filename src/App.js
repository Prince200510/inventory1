import './App.css';
import database from './firebase';
import { ref, set, get } from "firebase/database";
import Dashboard from './Dashboard';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Route, Routes } from 'react-router-dom';
import Forgetpass from './Forgetpass';

function App() {
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); 
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    generatePassword();
  }, []);
  

  const generatePassword = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      password += characters[randomIndex];
    }
    setGeneratedPassword(password);
  };

  const handleCopyPasscode = () => {
    navigator.clipboard.writeText(generatedPassword)
      .then(() => {
        setCopyButtonText('Copied!');
        setTimeout(() => {
          setCopyButtonText('Copy Passcode');
        }, 2000); 
      })
      .catch((error) => {
        console.error('Error copying passcode:', error);
      });
  };

  const handleLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('');
  
    if (!userName.trim()) {
      setErrorMessage('Please enter your username');
      return;
    }
  
    if (!password.trim()) {
      setErrorMessage("Please enter your password");
      return;
    }
  
    const userRef = ref(database, `login/${userName}`);
    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          if (userData.password === password) {
            // Save username and password to local storage
            localStorage.setItem('loggedInUser', JSON.stringify({ userName, password }));
  
            setSuccessMessage('Login successful!');
            navigate('./Dashboard', { state: { userName } });
            setUserName('');
            setPassword('');
            setErrorMessage('');
            setSuccessMessage('');
          } else {
            setErrorMessage('Password is incorrect');
          }
        } else {
          setErrorMessage('Username not found');
          setUserName('');
          setPassword('');
        }
      })
      .catch((error) => {
        console.error('Error logging in:', error);
        setErrorMessage('Error logging in. Please try again later.');
      });
  };
  
  // Add this function to check if the user is already logged in when the component mounts
  const checkLocalStorage = () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const { userName, password } = JSON.parse(loggedInUser);
      setUserName(userName);
      setPassword(password);
      handleLogin(); // Automatically attempt login with saved credentials
    }
  };
  
  // Call the checkLocalStorage function when the component mounts
  useEffect(() => {
    checkLocalStorage();
  }, []);
  

  const handleSignUp = () => {
    setErrorMessage('');
    setSuccessMessage('');
  
    if (!name.trim() || !userName.trim() || !password.trim() || !email.trim() || !mobile.trim()) {
      setErrorMessage('Please fill in all the fields');
      return;
    }

    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{6,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMessage('Password should contain at least one numeric digit, one special character, and have a minimum length of 6 characters');
      return;
    }


    const userRef = ref(database, `login/${userName}`);
    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setErrorMessage('Username already exists');
          setErrorMessage('');
          setSuccessMessage('');
          setUserName('');
          setName('');
          setPassword('');
          setEmail('');
          setMobile('');
        } else {
          const userData = {
            name: name,
            password: password,
            email: email,
            mobile: mobile,
            passcode: generatedPassword
          };
          set(ref(database, `login/${userName}`), userData)
            .then(() => {
              setSuccessMessage('Registration successful! Please log in.');
              setIsSignUp(false); 
              setUserName('');
              setName('');
              setPassword('');
              setEmail('');
              setMobile('');
            })
            .catch((error) => {
              console.error('Error registering user:', error);
              setErrorMessage('Error registering user. Please try again later.');
            });
        }
      })
      .catch((error) => {
        console.error('Error checking username:', error);
        setErrorMessage('Error checking username. Please try again later.');
      });
  };
  
  const handleSignIn = () => {
    setIsSignUp(false);
    setErrorMessage('');
    setSuccessMessage('');
    setUserName('');
    setPassword('');
    setEmail('');
    setMobile('');
  };
  
  return (
    <>
      {location.pathname !== '/Dashboard' && location.pathname !== '/Forgetpass' && (
        <div className="section-login">
          <div className="child-login">
            <div className="sub-child-login">
              <img src="bg1.jpeg" alt="Background" />
              <h1>Inventory Management <br />System</h1>
              <h3 style={{color: "#fff", margin:"0px"}}>Get a Free Inventory System for Your Business Work.</h3>
              <h4 style={{color: "#fff", margin:"0px", fontWeight: "400"}}>How to use ? Read a <a href="/documentation.html" target="_blank" rel="noopener noreferrer">Documentation</a></h4>
              <p>&copy; Inventory Management System, Developer - Prince Maurya, <a href="https://prince5.netlify.app/" target="_blank" rel="noopener noreferrer"> Know more</a></p>
            </div>
          </div>
          <div className="main-login">
            <div className="parent-login">
              {isSignUp ? (
                <>
                  <h3>Sign Up</h3>
                  <hr />
                  <label>Name <span style={{ color: "red" }}>*</span></label><br />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" required /><br />
                  <label>Username <span style={{ color: "red" }}>*</span></label><br />
                  <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Enter your username" required /><br />
                  <label>Email - ID <span style={{ color: "red" }}>*</span></label><br />
                  <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email id" required /><br />
                  <label>Mobile No <span style={{ color: "red" }}>*</span></label><br />
                  <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Enter your mobile number" required /><br />
                  <label>New Password <span style={{ color: "red" }}>*</span></label><br />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your new password" required /><br />
                  <label>Note * If password forget then remember this passcode</label>
                  <div class = "passcode">
                    <input type="text" value={generatedPassword} readOnly />
                    <button onClick={handleCopyPasscode}>{copyButtonText}</button>
                  </div>
                  <button onClick={handleSignUp}>Register</button>
                  <p style={{ margin: "4px 0px" }}>Already have an account? <span style={{ cursor: "pointer", color: "blue", fontWeight: "500" }} onClick={handleSignIn}>Sign In</span></p>
                  {errorMessage && <p style={{ color: "red", margin: "4px 0px" }}>{errorMessage}</p>}
                  {successMessage && <p style={{ color: "green", margin: "4px 0px" }}>{successMessage}</p>}
                </>
              ) : (
                <>
                  <h3>Login</h3>
                  <hr />
                  <label>Username <span style={{ color: "red" }}>*</span></label><br />
                  <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Enter your username" required /><br />
                  <label>Password <span style={{ color: "red" }}>*</span></label><br />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required /><br />
                  <button onClick={handleLogin}>Login</button>
                  <p style={{margin: "0px", marginTop: "10px", display: "flex", justifyContent: "center", color: "blue", cursor: "pointer", textDecoration: "underline"}} onClick={() => { navigate('/Forgetpass');}}>Forget Password</p>
                  <p style={{ margin: "0px 0px" }}>Do not have an account? <span style={{ cursor: "pointer", color: "blue", fontWeight: "500" }} onClick={() => setIsSignUp(true)}>Sign - Up</span></p>
                  {errorMessage && <p style={{ color: "red", margin: "4px 0px" }}>{errorMessage}</p>}
                  {successMessage && <p style={{ color: "green", margin: "4px 0px" }}>{successMessage}</p>}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <Routes>
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Forgetpass" element={<Forgetpass />} />
      </Routes>
    </>
  );
}

export default App;
