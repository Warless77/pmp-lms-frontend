import React from 'react';

/**
 * QuestionNavigator shows numbered buttons for navigating between questions in a
 * quiz or mock exam. Accepts total count and current index and a callback.
 */
function QuestionNavigator({ total, current, answered = [], onSelect }) {
  return (
    <aside className="surface-card exam-navigator" aria-label="Question navigation">
      <div className="navigator-header"><h3>Question map</h3><span>{answered.length} answered</span></div>
      <div className="navigator-legend"><span><i className="legend-dot current" />Current</span><span><i className="legend-dot answered" />Answered</span><span><i className="legend-dot" />Unanswered</span></div>
      <div className="navigator-grid">
      {Array.from({ length: total }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idx)}
          className={`navigator-button ${idx === current ? 'current' : answered.includes(idx) ? 'answered' : ''}`}
        >
          {idx + 1}
        </button>
      ))}
      </div>
    </aside>
  );
}

export default QuestionNavigator;
