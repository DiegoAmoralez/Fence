import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Save, ArrowRight, ArrowLeft, Loader, Camera,
    PenTool, CheckCircle, Plus, Trash2, X, ChevronRight,
    Clock, Truck, MapPin, User, Info, CheckSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockService } from '../services/MockService';
import SignaturePad from '../components/SignaturePad';
import DrawingPad from '../components/DrawingPad';

const ITEMS_LIST = ['Chain Link', 'Vinyl', 'Wood Fence', 'Aluminum', 'Gate - Single', 'Gate - Double', 'Post - Line', 'Post - Terminal'];

const AsBuilt = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { user, truckNumber } = useApp();
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [jobData, setJobData] = useState(null);
    const [showDrawingModal, setShowDrawingModal] = useState(false);

    const [form, setForm] = useState({
        // Screen 1: Header + Crew
        jobName: '',
        address: {
            street: '',
            zip: '',
            city: '',
            state: ''
        },
        crew: {
            estimator: '',
            foreman: user?.name || '',
            secondMan: '',
            thirdMan: ''
        },
        timestamps: {
            date: new Date().toISOString().split('T')[0],
            clockIn: '',
            arriveSite: '',
            departSite: '',
            clockOut: ''
        },
        truckNumber: truckNumber || '',

        // Screen 2: Drawing
        drawing: null,

        // Screen 3: Items + Bay Info
        itemsInstalled: [{ item: 'Chain Link', qty: 0, a: '', b: '', c: '', d: '', e: '' }],
        bayInfo: {
            total: 0,
            full: 0,
            short: 0,
            iToIPost: 0,
            iToIDegree: 0,
            iToITek: 0,
            fullBaysIToI: 0
        },

        // Screen 4: Photos
        photos: {
            front: null,
            rear: null,
            sideA: null,
            sideB: null,
            signage: null,
            additional: []
        },

        // Screen 5: Additional
        checklists: {
            dumpster: 'Please Select',
            lunch: 'Please Select',
            sprinklerIns: 'Please Select',
            dirtRemoval: 'Please Select',
            removal: 'Please Select',
            reviewed: 'Please Select',
            tools: 'Please Select',
            completed: 'Please Select'
        },
        handDigs: '',
        notes: '',
        extraFields: { a: '', b: '', c: '' },

        // Screen 6: Signature
        signature: null
    });

    useEffect(() => {
        const fetchJob = async () => {
            setIsLoading(true);
            const data = await mockService.getJob(jobId);
            if (data) {
                setJobData(data);
                // Pre-fill some data if available
                setForm(prev => ({
                    ...prev,
                    jobName: data.customerName,
                    address: {
                        street: data.address.split(',')[0],
                        city: data.address.split(',')[1]?.trim() || '',
                        state: data.address.split(',')[2]?.trim().split(' ')[0] || '',
                        zip: data.address.split(',')[2]?.trim().split(' ')[1] || '',
                    },
                    bayInfo: data.bayInfo ? {
                        ...prev.bayInfo,
                        total: data.bayInfo.totalBays,
                        full: data.bayInfo.fullBays,
                        short: data.bayInfo.shortBays
                    } : prev.bayInfo,
                    truckNumber: data.truckNumber || prev.truckNumber
                }));
            }

            // Check for saved progress
            const saved = localStorage.getItem(`asbuilt_progress_${jobId}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                setForm(prev => ({ ...prev, ...parsed.form }));
                setCurrentStep(parsed.step);
            }

            setIsLoading(false);
        };
        fetchJob();
    }, [jobId]);

    const saveProgress = (step) => {
        localStorage.setItem(`asbuilt_progress_${jobId}`, JSON.stringify({ form, step }));
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            const next = currentStep + 1;
            setCurrentStep(next);
            saveProgress(next);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        const prev = currentStep - 1;
        setCurrentStep(prev);
        saveProgress(prev);
        window.scrollTo(0, 0);
    };

    const validateStep = (step) => {
        switch (step) {
            case 1:
                return form.jobName && form.address.street && form.crew.foreman && form.crew.secondMan && form.timestamps.clockIn;
            case 2:
                if (!form.drawing) {
                    alert("Please save your drawing before proceeding.");
                    return false;
                }
                return true;
            case 3:
                return form.itemsInstalled.length > 0 && form.itemsInstalled[0].qty > 0;
            case 4:
                const { front, rear, sideA, sideB, signage } = form.photos;
                if (!front || !rear || !sideA || !sideB || !signage) {
                    alert("All 5 mandatory photos are required.");
                    return false;
                }
                return true;
            case 5:
                return true; // Mostly optional/selects
            default:
                return true;
        }
    };

    const handleSubmit = async () => {
        if (!form.signature) {
            alert("Digital signature is required.");
            return;
        }
        setIsSubmitting(true);
        await mockService.saveAsBuilt(jobId, form);
        await mockService.completeJob(jobId);
        setIsSubmitting(false);
        setSubmitted(true);
        localStorage.removeItem(`asbuilt_progress_${jobId}`);
    };

    const handlePhotoMock = (key) => {
        setForm(prev => ({
            ...prev,
            photos: {
                ...prev.photos,
                [key]: `https://images.unsplash.com/photo-1504198266287-1659872e6590?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60`
            }
        }));
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader className="animate-spin text-blue-600" size={40} />
        </div>
    );

    if (submitted) return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8 animate-bounce">
                <CheckCircle className="text-green-400" size={48} />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-4">Documentation Complete!</h1>
            <p className="text-slate-400 mb-10 max-w-sm">
                Thank you for completing your As-Built for job number <span className="text-blue-400 font-mono">{jobId}</span>. Data has been synced to CRM.
            </p>
            <button
                onClick={() => navigate('/home')}
                className="w-full max-w-xs py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-900/40 transition-all active:scale-95"
            >
                Return Home
            </button>
        </div>
    );

    const ProgressHeader = () => (
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
            <div className="p-4 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 flex items-center">
                            As-Built <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded uppercase tracking-wider">{jobData?.type}</span>
                        </h1>
                        <p className="text-xs text-slate-500 font-mono">{jobId}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-bold text-blue-600">Step {currentStep} of 6</span>
                        <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-500"
                                style={{ width: `${(currentStep / 6) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Demo Toggle for Type Adaptation */}
                <div className="flex bg-slate-50 p-1 rounded-xl items-center border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 px-3 truncate uppercase tracking-tighter">Demo Type</span>
                    <select
                        className="flex-1 bg-transparent border-none text-xs font-bold text-blue-600 outline-none py-2"
                        value={jobData?.type || ''}
                        onChange={(e) => setJobData({ ...jobData, type: e.target.value })}
                    >
                        <option value="Residential Set">Residential Set</option>
                        <option value="Residential Build">Residential Build</option>
                        <option value="Commercial Build">Commercial Build</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const Step1 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                    <Info size={16} className="mr-2" /> Job Header
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Job Name</label>
                        <input
                            type="text"
                            value={form.jobName}
                            onChange={(e) => setForm({ ...form, jobName: e.target.value })}
                            className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            placeholder="Enter Job Name"
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Address</label>
                        <input
                            type="text"
                            placeholder="Street Address"
                            value={form.address.street}
                            onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
                            className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium mb-2"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="City"
                                value={form.address.city}
                                onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                                className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={form.address.state}
                                    onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
                                    className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium"
                                />
                                <input
                                    type="text"
                                    placeholder="Zip"
                                    value={form.address.zip}
                                    onChange={(e) => setForm({ ...form, address: { ...form.address, zip: e.target.value } })}
                                    className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                    <User size={16} className="mr-2" /> Crew Members
                </h3>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Estimator</label>
                            <input
                                type="text"
                                value={form.crew.estimator}
                                onChange={(e) => setForm({ ...form, crew: { ...form.crew, estimator: e.target.value } })}
                                className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Foreman</label>
                            <input
                                type="text"
                                value={form.crew.foreman}
                                readOnly
                                className="w-full p-3 bg-slate-100 border-none rounded-xl font-bold text-slate-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Second Man</label>
                            <input
                                type="text"
                                value={form.crew.secondMan}
                                onChange={(e) => setForm({ ...form, crew: { ...form.crew, secondMan: e.target.value } })}
                                className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Third Man</label>
                            <input
                                type="text"
                                value={form.crew.thirdMan}
                                onChange={(e) => setForm({ ...form, crew: { ...form.crew, thirdMan: e.target.value } })}
                                className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                    <Clock size={16} className="mr-2" /> Timestamps & Equipment
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Date</label>
                        <input
                            type="date"
                            value={form.timestamps.date}
                            onChange={(e) => setForm({ ...form, timestamps: { ...form.timestamps, date: e.target.value } })}
                            className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Truck Number</label>
                        <input
                            type="text"
                            value={form.truckNumber}
                            onChange={(e) => setForm({ ...form, truckNumber: e.target.value })}
                            className="w-full p-3 bg-slate-50 border-none rounded-xl font-bold text-blue-600 outline-none"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Clock In</label>
                        <input
                            type="time"
                            value={form.timestamps.clockIn}
                            onChange={(e) => setForm({ ...form, timestamps: { ...form.timestamps, clockIn: e.target.value } })}
                            className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Arrive Site</label>
                        <input
                            type="time"
                            value={form.timestamps.arriveSite}
                            onChange={(e) => setForm({ ...form, timestamps: { ...form.timestamps, arriveSite: e.target.value } })}
                            className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Depart Site</label>
                        <input
                            type="time"
                            value={form.timestamps.departSite}
                            onChange={(e) => setForm({ ...form, timestamps: { ...form.timestamps, departSite: e.target.value } })}
                            className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Clock Out</label>
                        <input
                            type="time"
                            value={form.timestamps.clockOut}
                            onChange={(e) => setForm({ ...form, timestamps: { ...form.timestamps, clockOut: e.target.value } })}
                            className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium"
                        />
                    </div>
                </div>
            </section>
        </div>
    );

    const Step2 = () => (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PenTool className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">As-Built Drawing</h3>
                <p className="text-slate-500 text-sm mb-6">Create or update the site drawing for CRM records.</p>

                {form.drawing ? (
                    <div className="relative group border-2 border-slate-100 rounded-2xl overflow-hidden mb-6">
                        <img src={form.drawing} alt="As-Built Drawing" className="w-full h-auto" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={() => setShowDrawingModal(true)}
                                className="px-6 py-2 bg-white text-blue-600 rounded-full font-bold shadow-lg"
                            >
                                Redraw As-Built
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowDrawingModal(true)}
                        className="w-full py-10 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-blue-300 transition-all mb-6"
                    >
                        <Plus size={40} className="mb-2" />
                        <span className="font-bold">Draw As-Built</span>
                    </button>
                )}

                {showDrawingModal && (
                    <div className="fixed inset-0 z-50 bg-slate-900/95 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="w-full max-w-2xl">
                            <div className="flex justify-between items-center mb-4 text-white">
                                <h2 className="text-xl font-bold">Site Drawing Tool</h2>
                                <button onClick={() => setShowDrawingModal(false)} className="p-2 hover:bg-white/10 rounded-full">
                                    <X size={24} />
                                </button>
                            </div>
                            <DrawingPad
                                initialData={form.drawing}
                                onSave={(data) => {
                                    setForm({ ...form, drawing: data });
                                    setShowDrawingModal(false);
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const Step3 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Items Installed</h3>
                    <button
                        onClick={() => setForm({ ...form, itemsInstalled: [...form.itemsInstalled, { item: 'Chain Link', qty: 0, a: '', b: '', c: '', d: '', e: '' }] })}
                        className="flex items-center text-blue-600 text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-lg"
                    >
                        <Plus size={16} className="mr-1" /> Add Row
                    </button>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-slate-400 border-b border-slate-50">
                            <th className="text-left pb-3 font-bold">Item</th>
                            <th className="text-center pb-3 font-bold">Qty</th>
                            <th className="text-center pb-3 font-bold">Gate Meas. (A-E)</th>
                            <th className="pb-3 w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {form.itemsInstalled.map((row, idx) => (
                            <tr key={idx} className="group">
                                <td className="py-3 pr-2">
                                    <select
                                        value={row.item}
                                        onChange={(e) => {
                                            const newItems = [...form.itemsInstalled];
                                            newItems[idx].item = e.target.value;
                                            setForm({ ...form, itemsInstalled: newItems });
                                        }}
                                        className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    >
                                        {ITEMS_LIST.map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </td>
                                <td className="py-3 px-2 w-20">
                                    <input
                                        type="number"
                                        value={row.qty}
                                        onChange={(e) => {
                                            const newItems = [...form.itemsInstalled];
                                            newItems[idx].qty = Number(e.target.value);
                                            setForm({ ...form, itemsInstalled: newItems });
                                        }}
                                        className="w-full bg-slate-50 border-none rounded-lg p-2 text-center font-bold"
                                    />
                                </td>
                                <td className="py-3 px-2">
                                    <div className="flex space-x-1">
                                        {['a', 'b', 'c', 'd', 'e'].map(k => (
                                            <input
                                                key={k}
                                                placeholder={k.toUpperCase()}
                                                value={row[k]}
                                                onChange={(e) => {
                                                    const newItems = [...form.itemsInstalled];
                                                    newItems[idx][k] = e.target.value;
                                                    setForm({ ...form, itemsInstalled: newItems });
                                                }}
                                                className="w-8 h-8 bg-slate-50 border-none rounded flex items-center justify-center text-[10px] text-center font-bold"
                                            />
                                        ))}
                                    </div>
                                </td>
                                <td className="py-3 pl-2">
                                    <button
                                        onClick={() => {
                                            const newItems = form.itemsInstalled.filter((_, i) => i !== idx);
                                            setForm({ ...form, itemsInstalled: newItems });
                                        }}
                                        className="text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Bay Information</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Total Bays</label>
                            <input
                                type="number"
                                value={form.bayInfo.total}
                                onChange={(e) => setForm({ ...form, bayInfo: { ...form.bayInfo, total: Number(e.target.value) } })}
                                className="w-full p-2.5 bg-slate-50 border-none rounded-xl font-bold text-blue-600"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Full Bays</label>
                            <input
                                type="number"
                                value={form.bayInfo.full}
                                onChange={(e) => setForm({ ...form, bayInfo: { ...form.bayInfo, full: Number(e.target.value) } })}
                                className="w-full p-2.5 bg-slate-50 border-none rounded-xl font-bold text-green-600"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Short Bays</label>
                            <input
                                type="number"
                                value={form.bayInfo.short}
                                onChange={(e) => setForm({ ...form, bayInfo: { ...form.bayInfo, short: Number(e.target.value) } })}
                                className="w-full p-2.5 bg-slate-50 border-none rounded-xl font-bold text-orange-600"
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">I to I OF Post</label>
                            <input
                                type="number"
                                value={form.bayInfo.iToIPost}
                                onChange={(e) => setForm({ ...form, bayInfo: { ...form.bayInfo, iToIPost: Number(e.target.value) } })}
                                className="w-full p-2.5 bg-slate-50 border-none rounded-xl font-medium"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">I to I Degree</label>
                            <input
                                type="number"
                                value={form.bayInfo.iToIDegree}
                                onChange={(e) => setForm({ ...form, bayInfo: { ...form.bayInfo, iToIDegree: Number(e.target.value) } })}
                                className="w-full p-2.5 bg-slate-50 border-none rounded-xl font-medium"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Full Bays I to I</label>
                            <input
                                type="number"
                                value={form.bayInfo.fullBaysIToI}
                                onChange={(e) => setForm({ ...form, bayInfo: { ...form.bayInfo, fullBaysIToI: Number(e.target.value) } })}
                                className="w-full p-2.5 bg-slate-50 border-none rounded-xl font-medium"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

    const Step4 = () => {
        const requiredPhotos = [
            { id: 'front', label: 'Front of fence' },
            { id: 'rear', label: 'Rear of fence' },
            { id: 'sideA', label: 'Side A of fence' },
            { id: 'sideB', label: 'Side B of fence' },
            { id: 'signage', label: 'American Fence signage' }
        ];

        const uploadedCount = requiredPhotos.filter(p => form.photos[p.id]).length;

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-200 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-1">Required Photos</h3>
                        <p className="text-blue-100 text-sm mb-4">Upload {requiredPhotos.length} mandatory photos for quality assurance.</p>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">Photos: {uploadedCount}/{requiredPhotos.length}</span>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full mt-3 overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-500"
                                style={{ width: `${(uploadedCount / requiredPhotos.length) * 100}%` }}
                            />
                        </div>
                    </div>
                    <Camera className="absolute -right-4 -bottom-4 text-white/10" size={120} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {requiredPhotos.map(({ id, label }) => (
                        <div key={id} className={`bg-white p-3 rounded-2xl border-2 transition-all ${form.photos[id] ? 'border-green-100' : 'border-slate-50'}`}>
                            <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden mb-3 relative group">
                                {form.photos[id] ? (
                                    <>
                                        <img src={form.photos[id]} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setForm({ ...form, photos: { ...form.photos, [id]: null } })}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handlePhotoMock(id)}
                                        className="w-full h-full flex flex-col items-center justify-center text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-all"
                                    >
                                        <Camera size={32} className="mb-2" />
                                        <span className="text-[10px] uppercase font-bold tracking-wider">Mock Capture</span>
                                    </button>
                                )}
                            </div>
                            <p className="text-[11px] font-bold text-center text-slate-600 uppercase tracking-tight">{label}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white p-5 rounded-2xl border border-dashed border-slate-200">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Additional Photos (Optional)</h3>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {form.photos.additional.map((url, i) => (
                            <div key={i} className="w-24 h-24 flex-shrink-0 bg-slate-50 rounded-xl overflow-hidden relative">
                                <img src={url} className="w-full h-full object-cover" />
                            </div>
                        ))}
                        <button
                            onClick={() => setForm({ ...form, photos: { ...form.photos, additional: [...form.photos.additional, 'https://via.placeholder.com/300'] } })}
                            className="w-24 h-24 flex-shrink-0 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center text-slate-300"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const Step5 = () => {
        const checklistItems = [
            { id: 'dumpster', label: 'Dumpster' },
            { id: 'lunch', label: 'Lunch' },
            { id: 'sprinklerIns', label: 'Sprinkler Ins' },
            { id: 'dirtRemoval', label: 'Dirt Removal' },
            { id: 'removal', label: 'Removal' },
            { id: 'reviewed', label: 'Reviewed Entire Project?' },
            { id: 'tools', label: 'Tools Picked Up?' },
            { id: 'completed', label: 'Project Completed to AFC Standards?' }
        ];

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Post-Job Checklist</h3>
                    <div className="space-y-4">
                        {checklistItems.map(({ id, label }) => (
                            <div key={id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                <span className="text-sm font-medium text-slate-700">{label}</span>
                                <select
                                    value={form.checklists[id]}
                                    onChange={(e) => setForm({ ...form, checklists: { ...form.checklists, [id]: e.target.value } })}
                                    className={`text-sm font-bold border-none rounded-xl px-4 py-3 transition-all outline-none min-w-[120px] text-center ${form.checklists[id] === 'Yes' ? 'bg-green-100 text-green-700' :
                                        form.checklists[id] === 'No' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                                        }`}
                                >
                                    <option>Please Select</option>
                                    <option>Yes</option>
                                    <option>No</option>
                                    <option>N/A</option>
                                </select>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Additional Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Hand Digs Flow Set Time</label>
                            <input
                                type="text"
                                placeholder="Select/Time"
                                value={form.handDigs}
                                onChange={(e) => setForm({ ...form, handDigs: e.target.value })}
                                className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {['a', 'b', 'c'].map(f => (
                                <div key={f}>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">{f}</label>
                                    <input
                                        type="text"
                                        value={form.extraFields[f]}
                                        onChange={(e) => setForm({ ...form, extraFields: { ...form.extraFields, [f]: e.target.value } })}
                                        className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium"
                                    />
                                </div>
                            ))}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Notes</label>
                            <textarea
                                rows={4}
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Additional job notes..."
                            />
                        </div>
                    </div>
                </section>
            </div>
        );
    };

    const Step6 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckSquare className="text-blue-600" size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Final Sign-Off</h3>
                <p className="text-slate-500 text-sm mb-10">I hereby certify that the As-Built information provided is accurate and the project has been completed to AFC standards.</p>

                <div className="mb-8">
                    <SignaturePad onEnd={(sig) => setForm({ ...form, signature: sig })} />
                </div>

                <div className="text-left bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Summary</p>
                    <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                        <span>Job ID: {jobId}</span>
                        <span>Foreman: {user?.name}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pb-32">
            <ProgressHeader />

            <main className="flex-1 p-4 max-w-lg mx-auto w-full">
                {currentStep === 1 && <Step1 />}
                {currentStep === 2 && <Step2 />}
                {currentStep === 3 && <Step3 />}
                {currentStep === 4 && <Step4 />}
                {currentStep === 5 && <Step5 />}
                {currentStep === 6 && <Step6 />}
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-30 flex items-center justify-between">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 1 || isSubmitting}
                    className="p-4 bg-gray-100 text-slate-600 rounded-2xl font-bold disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="flex-1 px-4">
                    {currentStep < 6 ? (
                        <button
                            onClick={nextStep}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-200 flex items-center justify-center active:scale-95 transition-all"
                        >
                            Next Step <ChevronRight size={20} className="ml-1" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !form.signature}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all"
                        >
                            {isSubmitting ? <Loader className="animate-spin" /> : <>Sign As-Built & Submit</>}
                        </button>
                    )}
                </div>
            </footer >
        </div>
    );
};

export default AsBuilt;
