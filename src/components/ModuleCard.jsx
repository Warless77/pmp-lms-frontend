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
    <div className="module-card">
      <h3>{module.title}</h3><p>{module.description}</p>
      <div className="module-meta"><span>{module.lessons} lessons</span><span>{module.progress || 0}% complete</span></div>
      <ProgressBar progress={module.progress} />
      <Link
        to={`/modules/${module.id}`}
        className="button-primary" style={{ marginTop: '1rem' }}
      >
        Continue
      </Link>
    </div>
  );
}

export default ModuleCard;
