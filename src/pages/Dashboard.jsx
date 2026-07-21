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
      {/* Stats row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard title="Exam Readiness" value={`${stats.examReadiness || 0}%`} />
        <StatCard title="Study Streak" value={stats.studyStreak || 0} />
        <StatCard title="Modules Completed" value={stats.modulesCompleted || 0} />
        <StatCard title="Questions Answered" value={stats.questionsAnswered || 0} />
        <StatCard title="Flashcards Due" value={stats.flashcardsDue || 0} />
      </div>
      {/* Modules */}
      <section style={{ marginBottom: '2rem' }}>
        <h3>Modules</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {modules.map((mod) => (
            <ModuleCard key={mod.id} module={mod} />
          ))}
        </div>
      </section>
      {/* Flashcards */}
      <section style={{ marginBottom: '2rem' }}>
        <h3>Flashcards Queue</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {cards.slice(0, 3).map((card) => (
            <FlashcardPreview key={card.id} card={card} />
          ))}
        </div>
      </section>
      <section>
        <h3>Recent mock exams</h3>
        {stats.mockAttempts?.length ? <ul style={{ paddingLeft: 0, listStyle: 'none' }}>{stats.mockAttempts.slice(0, 3).map((attempt) => <li key={attempt.completedAt} style={{ marginBottom: '0.5rem' }}>Scored {attempt.score} / {attempt.total} on {new Date(attempt.completedAt).toLocaleDateString()}</li>)}</ul> : <p style={{ color: 'var(--color-muted)' }}>No mock exam attempts yet. Start one when you are ready.</p>}
      </section>
    </div>
  );
}

export default Dashboard;
