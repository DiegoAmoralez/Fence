import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Clock, Plus, ArrowLeft } from 'lucide-react';

const Reminders = () => {
    const navigate = useNavigate();
    const [note, setNote] = useState('');
    const [date, setDate] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        // Persist via context would be ideal, but for demo, local state confirmation is enough
    };

    if (submitted) {
        return (
            <div className="p-6 text-center animate-in zoom-in">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="text-blue-600" size={32} />
                </div>
                <h2 className="text-xl font-bold mb-2">Reminder Set</h2>
                <p className="text-gray-500 mb-6">Your reminder for {date} has been saved.</p>
                <button
                    onClick={() => navigate('/')}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 pb-20 bg-gray-50 min-h-screen">
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10 mb-4 rounded-xl flex items-center">
                <button onClick={() => navigate(-1)} className="mr-4 text-gray-500"><ArrowLeft /></button>
                <h1 className="text-xl font-bold text-gray-900">Reminders</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Reminder Note</label>
                    <textarea
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 h-32 resize-none outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Call client about gate access..."
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        required
                    />
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                    <input
                        type="date"
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg flex items-center justify-center"
                >
                    <Plus size={20} className="mr-2" /> Set Reminder
                </button>
            </form>
        </div>
    );
};

export default Reminders;
