import { FC, useMemo } from 'react';
import * as Diff from 'diff';
import type { JobDetailsResponse } from '../types/campaigns'; // Assuming this type is updated

// --- STYLES ---
const styles = {
    // LAYOUT & CONTAINERS
    pageContainer: { display: 'flex', flexDirection: 'column', gap: '2.5rem', padding: '1rem' },
    topGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' },
    card: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', height: 'fit-content', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
    section: { borderTop: '1px solid #e2e8f0', paddingTop: '2rem' },

    // TYPOGRAPHY & HEADERS
    sectionTitle: { fontSize: '1.75em', fontWeight: 'bold', color: '#1a202c', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    subHeading: { fontSize: '1.1em', fontWeight: '600', color: '#4a5568', marginTop: '1.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' },
    cardTitle: { fontSize: '1.5em', fontWeight: 'bold', color: '#1a202c', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },

    // DIFF COMPONENT STYLES
    diffContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    diffBox: { border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.9em', backgroundColor: '#fdfdff' },
    diffAdded: { backgroundColor: '#e6fffa', color: '#234e52', borderRadius: '2px' },
    diffRemoved: { backgroundColor: '#fff5f5', color: '#822727', textDecoration: 'line-through', borderRadius: '2px' },

    // MISC & INTERACTIVE
    missingDataText: { color: '#718096', fontStyle: 'italic', textAlign: 'center', padding: '3rem 1rem', backgroundColor: '#f7fafc', borderRadius: '8px' },
    downloadButton: { backgroundColor: '#3182ce', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9em', transition: 'background-color 0.2s ease-in-out', cursor: 'pointer' },
    prepSection: { whiteSpace: 'pre-wrap', backgroundColor: '#f7fafc', padding: '1.5rem', borderRadius: '8px', lineHeight: '1.7', border: '1px solid #e2e8f0', marginTop: '0.5rem' },

    // FORMATTED RESUME STYLES
    formattedResumeContainer: { fontFamily: 'sans-serif', lineHeight: '1.6', color: '#333' },
    ul: { listStylePosition: 'inside', paddingLeft: '0.5rem', marginTop: 0, marginBottom: '1rem' }
} as const;

// --- RESUME PARSER & FORMATTER (IMPROVED) ---
const FormattedResume: FC<{ textContent: string }> = ({ textContent }) => {
    const sectionHeaders = ['SUMMARY', 'PROJECTS', 'EXPERIENCE', 'SKILLS', 'EDUCATION', 'LANGUAGES', 'FRONTEND', 'BACKEND', 'DATABASES', 'CLOUD/DEVOPS'];

    const formattedHtml = useMemo(() => {
        if (!textContent) return '';
        let cleanedText = textContent;
        sectionHeaders.forEach(header => {
            const regex = new RegExp(`([\\*\\w])\\s*(${header})$`, 'im');
            cleanedText = cleanedText.replace(regex, `$1\n\n${header}`);
        });
        const lines = cleanedText.split('\n').filter(line => line.trim() !== '');
        let html = '';
        let inList = false;
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (sectionHeaders.includes(trimmedLine.toUpperCase())) {
                if (inList) { html += `</ul>`; inList = false; }
                html += `<h2 style="font-size: 1.2em; font-weight: bold; border-bottom: 2px solid #eee; padding-bottom: 0.3em; margin-top: 1.5em; margin-bottom: 1em;">${trimmedLine}</h2>`;
            } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) {
                if (!inList) { html += `<ul style="list-style-type: disc; padding-left: 20px; margin: 0 0 1em 0;">`; inList = true; }
                html += `<li style="margin-bottom: 0.5em;">${trimmedLine.substring(1).trim()}</li>`;
            } else {
                if (inList) { html += `</ul>`; inList = false; }
                if (trimmedLine.split(' ').length > 2 && trimmedLine.includes('|')) {
                     html += `<h3 style="font-size: 1.1em; font-weight: bold; margin-bottom: 0.5em;">${trimmedLine}</h3>`;
                } else {
                    html += `<p style="margin: 0 0 1em 0;">${trimmedLine}</p>`;
                }
            }
        });
        if (inList) html += `</ul>`;
        return html;
    }, [textContent]);

    return <div style={styles.formattedResumeContainer} dangerouslySetInnerHTML={{ __html: formattedHtml }} />;
};

