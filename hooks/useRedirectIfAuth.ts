import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function useRedirectIfAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' && localStorage.getItem('token');
    if (token) {
      router.push('/');
    }
  }, []);
}
