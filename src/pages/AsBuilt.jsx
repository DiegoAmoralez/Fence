import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowRight, Loader, Camera, PenTool, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockService } from '../services/MockService';
import SignaturePad from '../components/SignaturePad';

const AsBuilt = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { currentJob, user } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [form, setForm] = useState({
        truck: 'TR-204', // Should come from context
        photos: [],
        signature: null,
        itemsInstalled: [{ item: 'Fence Post', qty: 10, gateA: '', gateB: '' }], // Mock initial row
    });

    const handlePhotoUpload = () => {
        // Mock photo upload
        setForm(prev => ({
            ...prev,
            photos: [...prev.photos, { id: Date.now(), url: 'https://via.placeholder.com/150' }]
        }));
    };

    const handleSubmit = async () => {
        if (!form.signature || form.photos.length < 5) {
            alert("Please attach at least 5 photos and sign the document.");
            return; // Simple validation feedback
        }

        setIsLoading(true);
        await mockService.saveAsBuilt(jobId, form);
        await mockService.completeJob(jobId);
        setIsLoading(false);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-white p-6 flex flex-col justify-center text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-600" size={40} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Completed!</h1>
                <p className="text-gray-500 mb-8">As-Built documentation submitted for Job {jobId}.</p>

                <button
                    onClick={() => navigate('/schedule')}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg"
                >
                    Return to Schedule
                </button>
            </div>
        );
    }

    return (
        <div className="pb-24 bg-gray-50 min-h-screen">
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10 mb-4">
                <h1 className="text-lg font-bold text-gray-900">As-Built Documentation</h1>
                <p className="text-xs text-gray-500 text-center mt-1">
                    {currentJob?.type || 'Residential Set'}
                </p>
            </div>

            <div className="p-4 space-y-4">
                {/* Job Info Readonly */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="font-bold text-sm text-gray-500 uppercase mb-3">Job Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-gray-400">Foreman</span>
                            <span className="font-medium">{user?.name}</span>
                        </div>
                        <div>
                            <span className="block text-gray-400">Truck</span>
                            <span className="font-medium">{form.truck}</span>
                        </div>
                        <div>
                            <span className="block text-gray-400">Date</span>
                            <span className="font-medium">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Drawing Tool */}
                <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900">Site Drawing</h3>
                        <p className="text-xs text-gray-500">Update CRM drawing</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm flex items-center">
                        <PenTool size={16} className="mr-2" /> Open Canvas
                    </button>
                </div>

                {/* Items Installed */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="font-bold text-sm text-gray-500 uppercase mb-3">Items Installed</h3>
                    {form.itemsInstalled.map((item, idx) => (
                        <div key={idx} className="flex space-x-2 text-sm mb-2">
                            <input disabled value={item.item} className="w-1/2 p-2 bg-gray-50 rounded text-gray-600" />
                            <input value={item.qty} className="w-1/4 p-2 border rounded font-bold text-center" />
                            <div className="w-1/4 flex items-center justify-center text-gray-400 text-xs">edit</div>
                        </div>
                    ))}
                    <button className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-400 text-sm mt-2">
                        + Add Item
                    </button>
                </div>

                {/* Photos */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-sm text-gray-500 uppercase">Site Photos (Min 5)</h3>
                        <span className={`text-xs font-bold ${form.photos.length >= 5 ? 'text-green-600' : 'text-red-500'}`}>
                            {form.photos.length}/5
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                        {form.photos.map(p => (
                            <div key={p.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                                <img src={p.url} className="w-full h-full object-cover" />
                            </div>
                        ))}
                        <button
                            onClick={handlePhotoUpload}
                            className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                            <Camera size={24} className="mb-1" />
                            <span className="text-[10px]">Add Photo</span>
                        </button>
                    </div>
                </div>

                {/* Sign Off */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="font-bold text-sm text-gray-500 uppercase mb-3">Foreman Signature</h3>
                    <SignaturePad onEnd={(sig) => setForm(f => ({ ...f, signature: sig }))} />
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-20">
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                >
                    {isLoading ? <Loader className="animate-spin" /> : <>Submit As-Built <ArrowRight size={18} className="ml-2" /></>}
                </button>
            </div>
        </div>
    );
};

export default AsBuilt;
