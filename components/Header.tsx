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
            <Link className="navbar-brand" href="/">JobTracker</Link>

            <div className="ms-auto d-flex align-items-center gap-2">
                {!isLoggedIn && (
                    <>
                        <Link className="btn btn-outline-light btn-sm" href="/login">Login</Link>
                        <Link className="btn btn-outline-light btn-sm" href="/register">Register</Link>
                    </>
                )}
                {isLoggedIn && (
                    <>
                        <Link className="btn btn-outline-light btn-sm" href="/jobs">Jobs</Link>
                        <Link className="btn btn-outline-light btn-sm" href="/logout">Logout</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
