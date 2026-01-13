import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowRight, Loader, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockService } from '../services/MockService';

const PostJSA = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { currentJob } = useApp();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        q1: { answer: null, details: '' },
        q2: { answer: null, details: '' },
        q3: { answer: null, details: '' },
    });

    const handleOptionChange = (q, val) => {
        setFormData({ ...formData, [q]: { ...formData[q], answer: val } });
    };

    const handleDetailsChange = (q, val) => {
        setFormData({ ...formData, [q]: { ...formData[q], details: val } });
    };

    const isFormValid = () => {
        return Object.keys(formData).every(k => {
            const item = formData[k];
            if (item.answer === null) return false;
            if (item.answer === false && !item.details.trim()) return false;
            return true;
        });
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        await mockService.savePostJSA(jobId, formData);
        setIsLoading(false);
        navigate(`/job/${jobId}/as-built`);
    };

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
        <div className="pb-24 bg-gray-50 min-h-screen">
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10 mb-4">
                <h1 className="text-lg font-bold text-gray-900">Post-Job Safety Analysis</h1>
                <p className="text-xs text-gray-500 text-center mt-1">
                    Wrap up for {currentJob?.customerName || jobId}
                </p>
            </div>

            <div className="p-4">
                <Question
                    id="q1"
                    text="Was this job completed without any incidents, injuries, or near misses?"
                    state={formData.q1}
                    onOption={handleOptionChange}
                    onDetails={handleDetailsChange}
                />
                <Question
                    id="q2"
                    text="Were all tools and equipment inspected, cleaned, returned, and stored properly after the task?"
                    state={formData.q2}
                    onOption={handleOptionChange}
                    onDetails={handleDetailsChange}
                />
                <Question
                    id="q3"
                    text="Before leaving this job site, were any hazards, unsafe conditions, or lessons learned identified and reported?"
                    state={formData.q3}
                    onOption={handleOptionChange}
                    onDetails={handleDetailsChange}
                />
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex space-x-3 z-20">
                <button className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 flex items-center justify-center">
                    <Save size={18} className="mr-2" /> Save
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!isFormValid() || isLoading}
                    className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                >
                    {isLoading ? <Loader className="animate-spin" /> : <>Continue to As-Built <ArrowRight size={18} className="ml-2" /></>}
                </button>
            </div>
        </div>
    );
};

export default PostJSA;
