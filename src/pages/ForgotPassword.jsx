import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const trimmedEmail = email.trim(); // Trim the email here

        try {
            const response = await fetch('http://localhost:8080/auth/forgot-password', { // Ensure correct backend URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: trimmedEmail }), // Send the trimmed email
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
            } else {
                setError(data.message || 'Failed to send reset link.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex justify-center py-12 sm:px-6 lg:px-8">
            <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10 w-full max-w-md">
                <div className="mb-6">
                    <h2 className="text-center text-3xl font-semibold text-gray-900">Forgot Your Password?</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your email address below and we'll send you a link to reset your password.
                    </p>
                </div>

                {message && (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.08-.022L7.07 9.472 5.969 8.369a.75.75 0 10-1.06 1.06l1.5 1.5a.75.75 0 001.06 0l3.5-3.5a.75.75 0 00-.021-1.08z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">{message}</p>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 00-1.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586l-1.293-1.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">There was a problem</h3>
                                <div className="mt-2 sm:mt-0">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={(e) => setEmail(e.target.value.trim())} // Optional: Trim on blur as well
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Send Reset Link
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Back to Login</Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;