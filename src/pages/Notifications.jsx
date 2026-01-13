import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Briefcase, User, Package } from 'lucide-react';

const Notifications = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('menu'); // menu, form
    const [target, setTarget] = useState(null); // superintendent, pm, materials
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSelect = (t) => {
        setTarget(t);
        setView('form');
        setSubmitted(false);
        setMessage('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    const getTitle = () => {
        if (target === 'superintendent') return 'Notify Superintendent';
        if (target === 'pm') return 'Notify Project Manager';
        if (target === 'materials') return 'Materials Request';
        return 'Notifications';
    };

    if (view === 'menu') {
        return (
            <div className="p-4 pb-20 bg-gray-50 min-h-screen">
                <div className="bg-white p-4 shadow-sm sticky top-0 z-10 mb-6 rounded-xl flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-4 text-gray-500"><ArrowLeft /></button>
                    <h1 className="text-xl font-bold text-gray-900">Communications</h1>
                </div>

                <div className="space-y-4">
                    <button onClick={() => handleSelect('superintendent')} className="w-full p-6 bg-white rounded-xl shadow-premium flex items-center space-x-4 hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                            <User size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg">Notify Superintendent</h3>
                            <p className="text-sm text-gray-500">Urgent updates or questions</p>
                        </div>
                    </button>

                    <button onClick={() => handleSelect('pm')} className="w-full p-6 bg-white rounded-xl shadow-premium flex items-center space-x-4 hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <Briefcase size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg">Notify Project Manager</h3>
                            <p className="text-sm text-gray-500">Schedule or project specific</p>
                        </div>
                    </button>

                    <button onClick={() => handleSelect('materials')} className="w-full p-6 bg-white rounded-xl shadow-premium flex items-center space-x-4 hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                            <Package size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg">Materials Request</h3>
                            <p className="text-sm text-gray-500">Order additional supplies</p>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="p-6 text-center animate-in zoom-in min-h-screen flex flex-col justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="text-green-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-4">Message Sent</h2>
                <p className="text-gray-500 mb-8">
                    {target === 'materials'
                        ? 'Your materials request has been emailed to the Superintendent and Project Manager.'
                        : `Your message has been emailed to the ${target === 'pm' ? 'Project Manager' : 'Superintendent'} for follow up.`}
                </p>
                <button
                    onClick={() => { setView('menu'); setTarget(null); }}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg"
                >
                    Send Another
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="w-full py-4 text-blue-600 font-bold mt-2"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 pb-20 bg-gray-50 min-h-screen">
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10 mb-4 rounded-xl flex items-center">
                <button onClick={() => setView('menu')} className="mr-4 text-gray-500"><ArrowLeft /></button>
                <h1 className="text-xl font-bold text-gray-900">{getTitle()}</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                    <textarea
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 h-48 resize-none outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your message here..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        required
                        autoFocus
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg flex items-center justify-center"
                >
                    <Send size={20} className="mr-2" /> Send Notification
                </button>
            </form>
        </div>
    );
};

export default Notifications;
