import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Lock, ArrowRight, Loader } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('foreman');
    const [password, setPassword] = useState('password');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate network delay
        setTimeout(async () => {
            const success = await login(username, password);
            setIsLoading(false);

            if (success) {
                const from = location.state?.from?.pathname || '/';
                navigate(from, { replace: true });
            } else {
                setError('Invalid username or password');
            }
        }, 1000);
    };

    return (
        <div className="mobile-container flex flex-col justify-center px-8 bg-white min-h-screen">
            <div className="mb-12 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
                    <User className="text-white" size={32} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                <p className="text-gray-500">Sign in to access Field Operations</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={20} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                            placeholder="Enter your username"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={20} className="text-gray-400" />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="text-right mt-2">
                        <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                            Forgot Password?
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center animate-in fade-in">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <Loader className="animate-spin" />
                    ) : (
                        <>
                            Sign In <ArrowRight className="ml-2" size={20} />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center space-y-4">
                <button className="block w-full text-sm text-gray-500 hover:text-gray-800" onClick={() => navigate('/public/incidents')}>
                    Report an Incident (Unauthenticated)
                </button>
            </div>
        </div>
    );
};

export default Login;
