import React from 'react';

/**
 * Preview card for a flashcard deck or single card. Accepts a `card` object
 * with front text and optional back text or count. This is a simplified
 * component used on dashboard and lists; the full flashcard interaction
 * lives on the Flashcards page.
 */
function FlashcardPreview({ card }) {
  return (
    <div className="flashcard-preview">
      <p>{card.front}</p>{card.back && <p style={{ color: 'var(--color-muted)', fontSize: '.82rem', marginBottom: 0 }}>{card.back}</p>}
    </div>
  );
}

export default FlashcardPreview;
