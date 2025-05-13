import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let ignore = false;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      router.push('/login');
      return;
    }

    api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!ignore) setUser(res.data);
      })
      .catch(() => router.push('/login'))
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) return <Layout><p>Loading...</p></Layout>;

  return (
    <Layout>
      <div className="text-center mt-4">
        <h1>Welcome {user?.name}</h1>
        <p>Email: {user?.email}</p>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <Link href="/jobs" className="btn btn-primary">
            Manage Jobs
          </Link>
          <Link href="/resumes" className="btn btn-success">
            Manage Resumes
          </Link>
          <Link href="/match" className="btn btn-warning">
            Match Resume
          </Link>
          <Link href="/scrapers" className="btn btn-danger">
            Scrapers
          </Link>
        </div>
      </div>
    </Layout>
  );
}
