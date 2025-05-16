// pages/scrapers/linkedin.tsx
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';

interface Resume {
  _id: string;
  originalName: string;
}

export default function LinkedInScraper() {
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get('/resumes');
        setResumes(res.data);
      } catch (err) {
        console.error('Failed to load resumes');
      }
    };
    fetchResumes();
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/scrape/status/${sessionId}`);
        setStatus(res.data.status);
        setNote(res.data.note);

        if (res.data.status === 'done') {
          clearInterval(interval);
          const jobsRes = await api.get(`/scrape/results/${sessionId}`);
          setJobs(jobsRes.data);
        }
        if (res.data.status === 'failed') {
          clearInterval(interval);
          setError(res.data.error || 'Job failed');
        }
      } catch (err) {
        console.error('Polling error:', err);
        setError('Polling error');
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const startScraping = async () => {
    setError('');
    setJobs([]);
    setStatus('');
    setNote('');
    setSessionId('');

    try {
      const res = await api.post('/scrape/start', {
        resumeId: selectedResumeId,
        tags: tags.split(',').map(tag => tag.trim()),
        url: url
      });
      setSessionId(res.data.sessionId);
    } catch (err) {
      console.error(err);
      setError('Failed to start scrape');
    }
  };

  return (
    <Layout>
      <div className="container mt-5">
        <h2 className="mb-4">LinkedIn Job Scraper</h2>

        <div className="mb-3">
          <label>LinkedIn Job Search URL (optional)</label>
          <input
            type="text"
            className="form-control"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Leave blank to use default"
          />
        </div>

        <div className="mb-3">
          <label>Tags / Skills</label>
          <input
            type="text"
            className="form-control"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. React, Node.js, MongoDB"
          />
        </div>

        <div className="mb-3">
          <label>Select Resume</label>
          <select
            className="form-select"
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
          >
            <option value="">-- Select --</option>
            {resumes.map((resume) => (
              <option key={resume._id} value={resume._id}>
                {resume.originalName}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={startScraping}
          disabled={!selectedResumeId || !tags}
        >
          Start Scraping
        </button>

        {status && <p className="mt-3"><strong>Status:</strong> {status} — {note}</p>}
        {error && <p className="text-danger mt-2">❌ {error}</p>}

        {jobs.length > 0 && (
          <div className="mt-4 space-y-8">

            {/* ✅ Matched Jobs */}
            <div>
              <h4 className="text-xl font-bold mb-2 text-green-700">✅ Matched Jobs</h4>
              <ul>
                {jobs.filter(job => job.isRelevant).map((job) => (
                  <li
                    key={job._id}
                    className="mb-4 p-3 rounded-md border border-green-200 bg-green-50 shadow-sm"
                  >
                    <div className="font-semibold text-lg">{job.title}</div>
                    <div className="text-sm text-gray-600 mb-1">{job.companyName}</div>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      View Job
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* ⚠️ Borderline Jobs */}
            <div>
              <h4 className="text-xl font-bold mb-2 text-yellow-700">⚠️ Borderline Matches</h4>
              <ul>
                {jobs.filter(job => !job.isRelevant && !job.is_deleted).map((job) => (
                  <li
                    key={job._id}
                    className="mb-4 p-3 rounded-md border border-yellow-300 bg-yellow-50 shadow-sm"
                  >
                    <div className="font-semibold text-lg">{job.title}</div>
                    <div className="text-sm text-gray-600 mb-1">{job.companyName}</div>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      View Job
                    </a>
                    {job.rejectionReason && (
                      <div className="mt-2 text-yellow-800 text-sm font-medium">
                        ⚠️ Reason: {job.rejectionReason}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* ❌ Rejected Jobs */}
            <div>
              <h4 className="text-xl font-bold mb-2 text-red-700">❌ Rejected Jobs</h4>
              <ul>
                {jobs.filter(job => job.is_deleted).map((job) => (
                  <li
                    key={job._id}
                    className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 shadow-sm"
                  >
                    <div className="font-semibold text-lg">{job.title}</div>
                    <div className="text-sm text-gray-600 mb-1">{job.companyName}</div>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      View Job
                    </a>
                    {job.rejectionReason && (
                      <div className="mt-2 text-red-600 text-sm font-medium">
                        ❌ Rejection Reason: {job.rejectionReason}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}


      </div>
    </Layout>
  );
}
