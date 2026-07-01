import React from 'react';

/**
 * Preview card for a flashcard deck or single card. Accepts a `card` object
 * with front text and optional back text or count. This is a simplified
 * component used on dashboard and lists; the full flashcard interaction
 * lives on the Flashcards page.
 */
function FlashcardPreview({ card }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', flex: 1 }}>
      <p style={{ fontWeight: 600 }}>{card.front}</p>
      {card.back && <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>{card.back}</p>}
    </div>
  );
}

export default FlashcardPreview;