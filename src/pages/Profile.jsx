import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { getCurrentUser } from '../services/authService.js';

/**
 * Profile page displays account information and a summary of the user's progress.
 */
function Profile() {
  const [user, setUser] = useState(null);
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
          <p><strong>Plan:</strong> Private beta</p>
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
