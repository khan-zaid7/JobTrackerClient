
import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';

interface Resume {
  _id: string;
  originalName: string;
  textContent: string;
  createdAt: string;
  isMaster: boolean;
}

export default function ResumeList() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [updatingResumeId, setUpdatingResumeId] = useState<string | null>(null);
  const [isMaster, setIsMaster] = useState(false); // <<-- ADD isMaster

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      setResumes(res.data);
    } catch (err: any) {
      console.error('Failed to load resumes', err);
      setError('Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    if (file) {
      formData.append('file', file);
    }
    formData.append('isMaster', isMaster.toString());

    try {
      setUploading(true);
      setUploadError('');

      if (updatingResumeId) {
        // Update existing
        await api.put(`/resumes/${updatingResumeId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Resume updated successfully!');
      } else {
        // Upload new
        if (!file) {
          setUploadError('Please select a resume to upload.');
          setUploading(false);
          return;
        }
        await api.post('/resumes', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Resume uploaded successfully!');
      }

      setFile(null);
      setShowModal(false);
      setUpdatingResumeId(null);
      setIsMaster(false);
      fetchResumes();
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      await api.delete(`/resumes/${id}`);
      alert('Resume deleted successfully!');
      fetchResumes();
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Failed to delete resume.');
    }
  };

  const openUpdateModal = (id: string) => {
    const selectedResume = resumes.find((r) => r._id === id);
    if (selectedResume) {
      setIsMaster(selectedResume.isMaster || false); // <<-- prefill isMaster
    }
    setUpdatingResumeId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFile(null);
    setUploadError('');
    setUpdatingResumeId(null);
    setIsMaster(false);
  };

  return (
    <Layout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Your Resumes</h2>
          <button
            className="btn btn-success"
            onClick={() => {
              setShowModal(true);
              setUpdatingResumeId(null);
              setIsMaster(false);
            }}
          >
            Add Resume
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <p>Loading...</p>
        ) : resumes.length === 0 ? (
          <p>No resumes uploaded yet.</p>
        ) : (
          <ul className="list-group">
            {resumes.map((resume) => (
              <li
                key={resume._id}
                className={`list-group-item d-flex justify-content-between align-items-center ${resume.isMaster ? 'bg-success text-white' : ''}`}
              >
                <div>
                  <h5>
                    {resume.originalName}{' '}
                    {resume.isMaster && <span className="badge bg-light text-dark ms-2">Master</span>}
                  </h5>
                  <p><small>Uploaded: {new Date(resume.createdAt).toLocaleString()}</small></p>
                  <p><small>Is Master: {resume.isMaster ? 'Yes' : 'No'}</small></p>
                </div>
                <div>
                  <button
                    className="btn btn-light btn-sm me-2"
                    onClick={() => openUpdateModal(resume._id)}
                  >
                    Update
                  </button>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleDelete(resume._id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleUpload}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {updatingResumeId ? 'Update Resume' : 'Upload New Resume'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    className="form-control mb-3"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={isMaster}
                      onChange={(e) => setIsMaster(e.target.checked)}
                      id="isMasterCheckbox"
                    />
                    <label className="form-check-label" htmlFor="isMasterCheckbox">
                      Mark as Master Resume
                    </label>
                  </div>
                  {uploadError && <div className="alert alert-danger">{uploadError}</div>}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploading}
                  >
                    {uploading
                      ? updatingResumeId
                        ? 'Updating...'
                        : 'Uploading...'
                      : updatingResumeId
                        ? 'Update'
                        : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
