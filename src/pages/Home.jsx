import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] p-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Welcome to the Task Management System</h2>
      <p className="mb-4 text-gray-600">Organize your tasks efficiently and stay productive.</p>
      <Link to="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md">
        Login to Continue
      </Link>
    </div>
  );
}

export default Home;