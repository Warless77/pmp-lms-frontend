import React from 'react';

/**
 * CertificateCard shows information about a certificate and its locked/unlocked
 * status. Accepts a `certificate` object with title and status.
 */
function CertificateCard({ certificate }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', flex: 1 }}>
      <h4>{certificate.title}</h4>
      <p>Status: {certificate.unlocked ? 'Unlocked' : 'Locked'}</p>
    </div>
  );
}

export default CertificateCard;