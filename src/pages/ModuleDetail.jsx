import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { getModules } from '../services/contentService.js';

/**
 * ModuleDetail shows information about a specific module based on the route
 * parameter. It includes learning objectives and a placeholder for multimedia
 * content. In a real application this would include embedded video players,
 * PDFs and interactive lessons.
 */
function ModuleDetail() {
  const { id } = useParams();
  const [module, setModule] = useState(null);
  useEffect(() => {
    getModules().then((mods) => setModule(mods.find((m) => m.id === id)));
  }, [id]);

  if (!module) {
    return <p>Loading…</p>;
  }

  return (
    <div>
      <PageHeader title={module.title} subtitle={module.description} />
      <div style={{ marginBottom: '1rem' }}>
        <h4>Progress</h4>
        <ProgressBar progress={module.progress} />
      </div>
      <section style={{ marginBottom: '2rem' }}>
        <h4>Learning Objectives</h4>
        <ul>
          <li>Understand key concepts of the {module.title}</li>
          <li>Apply best practices in exam scenarios</li>
          <li>Evaluate case studies relevant to the domain</li>
        </ul>
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h4>Lesson Content</h4>
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem' }}>
          <p>Video and PDF content will appear here.</p>
        </div>
      </section>
    </div>
  );
}

export default ModuleDetail;