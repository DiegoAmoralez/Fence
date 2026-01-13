import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Clock, Plus, ArrowLeft, Trash2, Calendar, Search, Filter, Edit2, CheckCircle2, Circle } from 'lucide-react';

const Reminders = () => {
    const navigate = useNavigate();
    const [reminders, setReminders] = useState([]);
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, pending, completed
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('app_reminders');
        if (saved) {
            setReminders(JSON.parse(saved));
        } else {
            // Initial mock reminders
            const mocks = [
                { id: 1, note: 'Pick up safety cones from yard', date: '2026-01-14', completed: false },
                { id: 2, note: 'Call client regarding fence height', date: '2026-01-13', completed: true }
            ];
            setReminders(mocks);
            localStorage.setItem('app_reminders', JSON.stringify(mocks));
        }
    }, []);

    const saveReminders = (list) => {
        setReminders(list);
        localStorage.setItem('app_reminders', JSON.stringify(list));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            const newList = reminders.map(r => r.id === editingId ? { ...r, note, date } : r);
            saveReminders(newList);
            setEditingId(null);
        } else {
            const newItem = {
                id: Date.now(),
                note,
                date,
                completed: false
            };
            saveReminders([newItem, ...reminders]);
        }
        setNote('');
        setDate(new Date().toISOString().split('T')[0]);
    };

    const toggleComplete = (id) => {
        const newList = reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r);
        saveReminders(newList);
    };

    const deleteReminder = (id) => {
        const newList = reminders.filter(r => r.id !== id);
        saveReminders(newList);
    };

    const startEdit = (reminder) => {
        setNote(reminder.note);
        setDate(reminder.date);
        setEditingId(reminder.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredReminders = reminders.filter(r => {
        const matchesSearch = r.note.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || (filter === 'completed' ? r.completed : !r.completed);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="p-4 pb-24 bg-gray-50 min-h-screen">
            <div className="bg-white p-4 shadow-sm sticky top-0 z-30 mb-6 rounded-2xl flex items-center justify-between border border-gray-100">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-50 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Reminders</h1>
                </div>
                <div className="flex bg-blue-50 px-3 py-1.5 rounded-full">
                    <span className="text-xs font-bold text-blue-600">{reminders.filter(r => !r.completed).length} Pending</span>
                </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 mb-8 border border-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Clock size={80} />
                </div>
                <h2 className="text-lg font-black text-slate-800 mb-4">{editingId ? 'Edit Reminder' : 'New Reminder'}</h2>
                <div className="space-y-4">
                    <div>
                        <textarea
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl h-24 resize-none outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
                            placeholder="What do you need to remember?"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex space-x-3">
                        <div className="flex-1 relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="date"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-600"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className={`px-6 py-3.5 rounded-2xl font-black transition-all flex items-center justify-center shadow-lg ${editingId ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-blue-600 text-white shadow-blue-200'
                                }`}
                        >
                            {editingId ? <ArrowLeft size={20} className="rotate-180" /> : <Plus size={20} />}
                        </button>
                    </div>
                    {editingId && (
                        <button
                            type="button"
                            onClick={() => { setEditingId(null); setNote(''); }}
                            className="w-full py-2 text-xs font-bold text-slate-400 uppercase tracking-widest"
                        >
                            Cancel Editing
                        </button>
                    )}
                </div>
            </form>

            {/* List Controls */}
            <div className="space-y-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search reminders..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    />
                </div>

                <div className="flex space-x-2">
                    {['all', 'pending', 'completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-gray-100'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reminders List */}
            <div className="space-y-4">
                {filteredReminders.length > 0 ? filteredReminders.map(r => (
                    <div
                        key={r.id}
                        className={`bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-start group relative transition-all ${r.completed ? 'opacity-60' : ''}`}
                    >
                        <button
                            onClick={() => toggleComplete(r.id)}
                            className={`mt-1 mr-4 transition-colors ${r.completed ? 'text-green-500' : 'text-slate-300 hover:text-blue-500'}`}
                        >
                            {r.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </button>

                        <div className="flex-1">
                            <h3 className={`font-bold text-slate-800 mb-1 ${r.completed ? 'line-through' : ''}`}>{r.note}</h3>
                            <div className="flex items-center text-xs font-bold text-slate-400">
                                <Calendar size={12} className="mr-1" />
                                {new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                        </div>

                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => startEdit(r)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => deleteReminder(r.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-50">
                            <Clock size={40} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-black text-slate-300 tracking-tight">No Reminders Found</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reminders;
