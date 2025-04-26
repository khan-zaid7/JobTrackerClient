import { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useRouter } from 'next/router';

export default function JobList() {
    const router = useRouter();
    const [jobs, setJobs] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Query string with defaults
    const page = parseInt((router.query.page as string) || '1');
    const [search, setSearch] = useState((router.query.search as string) || '');
    const [sortBy, setSortBy] = useState((router.query.sortBy as string) || 'createdAt');
    const [order, setOrder] = useState((router.query.order as string) || 'desc');
    const [minSalary, setMinSalary] = useState('');
    const [maxSalary, setMaxSalary] = useState('');
    const [status, setStatus] = useState('');


    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/jobs', {
                params: {
                    page,
                    limit: 6,
                    search,
                    sortBy,
                    order,
                },
            });
            setJobs(res.data.jobs);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error('Fetch jobs error:', err);
            setError('Failed to load jobs. Please try again.');
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }, [page, search, sortBy, order]);

    // Debounce filter syncing to URL
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.push({
                pathname: '/jobs',
                query: { page, search, sortBy, order },
            }, undefined, { shallow: true });
        }, 500);
        return () => clearTimeout(timeout);
    }, [search, sortBy, order]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const goToPage = (p: number) => {
        router.push({
            pathname: '/jobs',
            query: { ...router.query, page: p },
        }, undefined, { shallow: true });
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Your Jobs</h2>
                <Link href="/jobs/create" className="btn btn-primary">Add Job</Link>
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                    <button onClick={fetchJobs} className="btn btn-sm btn-danger ms-2">Retry</button>
                </div>
            )}

            <div className="mb-3 row">
                <div className="col-md-6 mb-2">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="form-control"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="col-md-3 mb-2">
                    <select
                        className="form-control"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="createdAt">Date</option>
                        <option value="position">Position</option>
                        <option value="company">Company</option>
                        <option value="location">Location</option>
                        <option value="status">Status</option>
                        <option value="salary">Salary</option>
                    </select>
                </div>
                <div className="col-md-3 mb-2">
                    <select
                        className="form-control"
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                    >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center my-4">Loading...</div>
            ) : jobs.length === 0 ? (
                <p>No jobs found.</p>
            ) : (
                <>
                    <div className="row">
                        {jobs.map((job) => (
                            <div className="col-md-6 mb-3" key={job._id}>
                                <div className="card">
                                    <div className="card-body">
                                        <h5 className="card-title">{job.position}</h5>
                                        <h6 className="card-subtitle mb-2 text-muted">{job.company}</h6>
                                        <p className="mb-1"><strong>Status:</strong> {job.status}</p>
                                        {job.location && <p className="mb-1"><strong>Location:</strong> {job.location}</p>}
                                        {job.salary && <p className="mb-1"><strong>Salary:</strong> {job.salary}</p>}
                                        {job.url && (
                                            <p className="mb-1"><strong>URL:</strong> <a href={job.url} target="_blank" rel="noopener noreferrer">{job.url}</a></p>
                                        )}
                                        {job.description && <p className="mb-1"><strong>Description:</strong> {job.description.slice(0, 100)}...</p>}
                                        {job.createdAt && (
                                            <p className="mb-1"><strong>Posted:</strong> {new Date(job.createdAt).toLocaleString()}</p>
                                        )}
                                        <div className="mt-3">
                                            <Link href={`/jobs/${job._id}/edit`} className="btn btn-sm btn-warning me-2">Edit</Link>
                                            <button onClick={() => {
                                                if (confirm('Are you sure you want to delete this job?')) {
                                                    api.delete(`/jobs/${job._id}`).then(fetchJobs);
                                                }
                                            }} className="btn btn-sm btn-danger">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <nav className="mt-4 d-flex justify-content-center">
                        <ul className="pagination">
                            {[...Array(totalPages)].map((_, idx) => (
                                <li key={idx} className={`page-item ${page === idx + 1 ? 'active' : ''}`}>
                                    <button
                                        onClick={() => goToPage(idx + 1)}
                                        className="page-link"
                                        disabled={loading}
                                    >
                                        {idx + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </>
            )}
        </Layout>
    );
}
