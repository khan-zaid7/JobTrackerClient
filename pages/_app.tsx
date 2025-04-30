import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app';
import '../public/css/ResumeDiff.css';


export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
