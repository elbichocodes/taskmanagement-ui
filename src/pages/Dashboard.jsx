import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// --- Constants ---
const API_BASE_URL = "http://localhost:8080"; // Adjust if your backend runs elsewhere

function Dashboard() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for the "Create New Task" form
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskStatus, setNewTaskStatus] = useState('PENDING'); // Default status

    // State for inline editing
    const [editingTaskId, setEditingTaskId] = useState(null); // ID of the task being edited
    const [editTaskTitle, setEditTaskTitle] = useState('');
    const [editTaskDescription, setEditTaskDescription] = useState('');
    const [editTaskStatus, setEditTaskStatus] = useState('');

    // --- Helper Function for Authenticated API Calls ---
    const fetchWithAuth = useCallback(async (url, options = {}) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Authentication token not found. Please login again.");
            navigate('/login'); // Redirect to login if no token
            return; // Stop execution
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...(options.headers || {}), // Merge custom headers if provided
        };

        try {
            const response = await fetch(url, { ...options, headers });

            if (response.status === 401 || response.status === 403) { // Unauthorized or Forbidden
                setError("Session expired or invalid. Please login again.");
                localStorage.removeItem('token'); // Clear invalid token
                navigate('/login');
                throw new Error("Unauthorized"); // Throw error to stop processing
            }
            if (!response.ok) {
                // Try to get error message from backend response body
                let errorMessage = `HTTP error! Status: ${response.status}`;
                try {
                    const errorBody = await response.json();
                    errorMessage = errorBody.message || errorBody.error || errorMessage;
                } catch (e) { /* Ignore if response body is not JSON */ }
                throw new Error(errorMessage);
            }
            // If response has content, parse it as JSON, otherwise return null
            if (response.headers.get("content-length") === "0" || response.status === 204) {
                return null;
            }
            // Handle plain text response for delete confirmation
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("text/plain")) {
                return await response.text();
            }

            return await response.json(); // Default: parse as JSON
        } catch (err) {
            console.error("API call failed:", err);
            // Keep specific errors like Unauthorized, otherwise set a generic one
            if (err.message !== "Unauthorized") {
                setError(err.message || "An error occurred during the API request.");
            }
            throw err; // Re-throw to allow calling function to handle if needed
        }

    }, [navigate]); // Add navigate as dependency


    // --- Fetch Tasks ---
    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchWithAuth(`${API_BASE_URL}/tasks`);
            if (data) { // Ensure data is not null/undefined before setting state
                setTasks(data);
            } else {
                setTasks([]); // Set empty array if response was empty
            }
        } catch (err) {
            // Error state is set within fetchWithAuth
            console.error("Failed to fetch tasks:", err);
        } finally {
            setIsLoading(false);
        }
    }, [fetchWithAuth]); // Dependency on the memoized fetch function


    // --- Initial Load ---
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]); // Fetch tasks when component mounts or fetchTasks changes

    // --- Create Task ---
    const handleCreateTask = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        // Determine the boolean value for 'completed' based on 'newTaskStatus'
        const completedStatus = newTaskStatus === 'COMPLETED'; // Assuming your select options are "PENDING" and "COMPLETED"

        const newTask = {
            title: newTaskTitle,
            description: newTaskDescription,
            completed: completedStatus // Add the 'completed' field with the boolean value
        };

        try {
            await fetchWithAuth(`${API_BASE_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTask),
            });
            // Clear form and refresh list
            setNewTaskTitle('');
            setNewTaskDescription('');
            setNewTaskStatus('PENDING'); // Reset status to default
            await fetchTasks(); // Re-fetch the list to include the new task
        } catch (err) {
            // Error handled by fetchWithAuth
            console.error("Failed to create task:", err)
        } finally {
            setIsLoading(false);
        }
    };

    // --- Delete Task ---
    const handleDeleteTask = async (taskId) => {
        // Optional: Add confirmation dialog
        if (!window.confirm("Are you sure you want to delete this task?")) {
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await fetchWithAuth(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'DELETE',
            });
            // Refresh task list after successful deletion
            // Optimistic update: setTasks(tasks.filter(task => task.id !== taskId));
            await fetchTasks(); // Or refetch the list
        } catch (err) {
            console.error("Failed to delete task:", err)
        } finally {
            setIsLoading(false);
        }
    };

    // --- Edit Task - Start Editing ---
    const handleStartEdit = (task) => {
        setEditingTaskId(task.id);
        setEditTaskTitle(task.title);
        setEditTaskDescription(task.description);
        setEditTaskStatus(task.status);
    };

    // --- Edit Task - Cancel Editing ---
    const handleCancelEdit = () => {
        setEditingTaskId(null);
    };

    const handleUpdateTask = async (event) => {
        event.preventDefault();
        if (!editingTaskId) return;

        setIsLoading(true);
        setError(null);

        let completedStatus;
        if (editTaskStatus === 'COMPLETED') {
            completedStatus = true;
        } else if (editTaskStatus === 'PENDING') {
            completedStatus = false;
        } else {
            // Handle any other potential status values if necessary
            completedStatus = false; // Default to false for unknown statuses
        }

        const updatedTask = {
            title: editTaskTitle,
            description: editTaskDescription,
            completed: completedStatus
        };

        try {
            await fetchWithAuth(`${API_BASE_URL}/tasks/${editingTaskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTask),
            });
            setEditingTaskId(null);
            await fetchTasks();
        } catch (err) {
            console.error("Failed to update task:", err)
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans antialiased">
            <header className="bg-white shadow-md py-4">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-indigo-700">Task Management</h1>
                    <nav>
                        {/* You could add navigation links here if needed */}
                    </nav>
                </div>
            </header>

            <div className="container mx-auto py-8 px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-indigo-600 text-white p-6 rounded-lg shadow-md">
                        <p className="text-sm font-semibold uppercase text-indigo-100 mb-1">Total Tasks</p>
                        <p className="text-3xl font-bold">{tasks.length}</p>
                    </div>
                    <div className="bg-green-500 text-white p-6 rounded-lg shadow-md">
                        <p className="text-sm font-semibold uppercase text-green-100 mb-1">Completed</p>
                        <p className="text-3xl font-bold">
                            {tasks.filter((task) => task.completed === true).length}
                        </p>
                    </div>
                    <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-md">
                        <p className="text-sm font-semibold uppercase text-yellow-100 mb-1">Pending</p>
                        <p className="text-3xl font-bold">
                            {tasks.filter((task) => task.completed === false).length}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                        <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 0 0 1 0 1.698z"/></svg>
                        </button>
                    </div>
                )}

                <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create New Task</h2>
                    <form onSubmit={handleCreateTask} className="grid grid-cols-1 gap-6">
                        <div>
                            <label htmlFor="newTaskTitle" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                            <input type="text" id="newTaskTitle" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <div>
                            <label htmlFor="newTaskDescription" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                            <textarea id="newTaskDescription" value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} rows="3" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
                        </div>
                        <div>
                            <label htmlFor="newTaskStatus" className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                            <select
                                id="newTaskStatus"
                                value={newTaskStatus}
                                onChange={(e) => setNewTaskStatus(e.target.value)}
                                required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                {/* Adjust these options based on your backend Task model's possible statuses */}
                                <option value="PENDING">Pending</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                        <button type="submit" disabled={isLoading} className={`bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isLoading ? "Creating..." : "+ Add Task"}
                        </button>
                    </form>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Tasks</h2>
                    {isLoading && tasks.length === 0 ? (
                                            <p className="text-gray-600">Loading tasks...</p>
                                        ) : tasks.length === 0 ? (
                                            <p className="text-gray-600">No tasks found. Create one above!</p>
                                        ) : (
                                            <ul className="divide-y divide-gray-200">
                                                {tasks.map((task) => (
                                                    <li key={task.id} className="py-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <input type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600 mr-4" />
                                                                <div>
                                                                    <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                                                                    <p className="text-sm text-gray-600">{task.description || "No description"}</p>
                                                                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                                                        task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                                        'bg-blue-100 text-blue-800' // Default for PENDING or others
                                                                    }`}>{task.status}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex space-x-3">
                                                                <button onClick={() => handleStartEdit(task)} disabled={isLoading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50">
                                                                    Edit
                                                                </button>
                                                                <button onClick={() => handleDeleteTask(task.id)} disabled={isLoading} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50">
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="mt-8 flex justify-between items-center">
                                        <div className="flex space-x-4">
                                            <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                                All
                                            </button>
                                            <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                                Active
                                            </button>
                                            <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                                Completed
                                            </button>
                                        </div>
                                        <button className="text-indigo-600 hover:text-indigo-800 focus:outline-none">
                                            Clear Completed
                                        </button>
                                    </div>
                                </div>

                                {/* --- Modal for Editing Task (Conditional Rendering) --- */}
                                {editingTaskId && (
                                    <div className="fixed z-10 inset-0 overflow-y-auto bg-gray-500 bg-opacity-75 transition-opacity">
                                        <div className="flex items-center justify-center min-h-screen p-4">
                                            <div className="bg-white rounded-lg px-8 py-6 shadow-lg max-w-md w-full">
                                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Task</h2>
                                                <form onSubmit={handleUpdateTask} className="grid grid-cols-1 gap-6">
                                                    <div>
                                                        <label htmlFor="editTaskTitle" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                                                        <input
                                                            type="text"
                                                            id="editTaskTitle"
                                                            value={editTaskTitle}
                                                            onChange={(e) => setEditTaskTitle(e.target.value)}
                                                            required
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="editTaskDescription" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                                                        <textarea
                                                            id="editTaskDescription"
                                                            value={editTaskDescription}
                                                            onChange={(e) => setEditTaskDescription(e.target.value)}
                                                            rows="3"
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        ></textarea>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="editTaskStatus" className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                                                        <select
                                                            id="editTaskStatus"
                                                            value={editTaskStatus}
                                                            onChange={(e) => setEditTaskStatus(e.target.value)}
                                                            required
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        >
                                                            <option value="PENDING">Pending</option>
                                                            <option value="COMPLETED">Completed</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex justify-end space-x-4">
                                                        <button
                                                            type="button"
                                                            onClick={handleCancelEdit}
                                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={isLoading}
                                                            className={`bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            {isLoading ? "Saving..." : "Save Changes"}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }

                    export default Dashboard;