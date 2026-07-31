import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import CertificateCard from '../components/CertificateCard.jsx';
import { getLearningSummary } from '../services/learnerProgressService.js';

function Certificates() {
  const [progress, setProgress] = useState({ completedModules: [], mockAttempts: [] });
  useEffect(() => {
    const refresh = () => getLearningSummary().then(setProgress).catch(() => {});
    refresh();
    window.addEventListener('pmp-progress-change', refresh);
    return () => window.removeEventListener('pmp-progress-change', refresh);
  }, []);
  const certificates = [
    { id: 'people', title: 'People Domain Completion', unlocked: progress.completedModules.includes('people') },
    { id: 'process', title: 'Process Domain Completion', unlocked: progress.completedModules.includes('process') },
    { id: 'business', title: 'Business Environment Completion', unlocked: progress.completedModules.includes('business') },
    { id: 'mock', title: 'Private Beta Mock Exam Completion', unlocked: progress.mockAttempts.length > 0 }
  ];
  return <div><PageHeader title="Certificates" subtitle="Your earned learning milestones" /><p style={{ color: 'var(--color-muted)' }}>Certificates unlock when you complete the matching activity. Formal, downloadable certificates will be added before public launch.</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>{certificates.map((certificate) => <CertificateCard key={certificate.id} certificate={certificate} />)}</div></div>;
}

export default Certificates;
