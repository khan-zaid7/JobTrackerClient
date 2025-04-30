import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' && localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="container-fluid">
        <Link href="/" className="navbar-brand fw-bold">
          JobTracker
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto gap-3">
            {!isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/register">Register</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/jobs">Jobs</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/resumes">Resumes</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/match">Match</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/match-results">Match Results</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/logout">Logout</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
