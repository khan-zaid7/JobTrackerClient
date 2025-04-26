import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/api';
import Layout from '../../components/Layout';

export default function CreateJob() {
  const [form, setForm] = useState({
    position: '',
    company: '',
    location: '',
    status: 'pending',
    description: '',
    salary: '',
    url: '',
  });

  const router = useRouter();

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/jobs', form);
      router.push('/jobs');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Job creation failed');
    }
  };

  return (
    <Layout>
      <h2>Create Job</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label>Position</label>
          <input name="position" className="form-control" onChange={handleChange} required />
        </div>
        <div className="mb-2">
          <label>Company</label>
          <input name="company" className="form-control" onChange={handleChange} required />
        </div>
        <div className="mb-2">
          <label>Location</label>
          <input name="location" className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-2">
          <label>Salary</label>
          <input name="salary" className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-2">
          <label>Job Posting URL</label>
          <input name="url" className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-2">
          <label>Description</label>
          <textarea name="description" className="form-control" rows={4} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label>Status</label>
          <select name="status" className="form-control" onChange={handleChange}>
            <option value="pending">Pending</option>
            <option value="interview">Interview</option>
            <option value="declined">Declined</option>
          </select>
        </div>
        <button className="btn btn-success">Create Job</button>
      </form>
    </Layout>
  );
}
