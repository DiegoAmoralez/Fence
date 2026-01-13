import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation } from 'lucide-react';
import { useApp } from '../context/AppContext';

const MapView = () => {
    const navigate = useNavigate();
    const { currentJob } = useApp();
    const [navMode, setNavMode] = useState('preview'); // preview, navigating, arrived
    const [progress, setProgress] = useState(0);
    const [instruction, setInstruction] = useState('');

    useEffect(() => {
        let interval;
        if (navMode === 'navigating') {
            interval = setInterval(() => {
                setProgress(prev => {
                    const next = prev + 1;

                    // Dynamic Instructions
                    if (next < 20) setInstruction('Head North on Main St');
                    else if (next < 50) setInstruction('Turn Right onto Highway 95');
                    else if (next < 80) setInstruction('Take Exit 42 towards Industrial Park');
                    else setInstruction('Destination is on your right');

                    if (next >= 100) {
                        setNavMode('arrived');
                        return 100;
                    }
                    return next;
                });
            }, 50); // Speed of simulation
        }
        return () => clearInterval(interval);
    }, [navMode]);

    const startNavigation = () => {
        setNavMode('navigating');
        setProgress(0);
    };

    return (
        <div className="flex flex-col h-full bg-gray-100 pb-20 relative">
            {/* Header Overlay */}
            <div className="absolute top-4 left-4 z-10 w-full pr-8 flex items-start pointer-events-none">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-white p-3 rounded-full shadow-lg text-gray-700 hover:bg-gray-50 pointer-events-auto"
                >
                    <ArrowLeft size={24} />
                </button>

                {navMode === 'navigating' && (
                    <div className="ml-4 bg-blue-600 text-white p-4 rounded-xl shadow-lg flex-1 animate-in slide-in-from-top pointer-events-auto">
                        <div className="flex items-center space-x-3">
                            <Navigation className="shrink-0" size={32} />
                            <div>
                                <p className="font-bold text-lg">{instruction}</p>
                                <p className="text-blue-200 text-sm">{(100 - progress) * 10}m remaining</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Map Placeholder */}
            <div className="flex-1 bg-gray-200 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}></div>

                {/* Route Line Simulation */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <path d="M100,600 Q 200,300 300,400 T 500,200" fill="none" stroke="#0ea5e9" strokeWidth="6" strokeDasharray="10,5" strokeDashoffset={-progress * 5} />
                    {/* Progress Line */}
                    <path d="M100,600 Q 200,300 300,400 T 500,200" fill="none" stroke="#3b82f6" strokeWidth="6" strokeDasharray={`calc(${progress}% * 4) 1000`} />
                </svg>

                {/* Destination Marker */}
                <div className="absolute top-[200px] left-[500px] -ml-4 -mt-8 animate-bounce">
                    <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="w-8 h-2 bg-black/20 rounded-full mx-auto mt-1 blur-sm"></div>
                </div>
            </div>

            {/* Bottom Card */}
            <div className="bg-white p-6 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-10 animate-in slide-in-from-bottom duration-500">
                {currentJob ? (
                    <>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">{currentJob.customerName}</h2>
                        <p className="text-gray-500 mb-6">{currentJob.address}</p>

                        <div className="flex space-x-4">
                            {navMode === 'preview' && (
                                <button
                                    className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center shadow-lg shadow-blue-200"
                                    onClick={startNavigation}
                                >
                                    <Navigation className="mr-2" size={20} />
                                    Start Navigation
                                </button>
                            )}

                            {navMode === 'navigating' && (
                                <button
                                    className="flex-1 py-4 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 flex items-center justify-center"
                                    onClick={() => setNavMode('preview')}
                                >
                                    Cancel Navigation
                                </button>
                            )}

                            {navMode === 'arrived' && (
                                <button
                                    className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center justify-center shadow-lg animate-in zoom-in"
                                    onClick={() => navigate(`/job/${currentJob.id}/pre-jsa`)}
                                >
                                    <div className="mr-2 border-2 border-white rounded-full w-5 h-5 flex items-center justify-center" />
                                    I've Arrived
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center text-gray-500">No job selected</div>
                )}
            </div>
        </div>
    );
};

export default MapView;
