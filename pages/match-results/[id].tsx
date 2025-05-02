import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import dynamic from 'next/dynamic';

const ResumeDiff = dynamic(() => import('../../components/ResumeDiff'), { ssr: false });

export default function MatchResultDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<any>(null);
  console.log('something');
  useEffect(() => {
    if (id) {
      api.get(`/match-results/${id}`).then(res => setData(res.data));
    }
  }, [id]);

  if (!data) return <Layout><p>Loading...</p></Layout>;

  const job = data.jobId;
  const resume = data.resumeId;

  return (
    <Layout>
      <div className="container mt-4">
        <h2 className="mb-4">Match Result Details</h2>

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title">
              Job: <a href={job.url} target="_blank" rel="noopener noreferrer">{job.position}</a> at {job.company}
            </h5>
            <p className="card-text"><strong>Score:</strong> {data.score}</p>
            <p><strong>Matched Skills:</strong> <span className="text-success">{data.matchedSkills.join(', ')}</span></p>
            <p><strong>Missing Skills:</strong> <span className="text-danger">{data.missingSkills.join(', ')}</span></p>
            <p><strong>Summary:</strong> {data.summary}</p>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="mb-3">Resume Comparison</h4>
          <ResumeDiff original={resume.textContent} tailored={data.tailoredResume || ''} />
        </div>
      </div>
    </Layout>
  );
}
