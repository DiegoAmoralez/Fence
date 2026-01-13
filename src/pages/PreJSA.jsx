import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, AlertTriangle, CheckCircle, Save, ArrowRight, Loader } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockService } from '../services/MockService';

const PreJSA = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { currentJob, setCurrentJob, isOffline } = useApp();

    const [step, setStep] = useState('arrival'); // arrival, form, success
    const [isLoading, setIsLoading] = useState(false);
    const [approaching, setApproaching] = useState(false); // Simulate "near job site"

    // Form State
    const [formData, setFormData] = useState({
        q1: { answer: null, details: '' }, // Understand tasks
        q2: { answer: null, details: '' }, // PPE
        q3: { answer: null, details: '' }, // Tools/Equip
        q4: { answer: null, details: '' }, // Emergency
    });

    useEffect(() => {
        // If coming directly via URL, fetch job
        const init = async () => {
            let job = currentJob;
            if (!job) {
                job = await mockService.getJob(jobId);
                setCurrentJob(job);
            }

            // Check if PreJSA is already done
            if (job && job.preJsa) {
                console.log('PreJSA already done, redirecting to dashboard');
                navigate(`/job/${jobId}/dashboard`, { replace: true });
            }
        };
        init();

        // Simulate GPS approach detection
        const timer = setTimeout(() => setApproaching(true), 1500);

        // Load saved progress if any (mock)
        const saved = localStorage.getItem(`prejsa_${jobId}`);
        if (saved) {
            setFormData(JSON.parse(saved));
        }

        return () => clearTimeout(timer);
    }, [jobId, currentJob]);

    const handleArrival = () => {
        setIsLoading(true);
        // Simulate check-in
        setTimeout(() => {
            setIsLoading(false);
            setStep('form');
        }, 800);
    };

    const handleOptionChange = (q, val) => {
        const newData = { ...formData, [q]: { ...formData[q], answer: val } };
        setFormData(newData);
        localStorage.setItem(`prejsa_${jobId}`, JSON.stringify(newData));
    };

    const handleDetailsChange = (q, val) => {
        const newData = { ...formData, [q]: { ...formData[q], details: val } };
        setFormData(newData);
        localStorage.setItem(`prejsa_${jobId}`, JSON.stringify(newData));
    };

    const isFormValid = () => {
        // All Must be Yes or No. If No, details required? Prompt implies "If no, why?"
        return Object.keys(formData).every(k => {
            const item = formData[k];
            if (item.answer === null) return false;
            // Assuming if NO, must provide details
            if (item.answer === false && !item.details.trim()) return false;
            return true;
        });
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        await mockService.savePreJSA(jobId, formData);
        const updatedJob = await mockService.startJob(jobId);

        // Critical: Update context so Dashboard sees the new status/history immediately
        if (updatedJob) {
            setCurrentJob(updatedJob);
        }

        // Clear local saved progress
        localStorage.removeItem(`prejsa_${jobId}`);

        setIsLoading(false);
        setStep('success');
    };

    const handleContinueToWork = () => {
        // Go to new Dashboard
        navigate(`/job/${jobId}/dashboard`);
    };

    if (!currentJob) return <div className="p-8 text-center">Loading Job context...</div>;

    // --- RENDER STEPS ---

    if (step === 'arrival') {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex flex-col text-center pb-20">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
                    <MapPin className="text-blue-600" size={40} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">You have arrived at</h1>
                <h2 className="text-xl text-blue-600 font-bold mb-4">{currentJob.customerName}</h2>
                <p className="text-gray-500 mb-6">{currentJob.address}</p>

                {/* Enhanced Job Details Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-left mb-6">
                    <h3 className="font-bold text-gray-700 text-sm uppercase mb-3">Job Details</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Job ID:</span>
                            <span className="font-bold">{currentJob.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Contact:</span>
                            <span className="font-bold">{currentJob.phone}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-50">
                            <span className="text-gray-500 block mb-1">Notes:</span>
                            <p className="text-gray-800 italic bg-gray-50 p-2 rounded">{currentJob.notes}</p>
                        </div>
                    </div>
                </div>

                {!approaching ? (
                    <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl mb-4 flex items-center justify-center">
                        <Loader className="animate-spin mr-2" size={16} /> Verifying GPS location...
                    </div>
                ) : (
                    <div className="p-4 bg-green-50 text-green-800 rounded-xl mb-4 text-sm flex items-center">
                        <CheckCircle size={16} className="mr-2" /> GPS Confirmed within geofence.
                    </div>
                )}

                <div className="mt-auto">
                    <button
                        onClick={handleArrival}
                        disabled={!approaching || isLoading}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg"
                    >
                        {isLoading ? 'Checking in...' : 'Start JSA and begin work'}
                    </button>
                    <p className="text-xs text-gray-400 mt-4">By tapping above, you confirm arrival at the correct job site.</p>
                </div>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-white p-6 flex flex-col justify-center text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-600" size={40} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">You are safe to start!</h1>
                <p className="text-gray-500 mb-8">Pre-Job Safety Analysis has been logged.</p>
                <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-100 mb-8">
                    <h3 className="font-bold text-gray-900 mb-2">Next Steps:</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>Perform planned work</li>
                        <li>Maintain safety protocols</li>
                        <li>Complete Post-JSA when finished</li>
                    </ul>
                </div>
                <button
                    onClick={handleContinueToWork}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg"
                >
                    Begin Work
                </button>
            </div>
        )
    }

    // FORM STEP
    const Question = ({ id, text, state, onOption, onDetails }) => (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-4">
            <p className="font-bold text-gray-800 mb-4">{text}</p>
            <div className="flex space-x-3 mb-4">
                <button
                    onClick={() => onOption(id, true)}
                    className={`flex-1 py-3 rounded-lg font-bold border ${state.answer === true ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-500 border-gray-200'}`}
                >
                    Yes
                </button>
                <button
                    onClick={() => onOption(id, false)}
                    className={`flex-1 py-3 rounded-lg font-bold border ${state.answer === false ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-500 border-gray-200'}`}
                >
                    No
                </button>
            </div>

            {state.answer === false && (
                <textarea
                    placeholder="If no, please explain why..."
                    className="w-full p-3 border border-red-200 bg-red-50 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                    value={state.details}
                    onChange={(e) => onDetails(id, e.target.value)}
                />
            )}
        </div>
    );

    return (
        <div className="pb-24 bg-gray-50 min-h-screen animate-in fade-in duration-500">
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
                <h1 className="text-lg font-bold text-gray-900">Pre-Job Safety Analysis</h1>
                <p className="text-xs text-gray-500 text-center mt-1">
                    {currentJob.customerName} - {currentJob.id}
                </p>
            </div>

            <div className="p-4">
                <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm flex items-start">
                    <AlertTriangle size={18} className="shrink-0 mr-2 mt-0.5" />
                    Please review site conditions and ensure team readiness before proceeding.
                </div>

                <Question
                    id="q1"
                    text="Does the Team fully understand the task procedures and the potential hazards on this job site?"
                    state={formData.q1}
                    onOption={handleOptionChange}
                    onDetails={handleDetailsChange}
                />
                <Question
                    id="q2"
                    text="Do team members have the required PPE for this job site, and can they confidently explain how and when to use it?"
                    state={formData.q2}
                    onOption={handleOptionChange}
                    onDetails={handleDetailsChange}
                />
                <Question
                    id="q3"
                    text="Have all team members been certified and trained to use the tools and equipment on site properly and safely?"
                    state={formData.q3}
                    onOption={handleOptionChange}
                    onDetails={handleDetailsChange}
                />
                <Question
                    id="q4"
                    text="Have all team members reviewed and understood the emergency reporting procedures?"
                    state={formData.q4}
                    onOption={handleOptionChange}
                    onDetails={handleDetailsChange}
                />
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex space-x-3 z-20">
                {/* Save button removed as per request */}
                <button
                    onClick={handleSubmit}
                    disabled={!isFormValid() || isLoading}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                >
                    {isLoading ? <Loader className="animate-spin" /> : <>Submit JSA <ArrowRight size={18} className="ml-2" /></>}
                </button>
            </div>
        </div>
    );
};

export default PreJSA;
