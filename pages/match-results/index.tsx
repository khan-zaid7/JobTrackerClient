import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../utils/api';
import Layout from '../../components/Layout';

export default function MatchResultsIndex() {
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/match-results').then(res => setResults(res.data));
  }, []);

  const filteredResults = results.filter((result: any) => {
    const jobMatch = result.jobId?.position?.toLowerCase().includes(searchTerm.toLowerCase());
    const resumeMatch = result.resumeId?.originalName?.toLowerCase().includes(searchTerm.toLowerCase());
    return jobMatch || resumeMatch;
  });

  return (
    <Layout>
      <div className="container mt-4">
        <h2>All Match Results</h2>

        <div className="my-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by job or resume..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="row row-cols-1 row-cols-md-2 g-4 mt-1">
          {filteredResults.map((result: any) => (
            <div className="col" key={result._id}>
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">
                    <Link href={`/match-results/${result._id}`}>
                      {result.jobId?.position || 'Unknown Job'}
                    </Link>
                  </h5>
                  <p className="card-text mb-1"><strong>Score:</strong> {result.score}</p>
                  <p className="card-text mb-1"><strong>Resume:</strong> {result.resumeId?.originalName}</p>
                  <p className="card-text text-muted"><strong>Created:</strong> {new Date(result.createdAt).toLocaleString()}</p>
                </div>
                <div className="card-footer bg-transparent border-top-0 text-end">
                  <Link href={`/match-results/${result._id}`} className="btn btn-sm btn-outline-primary">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {filteredResults.length === 0 && (
            <p className="text-muted mt-3">No match results found for this search.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
