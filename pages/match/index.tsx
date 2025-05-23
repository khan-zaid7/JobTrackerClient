// client/pages/match/index.tsx

import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';

interface Resume {
  _id: string;
  originalName: string;
  textContent: string;   // ✅ ADD textContent
}

interface Job {
  _id: string;
  position: string;
  description: string;
}

export default function MatchResume() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [matchResult, setMatchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tailorEnabled, setTailorEnabled] = useState(false);
  const TAILOR_THRESHOLD = 60;


  const fetchResumes = async () => {
    const res = await api.get('/resumes');
    setResumes(res.data);
  };

  const fetchJobs = async () => {
    const res = await api.get('/jobs');
    setJobs(res.data.jobs);
  };

  useEffect(() => {
    fetchResumes();
    fetchJobs();
  }, []);

  const handleMatch = async () => {
    if (!selectedResumeId || !selectedJobId) {
      alert('Select both resume and job!');
      return;
    }
  
    const selectedResume = resumes.find(r => r._id === selectedResumeId);
    const selectedJob = jobs.find(j => j._id === selectedJobId);
  
    if (!selectedResume || !selectedJob) {
      alert('Invalid selection.');
      return;
    }
  
    setLoading(true);
  
    try {
      const matchRes = await api.post('/match/match-resume', {
        jobId: selectedJob._id,
        resumeId: selectedResume._id,
        jobDescription: selectedJob.description,
        resumeText: selectedResume.textContent
      });
  
      const matchData = matchRes.data;
  
      let tailoredResume: string | null = null;
      let pdfUrl: string | null = null;
  
      if (tailorEnabled && matchData.score >= TAILOR_THRESHOLD) {
        const tailorRes = await api.post('/match/tailor-resume', {
          matchResultId: matchData._id
        });
  
        tailoredResume = tailorRes.data.tailoredResume;
        pdfUrl = tailorRes.data.pdfUrl;
  
        if (pdfUrl) {
          const link = document.createElement('a');
          link.href = pdfUrl;
          link.download = 'tailored_resume.pdf';
          link.click();
        }
      }
  
      setMatchResult({
        ...matchData,
        tailoredResume,
      });
  
    } catch (error) {
      console.error('Match error:', error);
      alert('Failed to match or tailor resume.');
    } finally {
      setLoading(false);
    }
  };  
  
  return (
    <Layout>
      <div className="container mt-4">
        <h2>Match Resume to Job</h2>

        <div className="mb-3">
          <label>Select Job:</label>
          <select className="form-select" value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)}>
            <option value="">Select a Job</option>
            {jobs.map(job => (
              <option key={job._id} value={job._id}>
                {job.position}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label>Select Resume:</label>
          <select className="form-select" value={selectedResumeId} onChange={e => setSelectedResumeId(e.target.value)}>
            <option value="">Select a Resume</option>
            {resumes.map(resume => (
              <option key={resume._id} value={resume._id}>
                {resume.originalName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={tailorEnabled}
            onChange={() => setTailorEnabled(!tailorEnabled)}
            id="tailorResumeCheck"
          />
          <label className="form-check-label" htmlFor="tailorResumeCheck">
            Customize resume if score ≥ {TAILOR_THRESHOLD}
          </label>
        </div>

        <button className="btn btn-primary" onClick={handleMatch} disabled={loading}>
          {loading ? 'Matching...' : 'Match Resume'}
        </button>

        {matchResult && (
          <div className="mt-4">
            <h4>Match Result:</h4>
            <p><strong>Score:</strong> {matchResult.score}</p>
            <p><strong>Matched Skills:</strong> {matchResult.matchedSkills.join(', ')}</p>
            <p><strong>Missing Skills:</strong> {matchResult.missingSkills.join(', ')}</p>
            <p><strong>Summary:</strong> {matchResult.summary}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
