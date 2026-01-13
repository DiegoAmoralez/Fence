import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, MapPin, Phone, ArrowRight, Loader } from 'lucide-react';
import { mockService } from '../services/MockService';
import { useApp } from '../context/AppContext';

const DailySchedule = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setCurrentJob } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await mockService.getDailySchedule();
                setJobs(data);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const handleDetails = (job, e) => {
        e.stopPropagation();
        setCurrentJob(job);
        navigate(`/job/${job.id}/dashboard`);
    };

    const handleJobSelect = (job) => {
        setCurrentJob(job);
        navigate(`/job/${job.id}/dashboard`);
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader className="animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-4 pb-20 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Today's Schedule</h1>

            <div className="space-y-4">
                {jobs.map(job => (
                    <div
                        key={job.id}
                        onClick={() => handleJobSelect(job)}
                        className="bg-white rounded-xl shadow-premium border border-gray-100 overflow-hidden active:scale-[0.99] transition-transform cursor-pointer"
                    >
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-900">{job.customerName}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${job.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        job.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                            job.status === 'hold-equip' ? 'bg-orange-100 text-orange-700' :
                                                job.status === 'hold-help' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-600'
                                    }`}>
                                    {job.status === 'hold-equip' ? 'WAITING EQUIP' :
                                        job.status === 'hold-help' ? 'WAITING HELP' :
                                            job.status.toUpperCase()}
                                </span>
                                <ArrowRight size={20} className="text-gray-300 ml-2" />
                            </div>

                            <div className="flex items-start text-gray-600 text-sm mb-3">
                                <MapPin size={16} className="mt-1 mr-2 shrink-0 text-blue-500" />
                                <span className="line-clamp-2">{job.address}</span>
                            </div>

                            <div className="flex items-center text-gray-600 text-sm mb-4">
                                <Phone size={16} className="mr-2 text-blue-500" />
                                <span>{job.phone}</span>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500 italic mb-4 border border-gray-100">
                                "{job.notes}"
                            </div>

                            <button
                                onClick={(e) => handleDetails(job, e)}
                                className="w-full py-2 bg-blue-50 text-blue-600 font-bold rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors"
                            >
                                See Details <ArrowRight size={18} className="ml-2" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DailySchedule;
