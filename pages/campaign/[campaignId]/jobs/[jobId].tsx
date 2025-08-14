import { useEffect, useState, FC } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import api from '../../../../utils/api';
import Layout from '../../../../components/Layout';
import type { JobDetailsResponse } from '../../../../types/campaigns';

const JobDetailsClientView = dynamic(() => import('../../../../components/JobDetailsClientView'), {
    ssr: false,
    loading: () => <p style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Editor...</p>
});

const JobDetailPage: FC = () => {
    const router = useRouter();
    const { campaignId, jobId } = router.query;
    const [details, setDetails] = useState<JobDetailsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!router.isReady) return;

        const fetchDetails = async () => {
            setLoading(true);
            try {
                const res = await api.get<JobDetailsResponse>(`/campaigns/job-details/${campaignId}/${jobId}`);
                setDetails(res.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch job details.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [router.isReady, campaignId, jobId]);

    const styles = {
        container: { padding: '2rem', maxWidth: '1400px', margin: '0 auto' },
        loadingError: { textAlign: 'center', marginTop: '4rem', fontSize: '1.2em' },
        header: { marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' },
        sectionTitle: { fontSize: '1.5em', fontWeight: 'bold', color: '#1a202c', marginBottom: '1rem' },
    } as const;

    if (loading) {
        return <Layout><p style={styles.loadingError}>Loading Job Details...</p></Layout>;
    }
    if (error) {
        return <Layout><p style={{ ...styles.loadingError, color: 'red' }}>Error: {error}</p></Layout>;
    }
    if (!details) {
        return <Layout><p style={styles.loadingError}>No job details found.</p></Layout>;
    }

    return (
        <Layout>
            <div style={styles.container}>
                <header style={styles.header}>
                    <h1 style={styles.sectionTitle}>{details.title}</h1>
                    <p style={{ color: '#4a5568', fontSize: '1.2em' }}>{details.companyName} - {details.location}</p>
                    <a href={details.url} target="_blank" rel="noopener noreferrer">View Original Posting</a>
                </header>

                <JobDetailsClientView details={details} />
            </div>
        </Layout>
    );
};

export default JobDetailPage;