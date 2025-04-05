import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem('rememberedEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleRememberMeChange = (event) => {
    setRememberMe(event.target.checked);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const loginData = {
        email: email,
        password: password,
        remember: rememberMe
      };

      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      if (!response.ok) {
        let errorMessage = "Login Failed";
        const contentType = response.headers.get("content-type");

        try {
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.message || `Login Failed (Status: ${response.status})`;
          } else {
            const textError = await response.text();
            errorMessage = `Login Failed: ${textError || response.statusText}`;
          }
        } catch (parseError) {
          const textError = await response.text();
          errorMessage = `Login Failed: ${textError || response.statusText}`;
          console.error("Error parsing error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        navigate('/dashboard');
      } else {
        throw new Error("Login successful but no token received.");
      }

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center py-12 sm:px-6 lg:px-8">
      <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10 w-96 mt-[-10rem]">
        <div className="mb-6">
          <h2 className="text-center text-3xl font-semibold text-gray-900">Login</h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <div className="mt-1">
              <input id="email" name="email" type="email" autoComplete="email" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1">
              <input id="password" name="password" type="password" autoComplete="current-password" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={rememberMe}
                onChange={handleRememberMeChange}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">Forgot your password?</Link>
            </div>
          </div>

          {error && (
            <div className="text-red-500 mt-2">{error}</div>
          )}

          <div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Sign in
            </button>
          </div>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Or <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">create a new account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;