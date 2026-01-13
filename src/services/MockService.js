import { format, addDays } from 'date-fns';

class MockService {
    constructor() {
        this.storage = {
            jobs: [],
            users: [],
            incidents: [],
            offlineQueue: []
        };
        this.currentUser = null;
        this.isOffline = false;
        this.initData();
    }

    setOffline(status) {
        this.isOffline = status;
        if (!status) {
            this.sync();
        }
    }

    async sync() {
        console.log('Syncing...', this.offlineQueue.length, 'items');
        const queue = [...this.offlineQueue];
        this.offlineQueue = []; // Clear queue assuming sync works

        // Process queue (mock)
        for (const item of queue) {
            console.log('Synced item:', item.type, item.data);
            if (item.type === 'pre-jsa') this._savePreJSA(item.jobId, item.data);
            if (item.type === 'post-jsa') this._savePostJSA(item.jobId, item.data);
            if (item.type === 'as-built') this._saveAsBuilt(item.jobId, item.data);
            if (item.type === 'incident') {
                this.storage.incidents.push({ ...item.data, status: 'synced-from-offline' });
            }
        }
    }

    initData() {
        // Generate some meaningful mock data
        this.storage.jobs = [
            {
                id: 'OMARC25-0061-00',
                customerName: 'Sample Residential Build',
                address: '456 Oak Ln, Omaha, NE',
                phone: '555-0100',
                status: 'scheduled',
                notes: 'Residential build project. Watch out for the dog.',
                lat: 41.2565,
                lng: -95.9345,
                preJsa: null,
                postJsa: null,
                asBuilt: null,
                truckNumber: 'T-123',
                type: 'Residential Build',
                bayInfo: {
                    totalBays: 15,
                    fullBays: 12,
                    shortBays: 3
                }
            },
            {
                id: 'JOB-001',
                customerName: 'John Doe',
                address: '123 Maple Dr, Springfield, IL',
                phone: '555-0199',
                status: 'scheduled', // scheduled, in-progress, completed
                notes: 'There should be a fence here, but isn’t. Access via back alley.',
                lat: 39.7817,
                lng: -89.6501,
                preJsa: null,
                postJsa: null,
                asBuilt: null,
                truckNumber: null,
                type: 'Residential Set'
            },
            {
                id: 'JOB-002',
                customerName: 'Acme Corp',
                address: '777 Industrial Pkwy, Chicago, IL',
                phone: '555-0200',
                status: 'scheduled',
                notes: 'Security clearance required at gate. Contact Mike on arrival.',
                lat: 41.8781,
                lng: -87.6298,
                preJsa: null,
                postJsa: null,
                asBuilt: null,
                truckNumber: null,
                type: 'Commercial Build'
            }
        ];
    }

    // --- Auth ---
    async login(username, password) {
        if (username && password) {
            this.currentUser = {
                id: 'u1',
                name: 'Mike Foreman',
                role: 'Foreman',
                email: 'mike@fenceapp.com'
            };
            return this.currentUser;
        }
        throw new Error('Invalid credentials');
    }

    async logout() {
        this.currentUser = null;
        this.initData();
    }

    // --- Jobs ---
    async getDailySchedule(foremanId) {
        // Simulate API delay
        await new Promise(r => setTimeout(r, 500));
        return this.storage.jobs;
    }

    async getJob(jobId) {
        await new Promise(r => setTimeout(r, 200));
        return this.storage.jobs.find(j => j.id === jobId);
    }

    async startJob(jobId) {
        const job = this.storage.jobs.find(j => j.id === jobId);
        if (job) {
            job.status = 'in-progress';
            if (!job.history) job.history = [];
            job.history.push({
                status: 'started',
                details: 'Job started by foreman',
                timestamp: new Date()
            });
        }
        return job;
    }

    async updateJobStatus(jobId, status, details) {
        // Simulate API
        await new Promise(r => setTimeout(r, 500));
        const job = this.storage.jobs.find(j => j.id === jobId);
        if (job) {
            job.status = status;

            if (!job.history) job.history = [];

            job.history.push({
                status: status || 'unknown',
                details: details || '',
                timestamp: new Date()
            });
        }
        return job ? { ...job } : null;
    }

    // --- Day Management ---
    async endDay() {
        this.currentUser = null;
        this.initData();
        return true;
    }

    async savePreJSA(jobId, data) {
        if (this.isOffline) {
            this.offlineQueue.push({ type: 'pre-jsa', jobId, data });
            return true;
        }
        return this._savePreJSA(jobId, data);
    }

    _savePreJSA(jobId, data) {
        console.log('Saving PreJSA', jobId, data);
        const job = this.storage.jobs.find(j => j.id === jobId);
        if (job) {
            job.preJsa = { ...data, submittedAt: new Date() };
            if (!job.history) job.history = [];
            job.history.push({
                status: 'safety-check',
                details: 'Pre-Job Safety Analysis completed',
                timestamp: new Date()
            });
        }
        return true;
    }

    async completeJob(jobId) {
        const job = this.storage.jobs.find(j => j.id === jobId);
        if (job) {
            job.status = 'completed';
            if (!job.history) job.history = [];
            job.history.push({
                status: 'completed',
                details: 'Job marked as complete',
                timestamp: new Date()
            });
        }
        return job;
    }

    async savePostJSA(jobId, data) {
        if (this.isOffline) {
            this.offlineQueue.push({ type: 'post-jsa', jobId, data });
            return true;
        }
        return this._savePostJSA(jobId, data);
    }

    _savePostJSA(jobId, data) {
        console.log('Saving PostJSA', jobId, data);
        const job = this.storage.jobs.find(j => j.id === jobId);
        if (job) {
            job.postJsa = { ...data, submittedAt: new Date() };
        }
        return true;
    }

    async saveAsBuilt(jobId, data) {
        if (this.isOffline) {
            this.offlineQueue.push({ type: 'as-built', jobId, data });
            return true;
        }
        return this._saveAsBuilt(jobId, data);
    }

    _saveAsBuilt(jobId, data) {
        console.log('Saving AsBuilt', jobId, data);
        const job = this.storage.jobs.find(j => j.id === jobId);
        if (job) {
            job.asBuilt = { ...data, submittedAt: new Date() };
            // Logic: if all done, mark job fully archived or something?
        }
        return true;
    }

    // --- Incidents (SharePoint) ---
    async submitIncident(type, data) {
        if (this.isOffline) {
            this.offlineQueue.push({ type: 'incident', data, incidentType: type });
            return true;
        }
        console.log('Submitting Incident', type, data);
        this.storage.incidents.push({ type, data, date: new Date(), status: 'submitted' });
        return true;
    }

    // --- Vehicle ---
    async submitTruckNumber(number) {
        // In a real app this might be per-day, for now just store vaguely
        console.log('Truck Number Submitted', number);
        return true;
    }
}

export const mockService = new MockService();
