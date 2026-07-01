import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { analyticsData } from '../data/mockData.js';

/**
 * Analytics page provides insights into the learner's performance. Data is
 * pulled from mock analytics and rendered using simple bar charts. Real
 * implementations would likely use a charting library like Recharts.
 */
function Analytics() {
  const [data, setData] = useState(null);
  useEffect(() => {
    // In a real app this would call analyticsService.getDashboardAnalytics()
    setData(analyticsData);
  }, []);

  if (!data) return <p>Loading analytics…</p>;

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Deep dive into your progress" />
      {/* Exam readiness */}
      <section style={{ marginBottom: '2rem' }}>
        <h4>Exam Readiness</h4>
        <ProgressBar progress={data.readiness} />
        <p>{data.readiness}% ready for the exam</p>
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
      {/* Knowledge areas */}
      <section style={{ marginBottom: '2rem' }}>
        <h4>Knowledge Areas</h4>
        {Object.entries(data.knowledgeAreas).map(([area, value]) => (
          <div key={area} style={{ marginBottom: '0.5rem' }}>
            <p style={{ margin: 0 }}>{area}</p>
            <ProgressBar progress={value} />
          </div>
        ))}
      </section>
      {/* Recommendations */}
      <section>
        <h4>Recommended Focus Areas</h4>
        <ul>
          {data.recommendations.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Analytics;