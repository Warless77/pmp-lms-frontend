import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { getModules } from '../services/contentService.js';
import { toggleModuleComplete } from '../services/learnerProgressService.js';
import { useNavigate } from 'react-router-dom';

/**
 * ModuleDetail shows information about a specific module based on the route
 * parameter. It includes learning objectives and a placeholder for multimedia
 * content. In a real application this would include embedded video players,
 * PDFs and interactive lessons.
 */
function ModuleDetail() {
  const { id } = useParams();
  const [module, setModule] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    getModules().then((mods) => setModule(mods.find((m) => m.id === id)));
  }, [id]);

  if (!module) {
    return <p>Loading…</p>;
  }
  const toggleComplete = () => {
    toggleModuleComplete(module.id);
    setModule((current) => ({ ...current, progress: current.progress === 100 ? 0 : 100 }));
  };

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
        <h4>Study guide</h4>
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem' }}>
          <p>Use the practice questions to apply this domain. Source materials can be added by an administrator as downloadable lessons.</p>
        </div>
      </section>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={toggleComplete} style={{ padding: '0.65rem 1rem', background: module.progress === 100 ? 'var(--color-secondary)' : 'var(--color-primary)', color: '#fff', border: 0, borderRadius: '5px', cursor: 'pointer' }}>{module.progress === 100 ? 'Mark as not completed' : 'Mark module complete'}</button>
        <button type="button" onClick={() => navigate('/questions')} style={{ padding: '0.65rem 1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '5px', cursor: 'pointer' }}>Practise questions</button>
      </div>
    </div>
  );
}

export default ModuleDetail;
