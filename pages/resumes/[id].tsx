import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';

interface Resume {
  _id: string;
  originalName: string;
  textContent: string;
  createdAt: string;
  updatedAt: string;
  isMaster: boolean;
}

export default function ResumeDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchResume();
    }
  }, [id]);

  const fetchResume = async () => {
    try {
      const res = await api.get(`/resumes/${id}`);
      setResume(res.data);
    } catch (error) {
      console.error('Error fetching resume:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><p>Loading...</p></Layout>;
  if (!resume) return <Layout><p>Resume not found.</p></Layout>;

  return (
    <Layout>
      <div className="container mt-4">
        <h2>Resume Details</h2>
        <div className="card mt-4">
          <div className="card-body">
            <h4 className="card-title">{resume.originalName}</h4>
            <h6 className="card-subtitle mb-2 text-muted">
              Uploaded: {new Date(resume.createdAt).toLocaleString()}
            </h6>
            <h6 className="card-subtitle mb-2 text-muted">
              Updated: {new Date(resume.updatedAt).toLocaleString()}
            </h6>
            <h6 className="card-subtitle mb-2">
              {resume.isMaster ? (
                <span className="badge bg-success">Master Resume</span>
              ) : (
                <span className="badge bg-secondary">Normal Resume</span>
              )}
            </h6>
            <hr />
            <h5>Extracted Text Content:</h5>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{resume.textContent}</pre>
          </div>
        </div>
      </div>
    </Layout>
  );
}
