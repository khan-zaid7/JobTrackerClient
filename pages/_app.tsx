import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app';
import '../public/css/ResumeDiff.css';
import { AuthProvider } from '../contexts/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
