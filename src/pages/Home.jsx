import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudSun, ClipboardList, Truck, AlertTriangle, Clock, MapPin, CheckCircle2, ArrowRight, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockService } from '../services/MockService';

const Home = () => {
    const navigate = useNavigate();
    const { user, truckNumber, endDay } = useApp();
    const [stats, setStats] = useState({ jobs: 0, reminders: 0 });
    const [notifIndex, setNotifIndex] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            const jobs = await mockService.getDailySchedule();
            const reminders = JSON.parse(localStorage.getItem('app_reminders') || '[]');
            const pendingReminders = reminders.filter(r => !r.completed).length;
            setStats({ jobs: jobs.length, reminders: pendingReminders });
        };
        fetchData();

        const interval = setInterval(() => {
            setNotifIndex(prev => (prev + 1) % 3);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const notifications = [
        { type: 'HR', text: 'Open Enrollment ends this Friday.', color: 'bg-blue-500' },
        { type: 'JOBS', text: `Arrange jobs: ${stats.jobs} target jobs today.`, color: 'bg-indigo-500' },
        { type: 'TO-DO', text: `Reminders: ${stats.reminders} pending reminders.`, color: 'bg-purple-500' }
    ];

    const menuItems = [
        {
            title: 'Start Day',
            subtitle: truckNumber ? 'Vehicle Check Complete' : 'Perform Vehicle Check',
            icon: Truck,
            color: 'bg-blue-600',
            to: '/vehicle-check',
            completed: !!truckNumber,
            hidden: !!truckNumber
        },
        {
            title: 'Today\'s Schedule',
            subtitle: 'View assigned jobs',
            icon: ClipboardList,
            color: 'bg-slate-900',
            to: '/schedule',
            disabled: !truckNumber,
            fullWidth: true
        },
        {
            title: 'Reminders',
            subtitle: 'Your to-do list',
            icon: Clock,
            color: 'bg-indigo-500',
            to: '/reminders',
        },
        {
            title: 'Safety Reporting',
            subtitle: 'Report Incidents',
            icon: AlertTriangle,
            color: 'bg-orange-500',
            to: '/incidents'
        },
        {
            title: 'Time Clock',
            subtitle: 'Manage timesheet',
            icon: Clock,
            color: 'bg-green-500',
            to: '#'
        },
    ];

    const activeMenuItems = menuItems.filter(i => !i.hidden);

    return (
        <div className="min-h-full bg-slate-50 p-6 space-y-6 pb-24">
            {/* Weather Widget */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-100 flex items-center justify-between text-white bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-4xl font-black">72°F</h2>
                    <p className="font-bold text-blue-100">Partly Cloudy</p>
                    <p className="text-[10px] font-black uppercase tracking-tighter text-blue-300 mt-2 opacity-80 flex items-center">
                        <MapPin size={10} className="mr-1" /> Springfield, IL
                    </p>
                </div>
                <CloudSun size={80} className="text-blue-400/20 absolute -right-2 -bottom-2" />
                <CloudSun size={54} className="text-white relative z-10 animate-pulse" />
            </div>

            {/* Notifications Banner */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 min-h-[100px] flex flex-col justify-center">
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Updates</h3>
                    <Bell size={12} className="text-blue-500 animate-bounce" />
                </div>
                <div className="relative h-12 overflow-hidden">
                    {notifications.map((notif, i) => (
                        <div
                            key={i}
                            className={`flex items-start space-x-3 p-3 bg-slate-50 border border-slate-100 rounded-xl transition-all duration-700 absolute inset-0 ${i === notifIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
                        >
                            <div className={`w-2 h-2 mt-1.5 ${notif.color} rounded-full shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.3)]`}></div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter leading-none mb-1">{notif.type}</p>
                                <p className="text-xs font-bold text-slate-600">{notif.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Grid Menu */}
            <div className="grid grid-cols-2 gap-4">
                {activeMenuItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => !item.disabled && navigate(item.to)}
                        disabled={item.disabled}
                        className={`bg-white p-5 rounded-3xl shadow-xl shadow-slate-200/50 text-left relative overflow-hidden group transition-all active:scale-95 border border-white hover:border-blue-100 ${item.disabled ? 'opacity-50 grayscale' : ''} ${item.fullWidth ? 'col-span-2' : ''}`}
                    >
                        <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg transition-transform group-hover:scale-110`}>
                            <item.icon size={24} />
                        </div>
                        <h3 className="font-black text-slate-900 tracking-tight">{item.title}</h3>
                        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{item.subtitle}</p>

                        {item.completed && (
                            <div className="absolute top-4 right-4 animate-in zoom-in">
                                <CheckCircle2 className="text-green-500" size={20} />
                            </div>
                        )}

                        {item.fullWidth && (
                            <ArrowRight className="absolute bottom-6 right-6 text-slate-200 group-hover:text-blue-500 transition-colors" size={24} />
                        )}
                    </button>
                ))}
            </div>

            {!truckNumber && (
                <div className="p-5 bg-orange-50/80 backdrop-blur-sm text-orange-800 rounded-2xl text-xs font-bold border border-orange-100 flex items-start gap-4 shadow-sm">
                    <AlertTriangle size={24} className="shrink-0 text-orange-400" />
                    <p className="leading-relaxed">You must complete the Vehicle Walk Around before accessing your daily schedule.</p>
                </div>
            )}

            {/* End Day Action */}
            {truckNumber && (
                <div className="pt-4">
                    <button
                        className="w-full py-5 bg-white border border-red-50 text-red-600 rounded-2xl font-black text-sm shadow-sm hover:bg-red-50 flex items-center justify-center transition-all active:scale-95 uppercase tracking-widest"
                        onClick={async () => {
                            if (window.confirm("Are you sure you want to end your working day? You'll need to restart the day.")) {
                                await endDay();
                                navigate('/');
                            }
                        }}
                    >
                        End Working Day
                    </button>
                </div>
            )}
        </div>
    );
};

export default Home;
