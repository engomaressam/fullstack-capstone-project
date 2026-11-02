import React, { useState, useEffect } from 'react';
//Step 1 - Task 1: import the backend URL
import {urlConfig} from '../../config';
//Step 1 - Task 2: import the app context
import { useAppContext } from '../../context/AuthContext';
//Step 1 - Task 3: import useNavigate
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    //Step 1 - Task 4: state for an incorrect login
    const [incorrect, setIncorrect] = useState('');
    //Step 1 - Task 5: navigation, bearer token and login state
    const navigate = useNavigate();
    const bearerToken = sessionStorage.getItem('bearer-token');
    const { setIsLoggedIn, setUserName } = useAppContext();

    //Step 1 - Task 6: if the user is already logged in, go to the MainPage
    useEffect(() => {
        if (sessionStorage.getItem('auth-token')) {
            navigate('/app');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${urlConfig.backendUrl}/api/auth/login`, {
                //Step 1 - Task 7: set the method
                method: 'POST',
                //Step 1 - Task 8: set the headers
                headers: {
                    'content-type': 'application/json',
                    'Authorization': bearerToken ? `Bearer ${bearerToken}` : '', // Include Bearer token if available
                },
                //Step 1 - Task 9: set the body to send
                body: JSON.stringify({
                    email: email,
                    password: password,
                })
            });

            //Step 2 - Task 1: access the data coming from the fetch API
            const json = await res.json();
            if (json.authtoken) {
                //Step 2 - Task 2: set user details
                sessionStorage.setItem('auth-token', json.authtoken);
                sessionStorage.setItem('name', json.userName);
                sessionStorage.setItem('email', json.userEmail);
                //Step 2 - Task 3: set the user's state to logged in
                setIsLoggedIn(true);
                setUserName(json.userName);
                //Step 2 - Task 4: navigate to the MainPage after logging in
                navigate('/app');
            } else {
                //Step 2 - Task 5: clear the inputs and show an error message
                setEmail('');
                setPassword('');
                setIncorrect(json.error === 'User not found' ? 'User not found. Please register first.' : 'Wrong password. Try again.');
                setTimeout(() => {
                    setIncorrect('');
                }, 2000);
            }
        } catch (err) {
            console.log('Error fetching details: ' + err.message);
            setIncorrect('Login failed. Please try again.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="login-card p-4 border rounded">
                        <h2 className="text-center mb-4 font-weight-bold">Login</h2>

                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                id="email"
                                type="text"
                                className="form-control"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setIncorrect(''); }}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setIncorrect(''); }}
                            />
                            {/* Step 2 - Task 6: display the error message */}
                            <span style={{color:'red',height:'.5cm',display:'block',fontStyle:'italic',fontSize:'12px'}}>{incorrect}</span>
                        </div>

                        <button className="btn btn-primary w-100 mb-3" onClick={handleLogin}>Login</button>
                        <p className="mt-4 text-center">
                            New here? <a href="/app/register" className="text-primary">Register Here</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
