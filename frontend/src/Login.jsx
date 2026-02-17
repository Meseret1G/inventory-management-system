import React, { useState } from 'react';
import api from './api';
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // We use the 'api' helper to send a POST request
            const response = await api.post('/token/', { 
                username: username.trim(), 
                password: password 
            });
            
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            onLoginSuccess();
        } catch (err) {
            // If Django returns a 401 or 400, we show the error message
            setError(err.response?.data?.detail || 'Unauthorized: Check credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        /* 'fixed inset-0' ensures the background covers the whole browser window */
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900 z-50">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 m-4">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">StockMaster</h2>
                    <p className="text-gray-500 mt-2">Inventory Management System</p>
                </div>
                
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-2">
                        <AlertCircle size={18} />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                                placeholder="Enter admin username"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg active:transform active:scale-95 disabled:bg-blue-400"
                    >
                        {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;