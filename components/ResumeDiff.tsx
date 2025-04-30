import { diffLines } from 'diff';
import '../public/css/ResumeDiff.css'; // optional
interface ResumeDiffProps {
    original: string;
    tailored: string;
  }
  
  export default function ResumeDiff({ original, tailored }: ResumeDiffProps) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{ backgroundColor: '#ffecec', padding: '1rem', borderRadius: '8px' }}>
          <h5 style={{ color: '#cc0000' }}>Original Resume</h5>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{original}</pre>
        </div>
        <div style={{ backgroundColor: '#e7f9ed', padding: '1rem', borderRadius: '8px' }}>
          <h5 style={{ color: '#2b7a3d' }}>Tailored Resume</h5>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{tailored}</pre>
        </div>
      </div>
    );
  }
  