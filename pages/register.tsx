import { useState } from 'react';
import api from '../utils/api';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import useRedirectIfAuth from '../hooks/useRedirectIfAuth';
import ToastMessage from '../components/ToastMessage';

export default function Register() {
    useRedirectIfAuth();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
    const router = useRouter();

    const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', form);
            setToast({ message: 'Register Successful' });
            setTimeout(() => router.push('/login'), 1500);
        } catch (err: any) {
            alert(
                err.response?.data?.details ||
                err.response?.data?.error ||
                'Registration failed'
            );
        }
    };

    return (
        <Layout>
            <div className="container d-flex justify-content-center align-items-center vh-100">
                <form className="p-4 shadow rounded w-100" style={{ maxWidth: 400 }} onSubmit={handleSubmit}>
                    <h2 className="text-center mb-4">Register</h2>

                    <div className="mb-3">
                        <input type="text" name="name" className="form-control" placeholder="Name" onChange={handleChange} required />
                    </div>

                    <div className="mb-3">
                        <input type="email" name="email" className="form-control" placeholder="Email" onChange={handleChange} required />
                    </div>

                    <div className="mb-3">
                        <input type="password" name="password" className="form-control" placeholder="Password" onChange={handleChange} required />
                    </div>

                    <button className="btn btn-success w-100" type="submit">Sign Up</button>

                    <p className="mt-3 text-center">
                        Already a member? <Link href="/login" className="text-primary">Login</Link>
                    </p>
                </form>
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
