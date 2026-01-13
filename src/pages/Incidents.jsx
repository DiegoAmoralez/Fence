import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { mockService } from '../services/MockService';
import SignaturePad from '../components/SignaturePad';
import { ArrowLeft, Save, Send, Camera, AlertTriangle, CheckCircle } from 'lucide-react';

const IncidentForm = ({ type, onSubmit }) => {
    const { user } = useApp();
    const [form, setForm] = useState({});
    const [signature, setSignature] = useState(null);

    const handleInput = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submit = () => {
        if (!signature) {
            alert("Signature required.");
            return;
        }
        onSubmit({ ...form, signature });
    };

    // --- Dynamic Fields based on Type ---

    return (
        <div className="space-y-4">
            {/* Common Fields */}
            <div>
                <label className="block text-sm font-bold text-gray-700">Date of Incident</label>
                <input type="date" name="date" className="w-full p-2 border rounded-lg bg-gray-50" onChange={handleInput} />
            </div>

            {/* Specific Fields */}
            {type === 'employee' && (
                <>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Employee Name</label>
                        <input type="text" name="employeeName" className="w-full p-2 border rounded-lg bg-gray-50" defaultValue={user?.name} onChange={handleInput} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Nature of Injury</label>
                        <select name="injuryType" className="w-full p-2 border rounded-lg bg-gray-50" onChange={handleInput}>
                            <option>Select...</option>
                            <option>Cut/Laceration</option>
                            <option>Strain/Sprain</option>
                            <option>Bruise</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Description (Who, what, where, when)</label>
                        <textarea name="description" className="w-full p-2 border rounded-lg bg-gray-50 h-24" onChange={handleInput}></textarea>
                    </div>
                </>
            )}

            {type === 'witness' && (
                <>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Witness Name</label>
                        <input type="text" name="witnessName" className="w-full p-2 border rounded-lg bg-gray-50" onChange={handleInput} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Description of what was witnessed</label>
                        <textarea name="description" className="w-full p-2 border rounded-lg bg-gray-50 h-24" onChange={handleInput}></textarea>
                    </div>
                </>
            )}

            {type === 'utility' && (
                <>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Damaged Utility Type</label>
                        <div className="space-y-1 mt-1">
                            {['Electric', 'Sewer', 'Gas', 'Water', 'Fiber/Phone'].map(u => (
                                <label key={u} className="flex items-center space-x-2">
                                    <input type="checkbox" name="utilityType" value={u} />
                                    <span>{u}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Were lines marked?</label>
                        <select name="marked" className="w-full p-2 border rounded-lg bg-gray-50" onChange={handleInput}>
                            <option>Yes</option>
                            <option>No</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Photos (Close-up & Wide)</label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <button type="button" className="h-20 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400">
                                <Camera />
                            </button>
                            <button type="button" className="h-20 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400">
                                <Camera />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Signature */}
            <div className="pt-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Signature</label>
                <SignaturePad onEnd={setSignature} />
            </div>

            <button
                onClick={submit}
                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg mt-4 flex items-center justify-center"
            >
                Submit Report <Send size={18} className="ml-2" />
            </button>
        </div>
    );
};

const Incidents = ({ type: defaultType }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('employee');
    const [submitted, setSubmitted] = useState(false);

    // If accessed via public route, might differ logic, but reusing component for now.

    const handleSubmit = async (data) => {
        await mockService.submitIncident(activeTab, data);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-white p-6 flex flex-col justify-center text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-600" size={40} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Submitted</h1>
                <p className="text-gray-500 mb-8">
                    Your report has been emailed to the Incident Reporting Group for review.
                </p>
                <button
                    onClick={() => { setSubmitted(false); navigate('/') }}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div className="pb-20 bg-gray-50 min-h-screen">
            <div className="bg-red-600 text-white p-4 sticky top-0 z-10 shadow-md">
                <div className="flex items-center mb-2">
                    <button onClick={() => navigate(-1)} className="mr-4 p-1 hover:bg-red-700 rounded"><ArrowLeft size={24} /></button>
                    <h1 className="text-xl font-bold">Incident Reporting</h1>
                </div>
                <p className="text-red-100 text-sm">Please complete all fields accurately.</p>
            </div>

            {/* Tabs */}
            <div className="flex p-2 bg-white shadow-sm mb-4 overflow-x-auto space-x-2">
                {[
                    { id: 'employee', label: 'Employee Injury' },
                    { id: 'utility', label: 'Utility Hit' },
                    { id: 'witness', label: 'Witness Stmt' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab.id
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-4 bg-white m-4 rounded-xl shadow-sm">
                <IncidentForm type={activeTab} onSubmit={handleSubmit} />
            </div>
        </div>
    );
};

export default Incidents;
