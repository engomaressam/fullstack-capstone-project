import React, { useState } from 'react';
//Step 1 - Task 1: import the backend URL
import {urlConfig} from '../../config';
//Step 1 - Task 2: import the app context
import { useAppContext } from '../../context/AuthContext';
//Step 1 - Task 3: import useNavigate
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    //Step 1 - Task 4: state for the error message
    const [showerr, setShowerr] = useState('');
    //Step 1 - Task 5: navigation and login state
    const navigate = useNavigate();
    const { setIsLoggedIn, setUserName } = useAppContext();

    const handleRegister = async () => {
        try {
            const response = await fetch(`${urlConfig.backendUrl}/api/auth/register`, {
                //Step 1 - Task 6: set the method
                method: 'POST',
                //Step 1 - Task 7: set the headers
                headers: {
                    'content-type': 'application/json',
                },
                //Step 1 - Task 8: set the body to send
                body: JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password
                })
            });

            //Step 2 - Task 1: access the data coming from the fetch API
            const json = await response.json();

            //Step 2 - Task 2: set user details
            if (json.authtoken) {
                sessionStorage.setItem('auth-token', json.authtoken);
                sessionStorage.setItem('name', firstName);
                sessionStorage.setItem('email', json.email);
                //Step 2 - Task 3: set the state of user to logged in
                setIsLoggedIn(true);
                setUserName(firstName);
                //Step 2 - Task 4: navigate to the MainPage after logging in
                navigate('/app');
            }
            if (json.error) {
                //Step 2 - Task 5: set an error message if the registration fails
                setShowerr(json.error);
            }
        } catch (e) {
            console.log('Error fetching details: ' + e.message);
            setShowerr('Registration failed. Please try again.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="register-card p-4 border rounded">
                        <h2 className="text-center mb-4 font-weight-bold">Register</h2>

                        <div className="mb-3">
                            <label htmlFor="firstName" className="form-label">FirstName</label>
                            <input
                                id="firstName"
                                type="text"
                                className="form-control"
                                placeholder="Enter your firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="lastName" className="form-label">LastName</label>
                            <input
                                id="lastName"
                                type="text"
                                className="form-control"
                                placeholder="Enter your lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                id="email"
                                type="text"
                                className="form-control"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {/* Step 2 - Task 6: display the error message */}
                            <div className="text-danger">{showerr}</div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button className="btn btn-primary w-100 mb-3" onClick={handleRegister}>Register</button>
                        <p className="mt-4 text-center">
                            Already a member? <a href="/app/login" className="text-primary">Login</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
