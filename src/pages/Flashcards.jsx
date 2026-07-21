import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { getFlashcards } from '../services/contentService.js';
import { recordFlashcardReview } from '../services/learnerProgressService.js';

/**
 * Flashcards page provides a simple spaced‑repetition review experience. Users
 * can flip each card to see the answer and mark how well they remembered it.
 */
function Flashcards() {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    getFlashcards().then((f) => setCards(f));
  }, []);

  if (!cards.length) {
    return <p>Loading cards…</p>;
  }

  const current = cards[index];

  const handleNext = () => {
    setShowBack(false);
    setIndex((i) => (i + 1) % cards.length);
  };

  const markDifficulty = (level) => {
    recordFlashcardReview();
    handleNext();
  };

  return (
    <div>
      <PageHeader title="Flashcards" subtitle="Review key concepts with spaced repetition" />
      <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
        <div
          onClick={() => setShowBack(!showBack)}
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '2rem',
            cursor: 'pointer',
            minHeight: '150px'
          }}
        >
          <p style={{ fontSize: '1.25rem' }}>{showBack ? current.back : current.front}</p>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => markDifficulty('hard')} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-error)', color: '#fff', border: 'none', borderRadius: '4px' }}>
            Hard
          </button>
          <button onClick={() => markDifficulty('medium')} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-warning)', color: '#fff', border: 'none', borderRadius: '4px' }}>
            Medium
          </button>
          <button onClick={() => markDifficulty('easy')} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-success)', color: '#fff', border: 'none', borderRadius: '4px' }}>
            Easy
          </button>
        </div>
        <p style={{ marginTop: '1rem', color: 'var(--color-muted)' }}>
          Card {index + 1} of {cards.length}
        </p>
      </div>
    </div>
  );
}

export default Flashcards;
