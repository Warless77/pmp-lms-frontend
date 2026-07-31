import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { getCurrentUser } from '../services/authService.js';
import { useEntitlement } from '../context/EntitlementContext.jsx';

/**
 * Profile page displays account information and a summary of the user's progress.
 */
function Profile() {
  const [user, setUser] = useState(null);
  const { entitlement } = useEntitlement();
  useEffect(() => {
    getCurrentUser().then((res) => setUser(res.user));
  }, []);
  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your account" />
      {user ? (
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', maxWidth: '400px' }}>
          <p><strong>Name:</strong> {user.user_metadata?.full_name || user.email}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Plan:</strong> {entitlement.tier === 'none' ? 'No active plan' : `${entitlement.tier[0].toUpperCase()}${entitlement.tier.slice(1)}`}</p>
          {entitlement.expiresAt && <p><strong>Plan expiry:</strong> {new Date(entitlement.expiresAt).toLocaleDateString()}</p>}
          {entitlement.practiceLimit !== null && <p><strong>Trial practice:</strong> {entitlement.practiceRemaining} of {entitlement.practiceLimit} answers remaining</p>}
          <p><strong>Exam Target Date:</strong> {user.user_metadata?.target_exam_date || 'Not set'}</p>
          <p><strong>Account status:</strong> Active</p>
        </div>
      ) : (
        <p>Loading profile…</p>
      )}
    </div>
  );
}

export default Profile;
