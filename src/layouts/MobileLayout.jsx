import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, X, Home, Calendar, Bell, Clock, LogOut, TriangleAlert, Info, MapPin } from 'lucide-react';
import clsx from 'clsx';

const MobileLayout = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { user, logout, isOffline, toggleOffline, currentJob } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const NavItem = ({ to, icon: Icon, label, onClick }) => {
        const isActive = location.pathname === to;
        return (
            <button
                onClick={() => {
                    if (onClick) onClick();
                    else {
                        navigate(to);
                        setIsDrawerOpen(false);
                    }
                }}
                className={clsx(
                    "flex items-center w-full p-4 space-x-4 transition-colors",
                    isActive ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                )}
            >
                <Icon size={24} />
                <span>{label}</span>
            </button>
        );
    };

    return (
        <div className="mobile-container flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-blue-600 text-white p-4 shadow-md z-20 flex justify-between items-center h-16 shrink-0">
                <button onClick={() => setIsDrawerOpen(true)} className="p-1 hover:bg-blue-700 rounded-md">
                    <Menu size={28} />
                </button>
                <h1 className="text-lg font-bold truncate mx-2">Fence Force</h1>
                <div className="w-8">
                    {/* Placeholder for future icon or status */}
                    <div className={clsx("w-3 h-3 rounded-full", isOffline ? "bg-yellow-400" : "bg-green-400")} onClick={toggleOffline} />
                </div>
            </header>

            {/* Offline Banner */}
            {isOffline && (
                <div className="bg-yellow-100 text-yellow-800 text-xs text-center py-1 font-medium">
                    Offline Mode - Changes will sync when online
                </div>
            )}

            {/* Active Job Banner (Persistent) */}
            {currentJob && currentJob.status === 'in-progress' && (
                <div
                    onClick={() => navigate(`/job/${currentJob.id}/dashboard`)}
                    className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center text-sm shadow-inner cursor-pointer hover:bg-blue-700 transition-colors"
                >
                    <div className="flex items-center truncate">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse shrink-0"></span>
                        <span className="font-medium truncate">Active: {currentJob.customerName}</span>
                    </div>
                    <span className="text-blue-200 text-xs ml-2 whitespace-nowrap">Tap to view &rarr;</span>
                </div>
            )}

            {/* Day Started but No Active Job - "Active Orders" */}
            {useApp().truckNumber && (!currentJob || currentJob.status !== 'in-progress') && (
                <div
                    onClick={() => navigate('/schedule')}
                    className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center text-sm shadow-inner cursor-pointer hover:bg-blue-700 transition-colors"
                >
                    <div className="flex items-center truncate">
                        <span className="w-2 h-2 bg-blue-300 rounded-full mr-2 shrink-0"></span>
                        <span className="font-medium truncate">Active Orders</span>
                    </div>
                    <span className="text-blue-200 text-xs ml-2 whitespace-nowrap">View Schedule &rarr;</span>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto relative z-0">
                <Outlet />
            </main>

            {/* Navigation Drawer Overlay */}
            {isDrawerOpen && (
                <div className="absolute inset-0 z-30 flex">
                    {/* Backdrop */}
                    <div
                        className="bg-black/50 flex-1 backdrop-blur-sm"
                        onClick={() => setIsDrawerOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                        <div className="p-6 bg-blue-700 text-white pb-8">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <button onClick={() => setIsDrawerOpen(false)} className="text-white/80 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>
                            <h2 className="text-xl font-bold">{user?.name}</h2>
                            <p className="text-blue-100 text-sm">{user?.role}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto py-2">
                            <NavItem to="/" icon={Home} label="Home" />
                            <NavItem to="/schedule" icon={Calendar} label="Daily Schedule" />
                            <NavItem to="/incidents" icon={TriangleAlert} label="Incident Reporting" />
                            <NavItem to="/notifications" icon={Bell} label="Notifications" />
                            <NavItem to="/reminders" icon={Clock} label="Reminders" />

                            <div className="border-t border-gray-100 my-2 mx-4" />

                            {/* Timekeeping - Redirect mock */}
                            <NavItem to="#" icon={Clock} label="Timekeeping" onClick={() => alert("Redirecting to WorkforceGo...")} />
                        </div>

                        <div className="p-4 border-t border-gray-100">
                            <NavItem to="#" icon={LogOut} label="Log Off" onClick={handleLogout} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileLayout;
