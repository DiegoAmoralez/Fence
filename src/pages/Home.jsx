import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudSun, ClipboardList, Truck, AlertTriangle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Home = () => {
    const navigate = useNavigate();
    const { user, truckNumber } = useApp();

    const menuItems = [
        {
            title: 'Start Day',
            subtitle: truckNumber ? 'Vehicle Check Complete' : 'Perform Vehicle Check',
            icon: Truck,
            color: 'bg-blue-500',
            to: '/vehicle-check',
            completed: !!truckNumber
        },
        {
            title: 'Today\'s Schedule',
            subtitle: 'View assigned jobs',
            icon: ClipboardList,
            color: 'bg-indigo-500',
            to: '/schedule',
            disabled: !truckNumber
        },
        {
            title: 'Time Clock',
            subtitle: 'Manage timesheet',
            icon: Clock,
            color: 'bg-green-500',
            to: '#'
        },
        {
            title: 'Safety Reporting',
            subtitle: 'Report Incidents',
            icon: AlertTriangle,
            color: 'bg-orange-500',
            to: '/incidents'
        },
    ];

    return (
        <div className="min-h-full bg-gray-50 p-6 space-y-6 pb-20">
            {/* Weather Widget */}
            <div className="bg-white rounded-2xl p-6 shadow-premium flex items-center justify-between text-white bg-gradient-to-r from-blue-500 to-blue-700">
                <div>
                    <h2 className="text-2xl font-bold">72°F</h2>
                    <p className="text-blue-100">Partly Cloudy</p>
                    <p className="text-xs text-blue-200 mt-1">Springfield, IL</p>
                </div>
                <CloudSun size={48} className="text-blue-100" />
            </div>

            {/* Notifications Banner */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">Notifications</h3>
                <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full shrink-0"></div>
                        <p className="text-sm text-gray-700">HR: Open Enrollment ends this Friday.</p>
                    </div>
                </div>
            </div>

            {/* Grid Menu */}
            <div className="grid grid-cols-2 gap-4">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => !item.disabled && navigate(item.to)}
                        disabled={item.disabled}
                        className={`bg-white p-4 rounded-xl shadow-premium text-left relative overflow-hidden group transition-all active:scale-95 ${item.disabled ? 'opacity-50 grayscale' : ''}`}
                    >
                        <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center text-white mb-3 shadow-md`}>
                            <item.icon size={20} />
                        </div>
                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>

                        {item.completed && (
                            <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></div>
                        )}
                    </button>
                ))}
            </div>

            {!truckNumber && (
                <div className="p-4 bg-orange-50 text-orange-800 rounded-xl text-sm border border-orange-100 flex items-start gap-3">
                    <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                    <p>You must complete the Vehicle Walk Around before accessing your daily schedule.</p>
                </div>
            )}
        </div>
    );
};

export default Home;