// --- SIDE-BY-SIDE COMPARISON (RE-STYLED) ---
const ResumeComparison: FC<{ originalText: string; tailoredText: string }> = ({ originalText, tailoredText }) => {
    const diffResult = useMemo(() => Diff.diffWords(originalText, tailoredText, { ignoreCase: true }), [originalText, tailoredText]);
    return (
        <div style={styles.diffContainer}>
            <div style={styles.diffBox}>
                <h3 style={styles.subHeading}>Original</h3>
                {diffResult.map((part, index) => !part.added && <span key={index} style={part.removed ? styles.diffRemoved : {}}>{part.value}</span>)}
            </div>
            <div style={styles.diffBox}>
                <h3 style={styles.subHeading}>Tailored</h3>
                {diffResult.map((part, index) => !part.removed && <span key={index} style={part.added ? styles.diffAdded : {}}>{part.value}</span>)}
            </div>
        </div>
    );
};

// --- PROPS & MAIN COMPONENT (RE-ARCHITECTED) ---
interface JobDetailsClientViewProps {
    details: JobDetailsResponse;
}

const JobDetailsClientView: FC<JobDetailsClientViewProps> = ({ details }) => {
    const { tailoredResume, originalResume, description } = details;
    const { analysis, interviewPrep, pdfPath } = tailoredResume || {};

    return (
        <div style={styles.pageContainer}>
            {/* --- TOP ROW: CORE INFORMATION --- */}
            <div style={styles.topGrid}>
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Job Description</h2>
                    <h3 style={styles.subHeading}>Responsibilities</h3>
                    <ul style={styles.ul}>{description.responsibilities.map((r, i) => <li key={i}>{r}</li>)}</ul>
                    <h3 style={styles.subHeading}>Qualifications</h3>
                    <ul style={styles.ul}>{description.qualifications.map((q, i) => <li key={i}>{q}</li>)}</ul>
                </div>

                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>
                        <span>{tailoredResume ? "Tailored Resume" : "Original Resume"}</span>
                        {pdfPath && <a href={pdfPath} target="_blank" rel="noopener noreferrer" style={styles.downloadButton}>Download PDF</a>}
                    </h2>
                    {tailoredResume ? (
                        <FormattedResume textContent={tailoredResume.tailoredText || ''} />
                    ) : originalResume?.textContent ? (
                        <FormattedResume textContent={originalResume.textContent} />
                    ) : (
                        <p style={styles.missingDataText}>Original resume data not available.</p>
                    )}
                </div>
            </div>

            {/* Renders the following sections only if a tailored resume exists */}
            {tailoredResume && (
                <>
                    {/* --- INSIGHTS SECTION (styled like interview prep) --- */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Insights & Comparison</h2>

                        {/* Analysis card */}
                        {analysis && (Object.values(analysis).some(arr => arr.length > 0)) && (
                            <div style={styles.card}>
                                {analysis.strengths?.length > 0 && (
                                    <>
                                        <h3 style={styles.subHeading}>✅ Strengths</h3>
                                        <ul style={styles.ul}>{analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                                    </>
                                )}
                                {analysis.gaps?.length > 0 && (
                                    <>
                                        <h3 style={styles.subHeading}>⚠️ Gaps</h3>
                                        <ul style={styles.ul}>{analysis.gaps.map((g, i) => <li key={i}>{g}</li>)}</ul>
                                    </>
                                )}
                                {analysis.keywordsToIntegrate?.length > 0 && (
                                    <>
                                        <h3 style={styles.subHeading}>🔑 Keywords</h3>
                                        <ul style={styles.ul}>{analysis.keywordsToIntegrate.map((k, i) => <li key={i}>{k}</li>)}</ul>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Side-by-side comparison spans full width */}
                        <div style={{ ...styles.card, marginTop: '2rem' }}>
                            <h2 style={styles.cardTitle}>Side-by-Side Comparison</h2>
                            <ResumeComparison
                                originalText={originalResume?.textContent || 'Original resume data is missing.'}
                                tailoredText={tailoredResume.tailoredText || ''}
                            />
                        </div>
                    </div>

                    {/* --- INTERVIEW PREP SECTION --- */}
                    {interviewPrep && (interviewPrep.talkingPoints || interviewPrep.gapsToAddress) && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>Interview Preparation Cheat Sheet</h2>
                            <div style={styles.card}>
                                {interviewPrep.talkingPoints && (
                                    <>
                                        <h3 style={styles.subHeading}>🎙️ Key Talking Points</h3>
                                        <div style={styles.prepSection}>{interviewPrep.talkingPoints}</div>
                                    </>
                                )}
                                {interviewPrep.gapsToAddress && (
                                    <>
                                        <h3 style={styles.subHeading}>💡 How to Address Gaps</h3>
                                        <div style={styles.prepSection}>{interviewPrep.gapsToAddress}</div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default JobDetailsClientView;
