import React, { useEffect, useState } from 'react';
import ModuleCard from '../components/ModuleCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { getModules } from '../services/contentService.js';

/**
 * Modules page displays all learning modules available in the LMS. Each module
 * is represented by a ModuleCard showing progress and a description.
 */
function Modules() {
  const [modules, setModules] = useState([]);
  useEffect(() => {
    getModules().then(setModules);
  }, []);
  return (
    <div>
      <PageHeader title="Modules" subtitle="Browse all study modules" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {modules.map((mod) => (
          <ModuleCard key={mod.id} module={mod} />
        ))}
      </div>
    </div>
  );
}

export default Modules;