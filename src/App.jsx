import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Signup from "./pages/Signup.jsx"; // Import the Signup component
import ForgotPassword from "./pages/ForgotPassword.jsx"; // Import ForgotPassword component
import './index.css'; // Ensure Tailwind's base styles are included
import ResetPassword from "./pages/ResetPassword.jsx";
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const updateAuthStatus = useCallback(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            updateAuthStatus();
        };
        window.addEventListener('storage', handleStorageChange);
        updateAuthStatus();
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [updateAuthStatus]);

    function AppContent() {
        const navigate = useNavigate();

        const handleLoginSuccess = () => {
            updateAuthStatus();
            navigate('/dashboard');
        };

        const handleLogout = () => {
            localStorage.removeItem('token');
            updateAuthStatus();
            navigate('/login');
        };

        return (
            <>
                <div className="bg-white shadow py-4"> {/* Header container */}
                    <div className="container mx-auto px-4 flex justify-between items-center"> {/* Container with padding and flex layout */}
                        <h1 className="text-xl font-bold text-indigo-700">Task Management</h1> {/* Title styling */}
                        <nav>
                            <ul className="list-none p-0 m-0 flex items-center"> {/* Navigation list */}
                                {!isAuthenticated && (
                                    <>
                                        <li className="mr-2">
                                            <Link to="/" className="inline-block py-1 px-3 rounded-md font-semibold text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 transition duration-150 ease-in-out">
                                                Home
                                            </Link>
                                        </li>
                                        <li className="mr-2">
                                            <Link to="/login" className="inline-block py-1 px-3 rounded-md font-semibold text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 transition duration-150 ease-in-out">
                                                Login
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/signup" className="inline-block py-1 px-3 rounded-md font-semibold text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 transition duration-150 ease-in-out">
                                                Sign Up
                                            </Link>
                                        </li>
                                    </>
                                )}
                                {isAuthenticated && (
                                   <li>
                                       <button
                                           onClick={handleLogout}
                                           className="bg-transparent hover:bg-red-500 text-red-500 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded cursor-pointer text-sm"
                                       >
                                           Logout
                                       </button>
                                   </li>
                                )}
                            </ul>
                        </nav>
                    </div>
                </div>

                <div className="container mx-auto p-4 flex justify-center">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />
                    </Routes>
                </div>
            </>
        );
    }

    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;