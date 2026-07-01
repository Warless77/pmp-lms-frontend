import React from 'react';
import ProgressBar from './ProgressBar.jsx';
import { Link } from 'react-router-dom';

/**
 * Card representing a learning module with progress information and a call
 * to action to continue. Accepts a module object with id, title,
 * description, lessons and progress.
 */
function ModuleCard({ module }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', flex: 1 }}>
      <h3 style={{ marginTop: 0 }}>{module.title}</h3>
      <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>{module.description}</p>
      <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Lessons: {module.lessons}</p>
      <ProgressBar progress={module.progress} />
      <Link
        to={`/modules/${module.id}`}
        style={{ display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: '4px' }}
      >
        Continue
      </Link>
    </div>
  );
}

export default ModuleCard;