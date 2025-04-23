import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ToastMessage from '../components/ToastMessage';
import Layout from '../components/Layout';

export default function Logout() {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  useEffect(() => {
    localStorage.removeItem('token');
    setToast({ message: 'Logout Successful' });

    const timer = setTimeout(() => {
      router.push('/login');
    }, 1500);

    return () => clearTimeout(timer); // clean up
  }, []);

  return (
    <Layout>
      <div className="container text-center mt-5">
        <p>Logging out...</p>
      </div>

      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  );
}
