import { useEffect, useState, FC, useMemo, useCallback } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import { Campaign, CampaignStats, CampaignStatusResponse, ScrapedJob, TailoredResume, MatchedPair } from '../../types/campaigns';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

//----------- INTERFACES & TYPES (Corrected) -----------//
interface ScrapedJobWithDetails extends ScrapedJob {
    matchedPair: MatchedPair | null;
    tailoredResume: TailoredResume | null;
}
interface CompleteCampaign extends Campaign {
    jobs: ScrapedJobWithDetails[];
}
interface Instances {
    scrapers: number;
    matches: number;
    tailors: number;
}
// --- FIX: Updated Resume interface to match actual API data ---
interface Resume {
    _id: string;
    originalName: string;
}
type SortConfig = {
    key: keyof ScrapedJob | 'createdAt';
    direction: 'ascending' | 'descending';
};
type JobFilter = 'all' | 'tailored' | 'matched';

const JOBS_PER_PAGE = 50;

//----------- STYLES -----------//
const styles: { [key: string]: React.CSSProperties } = {
    container: { fontFamily: 'sans-serif', padding: '2rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    select: { fontSize: '1.1em', padding: '0.5rem', width: '450px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' },
    statCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' },
    statLabel: { color: '#4a5568', marginBottom: '0.75rem', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '600' },
    statNumber: { fontSize: '3em', fontWeight: 'bold', color: '#1a202c', lineHeight: '1' },
    statusContainer: { display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', marginBottom: '2.5rem' },
    statusIndicator: { padding: '0.5rem 1rem', borderRadius: '9999px', color: 'white', fontWeight: 'bold' },
    jobListContainer: { marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' },
    jobListItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '1rem', backgroundColor: '#ffffff', transition: 'background-color 0.2s' },
    jobListItemTailored: { backgroundColor: '#f0fff4' },
    jobInfo: { flexGrow: 1 },
    jobTitle: { fontSize: '1.1em', fontWeight: 'bold', color: '#1a202c' },
    jobCompany: { color: '#4a5568' },
    badge: { marginLeft: '1rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: '#c6f6d5', color: '#2f855a' },
    viewButton: { padding: '0.5rem 1rem', fontSize: '0.9em', backgroundColor: '#4299e1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    modalBackdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '80%', maxWidth: '700px', maxHeight: '80vh', overflowY: 'auto' },
    controlsContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    filterGroup: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
    filterButton: { padding: '0.5rem 1rem', cursor: 'pointer', border: '1px solid #cbd5e0', borderRadius: '6px', backgroundColor: 'white' },
    filterButtonActive: { backgroundColor: '#4299e1', color: 'white', borderColor: '#4299e1' },
    paginationContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' },
    paginationButton: { padding: '0.5rem 1rem', cursor: 'pointer', border: '1px solid #cbd5e0', borderRadius: '6px' },
    paginationButtonDisabled: { cursor: 'not-allowed', color: '#a0aec0', backgroundColor: '#e2e8f0' },
    launchButton: { backgroundColor: '#28a745', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', border: 'none', fontSize: '1em', fontWeight: 'bold' }
};

//----------- SUB-COMPONENTS -----------//
const LaunchCampaignModal: FC<{ onClose: () => void; onLaunch: (targetRole: string, location: string, selectedResume: string, instances: Instances) => Promise<void>; }> = ({ onClose, onLaunch }) => {
    const [targetRole, setTargetRole] = useState('');
    const [instances, setInstances] = useState<Instances>({ scrapers: 1, matches: 1, tailors: 1 });
    const [isLaunching, setIsLaunching] = useState(false);
    
    const [location, setLocation] = useState('');
    const [selectedResume, setSelectedResume] = useState('');
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [isLoadingResumes, setIsLoadingResumes] = useState(true);

    useEffect(() => {
        const fetchResumes = async () => {
            setIsLoadingResumes(true);
            try {
                // The response.data will be the array itself: [ { _id: ..., originalName: ... } ]
                const response = await api.get<Resume[]>('/resumes');
                
                // --- FIX 1: Use response.data directly as it is the array ---
                setResumes(response.data || []); 
                
            } catch (error) {
                console.error("Error fetching resumes:", error);
                alert("Failed to load your resumes. Please try again.");
            } finally {
                setIsLoadingResumes(false);
            }
        };
        fetchResumes();
    }, []);

    const handleInstanceChange = (type: keyof Instances, value: string) => {
        const numValue = Math.max(0, parseInt(value, 10));
        setInstances(prev => ({ ...prev, [type]: numValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetRole.trim() || !location.trim() || !selectedResume) {
            alert('Please fill out all fields, including target role, location, and select a resume.');
            return;
        }
        setIsLaunching(true);
        try {
            await onLaunch(targetRole, location, selectedResume, instances);
        } catch (err) {
            // Parent component handles the error alert
        } finally {
            setIsLaunching(false);
        }
    };

    return (
        <div style={styles.modalBackdrop} onClick={onClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>Launch New Campaign</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="targetRole" style={{ display: 'block', marginBottom: '0.5rem' }}>Target Role</label>
                        <input id="targetRole" type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g., Software Engineer" style={{ width: '100%', padding: '0.5rem', fontSize: '1em' }} required />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="location" style={{ display: 'block', marginBottom: '0.5rem' }}>Location</label>
                        <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Toronto, ON" style={{ width: '100%', padding: '0.5rem', fontSize: '1em' }} required />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="resume" style={{ display: 'block', marginBottom: '0.5rem' }}>Select a Resume</label>
                        <select id="resume" value={selectedResume} onChange={(e) => setSelectedResume(e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '1em' }} required disabled={isLoadingResumes}>
                            <option value="" disabled>
                                {isLoadingResumes ? 'Loading resumes...' : '-- Please select one --'}
                            </option>
                            {resumes.map((resume) => (
                                <option key={resume._id} value={resume._id}>
                                    {/* --- FIX 2: Use `originalName` as it exists in the API data --- */}
                                    {resume.originalName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label htmlFor="scrapers" style={{ display: 'block', marginBottom: '0.5rem' }}>Scrapers</label>
                            <input id="scrapers" type="number" value={instances.scrapers} onChange={(e) => handleInstanceChange('scrapers', e.target.value)} min="1" max="5" style={{ width: '100%', padding: '0.5rem' }} />
                        </div>
                        <div>
                            <label htmlFor="matches" style={{ display: 'block', marginBottom: '0.5rem' }}>Matches</label>
                            <input id="matches" type="number" value={instances.matches} onChange={(e) => handleInstanceChange('matches', e.target.value)} min="1" max="5" style={{ width: '100%', padding: '0.5rem' }} />
                        </div>
                        <div>
                            <label htmlFor="tailors" style={{ display: 'block', marginBottom: '0.5rem' }}>Tailors</label>
                            <input id="tailors" type="number" value={instances.tailors} onChange={(e) => handleInstanceChange('tailors', e.target.value)} min="1" max="5" style={{ width: '100%', padding: '0.5rem' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ ...styles.viewButton, backgroundColor: '#6c757d' }}>Cancel</button>
                        <button type="submit" style={styles.launchButton} disabled={isLaunching}>
                            {isLaunching ? 'Launching...' : 'Launch'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const JobDetailModal: FC<{ job: ScrapedJob; onClose: () => void; }> = ({ job, onClose }) => (
    <div style={styles.modalBackdrop} onClick={onClose}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>{job.title}</h2>
            <a href={job.url} target="_blank" rel="noopener noreferrer">{job.url}</a>
            <p style={{ color: '#4a5568' }}>{job.companyName} - {job.location}</p>
            <hr style={{ margin: '1rem 0' }} />
            <h4>Responsibilities</h4>
            <ul>{job.description.responsibilities.map((r: string, i: number) => <li key={i}>{r}</li>)}</ul>
            <h4>Qualifications</h4>
            <ul>{job.description.qualifications.map((q: string, i: number) => <li key={i}>{q}</li>)}</ul>
            <button onClick={onClose} style={{ marginTop: '1rem' }}>Close</button>
        </div>
    </div>
);

const Pagination: FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void; }> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div style={styles.paginationContainer}>
            <button style={{ ...styles.paginationButton, ...(currentPage === 1 ? styles.paginationButtonDisabled : {}) }} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button style={{ ...styles.paginationButton, ...(currentPage === totalPages ? styles.paginationButtonDisabled : {}) }} onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
        </div>
    );
};


//----------- MAIN COMPONENT -----------//
const CampaignDashboard: FC = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
    const [stats, setStats] = useState<CampaignStats>({ jobsScraped: 0, jobsMatched: 0, jobsTailored: 0 });
    const [status, setStatus] = useState<string>('stopped');
    const [loadingCampaigns, setLoadingCampaigns] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [campaignDetails, setCampaignDetails] = useState<CompleteCampaign | null>(null);
    const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
    const [selectedJobForModal, setSelectedJobForModal] = useState<ScrapedJob | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });
    const [jobFilter, setJobFilter] = useState<JobFilter>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLaunchModalOpen, setLaunchModalOpen] = useState(false);
    const { user, loading: authLoading } = useAuth();

    const hasRunningCampaign = useMemo(() => campaigns.some(c => c.status === 'running'), [campaigns]);

    const fetchCampaigns = useCallback(async () => {
        setLoadingCampaigns(true);
        try {
            const res = await api.get<{ campaigns: Campaign[] }>(`/campaigns/`);
            const fetchedCampaigns = res.data.campaigns || [];
            setCampaigns(fetchedCampaigns);
            return fetchedCampaigns;
        } catch (err) {
            setError('Failed to load campaign list.');
            console.error("Failed to fetch campaigns", err);
        } finally {
            setLoadingCampaigns(false);
        }
        return [];
    }, []);

    const fetchCampaignDetails = useCallback(async (campaignId: string) => {
        if (!campaignId) return;
        setLoadingDetails(true);
        try {
            const res = await api.get<CompleteCampaign>(`/campaigns/details/${campaignId}`);
            setCampaignDetails(res.data);
        } catch (err) {
            setError('Failed to load campaign details.');
            console.error(`Failed to fetch details for ${campaignId}`, err);
        } finally {
            setLoadingDetails(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!user?._id) {
            setCampaigns([]);
            setSelectedCampaignId('');
            setLoadingCampaigns(false);
            return;
        }
        const loadInitialData = async () => {
            const fetchedCampaigns = await fetchCampaigns();
            if (fetchedCampaigns && fetchedCampaigns.length > 0) {
                const sorted = [...fetchedCampaigns].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setSelectedCampaignId(sorted[0]._id);
            }
        };
        loadInitialData();
    }, [user?._id, authLoading, fetchCampaigns]);

    useEffect(() => {
        if (selectedCampaignId) {
            fetchCampaignDetails(selectedCampaignId);
            setCurrentPage(1);
        } else {
            setCampaignDetails(null);
        }
    }, [selectedCampaignId, fetchCampaignDetails]);

    useEffect(() => {
        if (!selectedCampaignId) return;
        let isMounted = true;
        const pollStatus = async () => {
            try {
                const res = await api.get<CampaignStatusResponse>(`/campaigns/status/${selectedCampaignId}`);
                if (!isMounted) return;
                const newStats = res.data.stats;
                setStatus(res.data.status);

                setStats(prevStats => {
                    if (newStats.jobsScraped !== prevStats.jobsScraped || newStats.jobsMatched !== prevStats.jobsMatched || newStats.jobsTailored !== prevStats.jobsTailored) {
                        fetchCampaignDetails(selectedCampaignId);
                    }
                    return newStats;
                });
            } catch (err) {
                console.error(`Status polling failed for ${selectedCampaignId}`, err);
            }
        };
        const intervalId = setInterval(pollStatus, 5000);
        pollStatus();
        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [selectedCampaignId, fetchCampaignDetails]);

    const handleLaunchCampaign = async (targetRole: string, location: string, selectedResume: string, instances: Instances) => {
        setError('');
        try {
            const response = await api.post<{ success: boolean; campaignId?: string; message?: string }>('/campaigns/launch', {
                targetRole,
                location,
                resumeId: selectedResume,
                instances
            });
            if (response.data.success && response.data.campaignId) {
                alert('Campaign launched successfully!');
                const newCampaignId = response.data.campaignId;
                await fetchCampaigns();
                setSelectedCampaignId(newCampaignId);
                setLaunchModalOpen(false);
            } else { throw new Error(response.data.message || 'Launch failed.'); }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message;
            alert(`Error: ${errorMessage}`);
            throw err;
        }
    };

    const handleStopCampaign = async () => {
        if (!selectedCampaignId) return;
        try {
            await api.post(`/campaigns/stop/${selectedCampaignId}`);
            alert('Campaign stopped.');
            await fetchCampaigns();
        } catch (err: any) {
            alert(`Error: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleFilterChange = (filter: JobFilter) => {
        setJobFilter(filter);
        setCurrentPage(1);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortConfig({ key: e.target.value as any, direction: e.target.value === 'createdAt' ? 'descending' : 'ascending' });
        setCurrentPage(1);
    };

    const jobCounts = useMemo(() => {
        const allJobs = campaignDetails?.jobs || [];
        const tailoredCount = allJobs.filter(job => !!job.tailoredResume).length;
        const matchedCount = allJobs.filter(job => !!job.matchedPair && !job.tailoredResume).length;

        return {
            total: allJobs.length,
            tailored: tailoredCount,
            matched: matchedCount
        }
    }, [campaignDetails?.jobs]);

    const filteredJobs = useMemo(() => {
        if (!campaignDetails?.jobs) return [];
        return campaignDetails.jobs.filter(job => {
            const hasMatchedPair = !!job.matchedPair;
            const isTailored = !!job.tailoredResume;
            switch (jobFilter) {
                case 'tailored': return isTailored;
                case 'matched': return hasMatchedPair && !isTailored;
                case 'all': default: return true;
            }
        });
    }, [campaignDetails?.jobs, jobFilter]);

    const sortedJobs = useMemo(() => {
        if (!filteredJobs) return [];
        return [...filteredJobs].sort((a, b) => {
            const aVal = a[sortConfig.key] || ''; const bVal = b[sortConfig.key] || '';
            if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }, [filteredJobs, sortConfig]);

    const paginatedJobs = useMemo(() => {
        const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
        return sortedJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);
    }, [sortedJobs, currentPage]);

    const getStatusStyle = (currentStatus: string): React.CSSProperties => {
        switch (currentStatus) {
            case 'running': return { ...styles.statusIndicator, backgroundColor: '#28a745' };
            case 'stopped': return { ...styles.statusIndicator, backgroundColor: '#dc3545' };
            case 'completed': return { ...styles.statusIndicator, backgroundColor: '#17a2b8' };
            default: return { ...styles.statusIndicator, backgroundColor: '#6c757d' };
        }
    };

    return (
        <Layout>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1>Campaign Command Center</h1>
                    <button style={{ ...styles.launchButton, ...(hasRunningCampaign ? styles.paginationButtonDisabled : {}) }} onClick={() => setLaunchModalOpen(true)} disabled={hasRunningCampaign} title={hasRunningCampaign ? "A campaign is already running." : "Launch a new campaign"}>
                        🚀 Launch New Campaign
                    </button>
                </div>

                {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '1rem', border: '1px solid red', borderRadius: '6px' }}><strong>Error:</strong> {error}</div>}

                {authLoading || loadingCampaigns ? <p>Loading Campaigns...</p> : (
                    <select style={styles.select} onChange={(e) => setSelectedCampaignId(e.target.value)} value={selectedCampaignId} disabled={campaigns.length === 0}>
                        <option value="" disabled>-- Select a Campaign --</option>
                        {campaigns.map((campaign) => (
                            <option key={campaign._id} value={campaign._id}>
                                {campaign.targetRole} ({new Date(campaign.createdAt).toLocaleDateString()}) [{campaign.status}]
                            </option>
                        ))}
                    </select>
                )}

                {loadingDetails && <p style={{ marginTop: '2rem' }}>Loading campaign details...</p>}

                {!loadingDetails && selectedCampaignId && campaignDetails && (
                    <>
                        <div style={styles.statsGrid}>
                            <div style={styles.statCard} onClick={() => handleFilterChange('all')}><div style={styles.statLabel}>Jobs Scraped</div><div style={styles.statNumber}>{stats.jobsScraped}</div></div>
                            <div style={styles.statCard} onClick={() => handleFilterChange('matched')}><div style={styles.statLabel}>Jobs Matched</div><div style={styles.statNumber}>{stats.jobsMatched}</div></div>
                            <div style={styles.statCard} onClick={() => handleFilterChange('tailored')}><div style={styles.statLabel}>Resumes Tailored</div><div style={styles.statNumber}>{stats.jobsTailored}</div></div>
                        </div>
                        <div style={styles.statusContainer}>
                            <h3>Status:</h3><span style={getStatusStyle(status)}>{status.toUpperCase()}</span>
                            {status === 'running' && (<button className="btn btn-danger" onClick={handleStopCampaign}>STOP CAMPAIGN</button>)}
                        </div>
                        <div style={styles.jobListContainer}>
                            <div style={styles.controlsContainer}>
                                <div style={styles.filterGroup}>
                                    <button style={{ ...styles.filterButton, ...(jobFilter === 'all' ? styles.filterButtonActive : {}) }} onClick={() => handleFilterChange('all')}>All ({jobCounts.total})</button>
                                    <button style={{ ...styles.filterButton, ...(jobFilter === 'tailored' ? styles.filterButtonActive : {}) }} onClick={() => handleFilterChange('tailored')}>Tailored ({jobCounts.tailored})</button>
                                    <button style={{ ...styles.filterButton, ...(jobFilter === 'matched' ? styles.filterButtonActive : {}) }} onClick={() => handleFilterChange('matched')}>Matched ({jobCounts.matched})</button>
                                </div>
                                <div style={styles.filterGroup}>
                                    <label htmlFor="sort-select">Sort by:</label>
                                    <select id="sort-select" onChange={handleSortChange} value={sortConfig.key} style={{ padding: '0.5rem' }}>
                                        <option value="createdAt">Most Recent</option><option value="title">Job Title</option><option value="companyName">Company</option>
                                    </select>
                                </div>
                            </div>
                            {paginatedJobs.length > 0 ? (
                                <>
                                    {paginatedJobs.map((job) => (
                                        <div key={job._id} style={{ ...styles.jobListItem, ...(job.tailoredResume ? styles.jobListItemTailored : {}) }}>
                                            <div style={styles.jobInfo}>
                                                <div style={styles.jobTitle}>
                                                    <Link href={`/campaign/${selectedCampaignId}/jobs/${job._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                        {job.title}
                                                    </Link>
                                                </div>
                                                <div style={styles.jobCompany}>{job.companyName} - {job.location} ({new Date(job.createdAt).toLocaleDateString()})</div></div>
                                            <div>
                                                {job.tailoredResume && (<span style={styles.badge}>Tailored</span>)}
                                                <button style={styles.viewButton} onClick={() => setSelectedJobForModal(job)}>View Details</button>
                                            </div>
                                        </div>
                                    ))}
                                    <Pagination currentPage={currentPage} totalPages={Math.ceil(sortedJobs.length / JOBS_PER_PAGE)} onPageChange={setCurrentPage} />
                                </>
                            ) : <p>No jobs found for the current filter.</p>}
                        </div>
                    </>
                )}

                {!selectedCampaignId && !authLoading && !loadingCampaigns && <div style={{ textAlign: 'center', marginTop: '5rem' }}><h2>No Campaign Selected</h2><p>Select a campaign from the dropdown or launch a new one to begin.</p></div>}
            </div>

            {isLaunchModalOpen && <LaunchCampaignModal onClose={() => setLaunchModalOpen(false)} onLaunch={handleLaunchCampaign} />}
            {selectedJobForModal && <JobDetailModal job={selectedJobForModal} onClose={() => setSelectedJobForModal(null)} />}
        </Layout>
    );
};

export default CampaignDashboard;