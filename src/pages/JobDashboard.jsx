import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { mockService } from '../services/MockService';
import {
    Phone, MapPin, FileText, CheckCircle,
    AlertTriangle, Hammer, HelpCircle,
    ArrowRight, PauseCircle, Loader, X, Send, Clock
} from 'lucide-react';

const JobDashboard = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { currentJob, setCurrentJob } = useApp();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('in-progress'); // in-progress, hold-equip, hold-help

    // Modal State
    const [modalOpen, setModalOpen] = useState(null); // 'equipment', 'help'
    const [requestDetails, setRequestDetails] = useState('');
    const [submittingRequest, setSubmittingRequest] = useState(false);

    useEffect(() => {
        const loadJob = async () => {
            // Always fetch latest to ensure sync, even if we have context (context might be stale from other tab/nav)
            // But for now, if we have currentJob and it matches ID, trust it?
            // Better: If we have currentJob, use it, but maybe background refresh?
            // Users issue: "White Screen".
            // The replace above fixes the spread crash.
            // Let's also ensure setStatus handles missing status gracefully.
            if (!currentJob || currentJob.id !== jobId) {
                const job = await mockService.getJob(jobId);
                setCurrentJob(job);
                if (job) setStatus(job.status || 'in-progress');
            } else {
                setStatus(currentJob.status || 'in-progress');
            }
            setTimeout(() => setLoading(false), 600);
        };
        loadJob();
    }, [jobId, currentJob, setCurrentJob]);

    const handleOpenModal = (type) => {
        setModalOpen(type);
        setRequestDetails('');
    };

    const handleCloseModal = () => {
        setModalOpen(null);
        setRequestDetails('');
    };

    const handleSubmitRequest = async () => {
        if (!requestDetails.trim()) return;

        setSubmittingRequest(true);

        let newStatus = status;
        if (modalOpen === 'equipment') newStatus = 'hold-equip';
        if (modalOpen === 'help') newStatus = 'hold-help';

        // Persist to service
        await mockService.updateJobStatus(jobId, newStatus, requestDetails);

        // Update local context/state
        const updatedJob = { ...currentJob, status: newStatus };
        setCurrentJob(updatedJob);
        setStatus(newStatus);

        setSubmittingRequest(false);
        handleCloseModal();
    };

    const handleResume = async () => {
        try {
            // Use returned job to ensure history and status are in sync
            const updated = await mockService.updateJobStatus(jobId, 'in-progress', 'Resumed work');
            if (updated) {
                setCurrentJob(updated);
                setStatus('in-progress');
            }
        } catch (error) {
            console.error("Resume failed:", error);
            // Fallback
            setStatus('in-progress');
        }
    };

    const handleComplete = () => {
        navigate(`/job/${jobId}/post-jsa`);
    };

    if (loading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
                <Loader className="animate-spin text-blue-600 mb-4" size={48} />
                <p className="text-gray-500 font-medium animate-pulse">Loading Job Dashboard...</p>
            </div>
        );
    }

    if (!currentJob) {
        return <div className="p-8 text-center text-red-500">Job not found. <button onClick={() => navigate('/')} className="underline">Go Home</button></div>;
    }

    // Blocking pre-JSA check removed. Handled inline in UI now.

    return (
        <div className="min-h-screen bg-gray-50 pb-24 animate-in fade-in duration-500">
            {/* Header / Status Card */}
            <div className="bg-white p-6 shadow-sm border-b border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{currentJob.customerName}</h1>
                        <p className="text-gray-500 text-sm ">{currentJob.id}</p>
                    </div>
                    {status === 'in-progress' && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold animate-pulse">
                            IN PROGRESS
                        </span>
                    )}
                    {status === 'completed' && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            COMPLETED
                        </span>
                    )}
                    {status === 'hold-equip' && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                            WAITING FOR EQUIP
                        </span>
                    )}
                    {status === 'hold-help' && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                            WAITING FOR HELP
                        </span>
                    )}
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                        <MapPin size={16} className="mr-2 text-blue-500" />
                        {currentJob.address}
                    </div>
                    <div className="flex items-center">
                        <Phone size={16} className="mr-2 text-blue-500" />
                        {currentJob.phone}
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">

                {/* Job Info / Notes - Moved Up */}
                {currentJob.notes && !currentJob.notes.includes('Status Update') && (
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2 flex items-center"><FileText size={18} className="mr-2 text-gray-500" />Notes</h3>
                        <p className="text-sm text-gray-600 italic">"{currentJob.notes}"</p>
                    </div>
                )}

                {/* Pre-JSA Required Alert - If NOT done, show this instead of controls */}
                {!currentJob.preJsa && status !== 'completed' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center shadow-sm">
                        <AlertTriangle size={48} className="text-orange-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Safety Check Required</h2>
                        <p className="text-gray-600 mb-6">
                            You must complete the Pre-Job Safety Analysis before starting work.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/map')}
                                className="w-full py-4 bg-white text-blue-600 border border-blue-200 rounded-xl font-bold hover:bg-blue-50 shadow-sm flex items-center justify-center"
                            >
                                <MapPin size={20} className="mr-2" />
                                Map Destination
                            </button>

                            <button
                                onClick={() => navigate(`/job/${jobId}/pre-jsa`)}
                                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg flex items-center justify-center animate-pulse"
                            >
                                Start Safety Check <ArrowRight size={20} className="ml-2" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Completed Banner */}
                {status === 'completed' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center animate-in slide-in-from-top duration-300">
                        <CheckCircle className="text-green-600 shrink-0 mr-3" size={24} />
                        <div>
                            <h3 className="font-bold text-green-800">Job Complete</h3>
                            <p className="text-sm text-green-700 mt-1">
                                This job has been successfully closed and archived.
                            </p>
                        </div>
                    </div>
                )}

                {/* On Hold Banner */}
                {status !== 'in-progress' && status !== 'completed' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start animate-in slide-in-from-top duration-300">
                        <PauseCircle className="text-orange-500 shrink-0 mr-3" />
                        <div>
                            <h3 className="font-bold text-orange-800">Job on Hold</h3>
                            <p className="text-sm text-orange-700 mt-1">
                                Request sent. Waiting for {status === 'hold-equip' ? 'equipment' : 'support'}.
                            </p>
                            <button
                                onClick={handleResume}
                                className="mt-3 text-sm font-bold text-orange-600 underline"
                            >
                                Resume Work
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Actions - Only if Pre-JSA is DONE */}
                {currentJob.preJsa && (
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Job Controls</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleOpenModal('equipment')}
                                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center text-center hover:bg-gray-100 transition-transform active:scale-95"
                                >
                                    <Hammer className="text-gray-600 mb-2" />
                                    <span className="text-sm font-medium text-gray-700">Request Equipment</span>
                                </button>
                                <button
                                    onClick={() => handleOpenModal('help')}
                                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center text-center hover:bg-gray-100 transition-transform active:scale-95"
                                >
                                    <HelpCircle className="text-gray-600 mb-2" />
                                    <span className="text-sm font-medium text-gray-700">Request Help</span>
                                </button>
                            </div>
                        </div>

                        {/* Completion Card */}
                        {status !== 'completed' && (
                            <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden transform transition-all hover:scale-[1.01]">
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold mb-2">Work Complete?</h3>
                                    <p className="text-blue-100 mb-6 text-sm">
                                        Proceed to Post-Job Safety Analysis and As-Built documentation.
                                    </p>
                                    <button
                                        onClick={handleComplete}
                                        className="w-full py-3 bg-white text-blue-600 rounded-lg font-bold flex items-center justify-center hover:bg-blue-50 transition-colors shadow-md"
                                    >
                                        Complete Job <ArrowRight size={18} className="ml-2" />
                                    </button>
                                </div>

                                {/* Decor */}
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 p-4 bg-white/10 rounded-full">
                                    <CheckCircle size={64} className="text-white/20" />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Status History (Consolidated) */}
                {currentJob.history && currentJob.history.length > 0 && (
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                            <Clock size={18} className="mr-2 text-gray-500" />
                            Activity History
                        </h3>
                        <div className="space-y-4">
                            {(currentJob.history || []).slice().reverse().map((item, idx) => (
                                <div key={idx} className="flex items-start relative pl-4 border-l-2 border-gray-100 last:border-0 pb-4 last:pb-0">
                                    <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${item.status.includes('hold') ? 'bg-orange-400' :
                                        item.status === 'completed' ? 'bg-green-500' :
                                            item.status === 'safety-check' ? 'bg-purple-500' :
                                                'bg-blue-400'
                                        }`}></div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-0.5">
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                            <span className="mx-1">•</span>
                                            {new Date(item.timestamp).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm font-medium text-gray-700">
                                            {item.status === 'safety-check' ? 'Safety Check Completed' :
                                                item.status === 'started' ? 'Job Started' :
                                                    (item.status || 'unknown').toUpperCase().replace('-', ' ')}
                                        </p>
                                        {item.details && (
                                            <p className="text-sm text-gray-500 mt-1 bg-gray-50 p-2 rounded">
                                                {item.details}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* Request Modal Overlay */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-900">
                                {modalOpen === 'equipment' ? 'Request Equipment' : 'Request Assistance'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                {modalOpen === 'equipment' ? 'What equipment do you need?' : 'Describe the issue:'}
                            </label>
                            <textarea
                                autoFocus
                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px] text-gray-700"
                                placeholder={modalOpen === 'equipment' ? 'E.g., Auger extension, generator...' : 'E.g., Hit rock, need supervisor review...'}
                                value={requestDetails}
                                onChange={(e) => setRequestDetails(e.target.value)}
                            />

                            <div className="mt-6 flex space-x-3">
                                <button
                                    onClick={handleCloseModal}
                                    className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitRequest}
                                    disabled={!requestDetails.trim() || submittingRequest}
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
                                >
                                    {submittingRequest ? <Loader className="animate-spin" /> : <>Send Request <Send size={18} className="ml-2" /></>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobDashboard;
