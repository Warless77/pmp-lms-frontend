import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { getFlashcards } from '../services/contentService.js';
import { saveCloudFlashcardReview } from '../services/learnerProgressService.js';

function Flashcards() {
  const [cards, setCards] = useState([]); const [index, setIndex] = useState(0); const [showBack, setShowBack] = useState(false);
  const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [domain, setDomain] = useState('All'); const [reviewed, setReviewed] = useState(0);
  useEffect(() => { getFlashcards(1000).then(setCards).catch((e) => setError(e?.message || 'We could not load your flashcard library.')); }, []);
  const domains = useMemo(() => ['All', ...new Set(cards.map((card) => card.domain).filter(Boolean))], [cards]);
  const activeCards = useMemo(() => domain === 'All' ? cards : cards.filter((card) => card.domain === domain), [cards, domain]);
  if (!cards.length) return <div><PageHeader title="Flashcards" subtitle="Review key concepts with spaced repetition" /><p>{error || 'Loading your flashcard library…'}</p></div>;
  const current = activeCards[index] || activeCards[0];
  const chooseDomain = (nextDomain) => { setDomain(nextDomain); setIndex(0); setShowBack(false); setMessage(''); };
  const handleNext = () => { setShowBack(false); setIndex((i) => (i + 1) % activeCards.length); };
  const markDifficulty = async (level) => { setMessage(''); try { await saveCloudFlashcardReview(current.id, level); setReviewed((count) => count + 1); setMessage('Review saved.'); handleNext(); } catch (e) { setMessage(e?.message || 'We could not save this review.'); } };
  return <div><PageHeader title="Flashcards" subtitle="Review PMP concepts with spaced repetition" /><div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
    <div className="flashcard-library-summary"><strong>{cards.length.toLocaleString()}</strong> PMP flashcards available<span>Choose a domain or study the complete library.</span></div>
    <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>{domains.map((item) => <button key={item} type="button" onClick={() => chooseDomain(item)} style={{ padding: '.5rem .75rem', borderRadius: '999px', border: '1px solid var(--color-border)', background: domain === item ? 'var(--color-primary)' : 'var(--color-surface)', color: domain === item ? '#fff' : 'var(--color-text)', cursor: 'pointer' }}>{item}</button>)}</div>
    <div onClick={() => setShowBack(!showBack)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setShowBack((visible) => !visible); }} style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '2rem', cursor: 'pointer', minHeight: '150px' }}>
      <p style={{ fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--color-primary)' }}>{current.domain}</p><p style={{ fontSize: '1.25rem', whiteSpace: 'pre-line' }}>{showBack ? current.back : current.front}</p><p style={{ color: 'var(--color-muted)', fontSize: '.9rem' }}>{showBack ? 'Tap to view the question again' : 'Tap the card to reveal the answer'}</p>
    </div>
    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}><button onClick={() => markDifficulty('hard')} className="button-danger">Hard</button><button onClick={() => markDifficulty('medium')} className="button-secondary">Medium</button><button onClick={() => markDifficulty('easy')} className="button-primary">Easy</button></div>
    <p style={{ marginTop: '1rem', color: 'var(--color-muted)' }}>{domain === 'All' ? 'All PMP concepts' : domain} · Card {index + 1} of {activeCards.length.toLocaleString()} · {reviewed} reviewed this session</p>{message && <p role="status" className="form-success">{message}</p>}
  </div></div>;
}
export default Flashcards;
