import React from 'react';
import PageHeader from '../components/PageHeader.jsx';
import CertificateCard from '../components/CertificateCard.jsx';
import { certificates } from '../data/mockData.js';

/**
 * Certificates page displays completion certificates available to the user.
 */
function Certificates() {
  return (
    <div>
      <PageHeader title="Certificates" subtitle="Celebrate your achievements" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {certificates.map((cert) => (
          <CertificateCard key={cert.id} certificate={cert} />
        ))}
      </div>
    </div>
  );
}

export default Certificates;