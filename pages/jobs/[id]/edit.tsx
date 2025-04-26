import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../../utils/api';
import Layout from '../../../components/Layout';

export default function EditJob() {
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
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      api.get(`/jobs/${id}`).then((res) => setForm(res.data));
    }
  }, [id]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.put(`/jobs/${id}`, form);
      router.push('/jobs');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Update failed');
    }
  };

  return (
    <Layout>
      <h2>Edit Job</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label>Position</label>
          <input name="position" value={form.position} className="form-control" onChange={handleChange} required />
        </div>
        <div className="mb-2">
          <label>Company</label>
          <input name="company" value={form.company} className="form-control" onChange={handleChange} required />
        </div>
        <div className="mb-2">
          <label>Location</label>
          <input name="location" value={form.location} className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-2">
          <label>Salary</label>
          <input name="salary" value={form.salary} className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-2">
          <label>Job Posting URL</label>
          <input name="url" value={form.url} className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-2">
          <label>Description</label>
          <textarea name="description" value={form.description} className="form-control" rows={4} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label>Status</label>
          <select name="status" className="form-control" value={form.status} onChange={handleChange}>
            <option value="pending">Pending</option>
            <option value="interview">Interview</option>
            <option value="declined">Declined</option>
          </select>
        </div>
        <button className="btn btn-primary">Update Job</button>
      </form>
    </Layout>
  );
}
