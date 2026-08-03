import React, { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';

export default function AICoach() {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  async function askAI() {
    if (!question.trim()) return;

    const userMessage = {
      role: 'user',
      content: question,
    };

    setConversation((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/hello', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question,
        }),
      });

      const data = await response.json();

      setConversation((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || 'No response received.',
        },
      ]);
    } catch (err) {
      setConversation((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to contact AI Coach.',
        },
      ]);
    }

    setQuestion('');
    setLoading(false);
  }

  return (
    <div>
      <PageHeader
        title="AI Coach"
        subtitle="Your personal PMP mentor"
      />

      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 24,
          border: '1px solid #e5e7eb',
        }}
      >
        <h2>🤖 PMP AI Coach</h2>

        <p>
          Ask any PMP, Agile or PMBOK question and receive personalised guidance.
        </p>

        <textarea
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Example: Explain stakeholder engagement using PMI mindset."
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            marginTop: 20,
            marginBottom: 20,
          }}
        />

        <button
          onClick={askAI}
          disabled={loading}
          style={{
            padding: '12px 24px',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          {loading ? 'Thinking...' : 'Ask AI Coach'}
        </button>

        <div style={{ marginTop: 30 }}>
          {conversation.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: 20,
                padding: 15,
                borderRadius: 8,
                background:
                  item.role === 'user'
                    ? '#eef6ff'
                    : '#f9fafb',
              }}
            >
              <strong>
                {item.role === 'user'
                  ? 'You'
                  : 'AI Coach'}
              </strong>

              <p
                style={{
                  whiteSpace: 'pre-wrap',
                  marginTop: 8,
                }}
              >
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
