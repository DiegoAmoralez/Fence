import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Truck, CheckCircle, ArrowRight, ExternalLink, Loader } from 'lucide-react';
import clsx from 'clsx';

const VehicleWalkAround = () => {
    const [step, setStep] = useState('intro'); // intro, gomotive, truck-number, success
    const [truckNum, setTruckNum] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { setDailyTruckNumber } = useApp();
    const navigate = useNavigate();

    const handleOpenGoMotive = () => {
        setIsSubmitting(true);
        // Simulate external app launch
        setTimeout(() => {
            setIsSubmitting(false);
            setStep('truck-number');
        }, 1500);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!truckNum.trim()) return;

        setIsSubmitting(true);
        await setDailyTruckNumber(truckNum);
        setIsSubmitting(false);
        setStep('success');

        // Auto redirect after success
        setTimeout(() => {
            navigate('/');
        }, 1500);
    };

    return (
        <div className="p-6 pb-20 max-w-lg mx-auto">
            {/* Header / Progress */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="text-gray-500 text-sm mb-4 hover:text-gray-800"
                >
                    &larr; Back to Home
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Start of Day</h1>
                <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                    <span className={clsx(step === 'intro' || step === 'gomotive' ? "text-blue-600 font-bold" : "")}>1. Walk Around</span>
                    <span>&rarr;</span>
                    <span className={clsx(step === 'truck-number' ? "text-blue-600 font-bold" : "")}>2. Truck Info</span>
                </div>
            </div>

            {step === 'intro' && (
                <div className="bg-white p-6 rounded-2xl shadow-premium border-l-4 border-blue-500 animate-in slide-in-from-right">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <Truck className="text-blue-600" size={32} />
                    </div>

                    <h2 className="text-xl font-bold text-center mb-4">Vehicle Inspection Required</h2>
                    <p className="text-gray-600 text-center mb-8">
                        Please ensure all checks are completed thoroughly. Use the GoMotive app to record your official inspection.
                    </p>

                    <button
                        onClick={handleOpenGoMotive}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center space-x-2 transition-all"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center space-x-2">
                                <Loader className="animate-spin" size={20} />
                                <span>Opening GoMotive...</span>
                            </div>
                        ) : (
                            <>
                                <span>Begin Walk Around</span>
                                <ExternalLink size={18} />
                            </>
                        )}
                    </button>
                </div>
            )}

            {step === 'truck-number' && (
                <div className="bg-white p-6 rounded-2xl shadow-premium animate-in slide-in-from-right">
                    <h2 className="text-xl font-bold mb-6">Confirm Truck Details</h2>
                    <form onSubmit={handleSubmit}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Truck Number</label>
                        <input
                            type="text"
                            className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 text-lg mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. TR-204"
                            value={truckNum}
                            onChange={(e) => setTruckNum(e.target.value)}
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!truckNum.trim() || isSubmitting}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                        >
                            {isSubmitting ? <Loader className="animate-spin mx-auto" /> : 'Submit Truck Number'}
                        </button>
                    </form>
                </div>
            )}

            {step === 'success' && (
                <div className="text-center py-10 animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-600" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">All Set!</h2>
                    <p className="text-gray-500">Your daily schedule is now unlocked.</p>
                </div>
            )}
        </div>
    );
};

export default VehicleWalkAround;
