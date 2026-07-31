import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import UpgradeGate from '../components/UpgradeGate.jsx';
import { getQuestions, getLearnerEntitlement } from '../services/contentService.js';

const titleCaseDomain = (domain) => (domain || 'general_pmp').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const PAGE_SIZE = 24;

function QuestionBank() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('all');
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [entitlement, setEntitlement] = useState(null);
  const [entitlementLoading, setEntitlementLoading] = useState(true);

  useEffect(() => {
    getLearnerEntitlement()
      .then(setEntitlement)
      .catch(() => setEntitlement(null))
      .finally(() => setEntitlementLoading(false));
  }, []);

  useEffect(() => {
    if (entitlement && !entitlement.questionBankEnabled) return;
    getQuestions(2100).then(setQuestions).catch(() => setError('The question bank could not be loaded. Please try again shortly.'));
  }, [entitlement]);

  const domains = useMemo(() => [...new Set(questions.map((item) => item.domain).filter(Boolean))], [questions]);
  const filtered = questions.filter((question) =>
    (domain === 'all' || question.domain === domain) && question.text.toLowerCase().includes(query.trim().toLowerCase())
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleQuestions = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const updateQuery = (value) => { setQuery(value); setPage(0); };
  const updateDomain = (value) => { setDomain(value); setPage(0); };

  if (entitlementLoading) return <div><PageHeader title="Question Bank" subtitle="Loading your practice questions" /><p className="route-status">Checking your plan…</p></div>;

  if (entitlement && !entitlement.questionBankEnabled) {
    return <div>
      <PageHeader title="Question Bank" subtitle="Search and practice PMP questions by domain" />
      <UpgradeGate
        feature="Question Bank"
        requiredTier="Standard"
        currentTier={entitlement.tier}
        description="Full access to the searchable PMP question bank, filterable by domain, is included from the Standard plan up."
      />
    </div>;
  }

  return (
    <div>
      <PageHeader title="Question Bank" subtitle={questions.length ? `${questions.length} approved practice questions` : 'Loading your practice questions'} />
      {error && <p role="alert" className="form-error">{error}</p>}
      {!error && <div className="question-bank-toolbar">
        <input className="field-control search-field" type="search" aria-label="Search questions" placeholder="Search the PMP question bank" value={query} onChange={(event) => updateQuery(event.target.value)} />
        <select className="field-control select-field" aria-label="Filter by domain" value={domain} onChange={(event) => updateDomain(event.target.value)}>
          <option value="all">All domains</option>
          {domains.map((item) => <option key={item} value={item}>{titleCaseDomain(item)}</option>)}
        </select>
      </div>}
      {!error && !questions.length && <p>Loading approved questions…</p>}
      <div className="question-bank-meta"><span>{filtered.length.toLocaleString()} question{filtered.length === 1 ? '' : 's'} available</span><span>{domain === 'all' ? 'All PMP domains' : titleCaseDomain(domain)}</span></div>
      <ul className="question-list">
        {visibleQuestions.map((question) => (
          <li className="question-list-card" key={question.id}>
            <div><p>{question.text}</p><span className="domain-pill">{titleCaseDomain(question.domain)}</span></div>
            <button className="button-primary" type="button" onClick={() => navigate('/quiz', { state: { questionId: question.id } })}>Practice</button>
          </li>
        ))}
        {questions.length > 0 && filtered.length === 0 && <li>No questions match your search.</li>}
      </ul>
      {filtered.length > PAGE_SIZE && <nav className="question-bank-pagination" aria-label="Question bank pages"><button className="button-secondary" type="button" disabled={currentPage === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>Previous</button><span>Page {currentPage + 1} of {pageCount}</span><button className="button-secondary" type="button" disabled={currentPage + 1 >= pageCount} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}>Next</button></nav>}
    </div>
  );
}

export default QuestionBank;
