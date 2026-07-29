import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { getFlashcards } from '../services/contentService.js';
import { saveCloudFlashcardReview } from '../services/learnerProgressService.js';

/**
 * Flashcards page provides a simple spaced‑repetition review experience. Users
 * can flip each card to see the answer and mark how well they remembered it.
 */
function Flashcards() {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [domain, setDomain] = useState('All');
  const [reviewed, setReviewed] = useState(0);

  useEffect(() => {
    getFlashcards(1000)
      .then((f) => setCards(f))
      .catch(() => setError('We could not load your flashcard library. Please refresh and try again.'));
  }, []);

  const domains = useMemo(() => ['All', ...new Set(cards.map((card) => card.domain).filter(Boolean))], [cards]);
  const activeCards = useMemo(
    () => domain === 'All' ? cards : cards.filter((card) => card.domain === domain),
    [cards, domain]
  );

  if (!cards.length) {
    return <div><PageHeader title="Flashcards" subtitle="Review key concepts with spaced repetition" /><p>{error || 'Loading your 1,000-card PMP library…'}</p></div>;
  }

  const current = activeCards[index] || activeCards[0];

  const chooseDomain = (nextDomain) => {
    setDomain(nextDomain);
    setIndex(0);
    setShowBack(false);
    setMessage('');
  };

  const handleNext = () => {
    setShowBack(false);
    setIndex((i) => (i + 1) % activeCards.length);
  };

  const markDifficulty = async (level) => {
    try {
      await saveCloudFlashcardReview(current.id, level);
      setReviewed((count) => count + 1);
      setMessage('Review saved. Next card ready.');
      handleNext();
    } catch {
      setMessage('We could not save this review. Please try again.');
    }
  };

  return (
    <div>
      <PageHeader title="Flashcards" subtitle="A 1,000-card PMP library with spaced repetition" />
      <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
        <div className="flashcard-library-summary" aria-label="Flashcard library summary">
          <strong>{cards.length.toLocaleString()}</strong> PMP flashcards available
          <span>Choose a domain or study the complete library.</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {domains.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => chooseDomain(item)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '999px', border: '1px solid var(--color-border)', background: domain === item ? 'var(--color-primary)' : 'var(--color-surface)', color: domain === item ? '#fff' : 'var(--color-text)', cursor: 'pointer' }}
            >
              {item}
            </button>
          ))}
        </div>
        <div
          onClick={() => setShowBack(!showBack)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setShowBack((visible) => !visible); }}
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '2rem',
            cursor: 'pointer',
            minHeight: '150px'
          }}
        >
          <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-primary)' }}>{current.domain}</p>
          <p style={{ fontSize: '1.25rem', whiteSpace: 'pre-line' }}>{showBack ? current.back : current.front}</p>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>{showBack ? 'Tap to view the question again' : 'Tap the card to reveal the answer'}</p>
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
          {domain === 'All' ? 'All PMP concepts' : domain} · Card {index + 1} of {activeCards.length.toLocaleString()} · {reviewed} reviewed this session
        </p>
        {message && <p role="status" className="form-success">{message}</p>}
      </div>
    </div>
  );
}

export default Flashcards;
