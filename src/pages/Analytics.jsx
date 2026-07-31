import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { getLearnerAnalytics } from '../services/analyticsService.js';

/**
 * Analytics page provides insights into the learner's performance. Data is
 * pulled from mock analytics and rendered using simple bar charts. Real
 * implementations would likely use a charting library like Recharts.
 */
function Analytics() {
  const [data, setData] = useState(null);
  useEffect(() => {
    getLearnerAnalytics().then(setData).catch(() => setData({ examReadiness: 0, accuracy: 0, domainPerformance: {}, mockAttempts: [] }));
  }, []);

  if (!data) return <p>Loading analytics…</p>;

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Deep dive into your progress" />
      {/* Exam readiness */}
      <section style={{ marginBottom: '2rem' }}>
        <h4>Exam Readiness</h4>
        <ProgressBar progress={data.examReadiness} />
        <p>{data.examReadiness}% readiness based on your answered questions</p>
        <p>Accuracy: {data.accuracy}% · Questions answered: {data.questionsAnswered}</p>
      </section>
      {/* Domain performance */}
      <section style={{ marginBottom: '2rem' }}>
        <h4>Domain Performance</h4>
        {Object.entries(data.domainPerformance).map(([domain, value]) => (
          <div key={domain} style={{ marginBottom: '0.5rem' }}>
            <p style={{ margin: 0 }}>{domain}</p>
            <ProgressBar progress={value} />
          </div>
        ))}
      </section>
      <section>
        <h4>Mock exam history</h4>
        {data.mockAttempts?.length ? <ul>{data.mockAttempts.map((attempt) => <li key={attempt.completedAt}>{attempt.score} / {attempt.total} — {new Date(attempt.completedAt).toLocaleDateString()}</li>)}</ul> : <p>No mock exams completed yet.</p>}
      </section>
    </div>
  );
}

export default Analytics;
