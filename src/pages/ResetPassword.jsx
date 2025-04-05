import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

function ResetPassword() {
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            setError('Invalid reset link.');
        }
    }, [location.search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password, confirmPassword }), // Include confirmPassword
            });

            if (!response.ok) {
                console.error("Response not OK:", response);
                try {
                    const errorData = await response.json();
                    setError(errorData.message || `Failed to reset password. Status: ${response.status}`);
                } catch (parseError) {
                    setError(`Failed to reset password. Status: ${response.status}. Could not parse error message.`);
                }
                return;
            }

            const data = await response.json();
            setMessage(data.message);
            setTimeout(() => navigate('/login'), 3000);

        } catch (err) {
            console.error("Fetch error:", err);
            setError('An unexpected error occurred. Please check your network and try again.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen ">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-4 text-center">Reset Your Password</h2>

                {message && <p className="text-green-500 mb-4 text-center">{message}</p>}
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                {token ? (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">New Password:</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm New Password:</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        >
                            Reset Password
                        </button>
                    </form>
                ) : (
                    <p className="text-center">Please check the reset link in your email.</p>
                )}

                <p className="mt-4 text-center">
                    <Link to="/login" className="text-indigo-600 hover:underline">Back to Login</Link>
                </p>
            </div>
        </div>
    );
}

export default ResetPassword;