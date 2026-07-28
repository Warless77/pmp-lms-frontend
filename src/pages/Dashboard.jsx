import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import ModuleCard from '../components/ModuleCard.jsx';
import FlashcardPreview from '../components/FlashcardPreview.jsx';
import { getDashboardAnalytics } from '../services/analyticsService.js';
import { getModules, getFlashcards } from '../services/contentService.js';

/**
 * Dashboard page summarises the student's progress at a glance. It pulls
 * mock analytics data and displays statistics, modules, flashcard queue and
 * recent activities.
 */
function Dashboard() {
  const [stats, setStats] = useState({});
  const [modules, setModules] = useState([]);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    getDashboardAnalytics().then(setStats).catch(() => setStats({}));
    getModules().then(setModules);
    getFlashcards().then(setCards);
  }, []);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your progress overview" />
      <div className="stats-grid">
        <StatCard title="Exam Readiness" value={`${stats.examReadiness || 0}%`} />
        <StatCard title="Study Streak" value={stats.studyStreak || 0} />
        <StatCard title="Modules Completed" value={stats.modulesCompleted || 0} />
        <StatCard title="Questions Answered" value={stats.questionsAnswered || 0} />
        <StatCard title="Flashcards Due" value={stats.flashcardsDue || 0} />
      </div>
      <div className="dashboard-grid"><section>
        <h3 className="section-heading">Continue learning <small>Pick up where you left off</small></h3>
        <div className="module-grid">
          {modules.map((mod) => (
            <ModuleCard key={mod.id} module={mod} />
          ))}
        </div>
      </section><aside>
      <section className="surface-card" style={{ padding: '1.15rem', marginBottom: '1rem' }}>
        <h3 className="section-heading">Flashcards <small>Due now</small></h3>
        <div className="flashcard-stack">
          {cards.slice(0, 3).map((card) => (
            <FlashcardPreview key={card.id} card={card} />
          ))}
        </div>
      </section><section className="surface-card attempt-list">
        <h3 className="section-heading">Recent mock exams</h3>
        {stats.mockAttempts?.length ? stats.mockAttempts.slice(0, 3).map((attempt) => <div className="attempt-row" key={attempt.completedAt}><span>{new Date(attempt.completedAt).toLocaleDateString()}</span><strong>{attempt.score} / {attempt.total}</strong></div>) : <p style={{ color: 'var(--color-muted)', fontSize: '.86rem', margin: 0 }}>No attempts yet. Start a mock exam when you are ready.</p>}
      </section></aside></div>
    </div>
  );
}

export default Dashboard;
