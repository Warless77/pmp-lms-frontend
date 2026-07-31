import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getLearnerEntitlement } from '../services/contentService.js';

const EntitlementContext = createContext(null);

const noAccess = {
  tier: 'none', expiresAt: null, flashcardLimit: 0, practiceLimit: 0, practiceUsed: 0, practiceRemaining: 0,
  questionBankEnabled: false, mockExamEnabled: false, aiCoachEnabled: false,
  modulesEnabled: false, analyticsEnabled: false, certificatesEnabled: false
};

export function EntitlementProvider({ children }) {
  const [entitlement, setEntitlement] = useState(noAccess);
  const [loading, setLoading] = useState(true);

  const refreshEntitlement = useCallback(async () => {
    setLoading(true);
    try { setEntitlement(await getLearnerEntitlement()); }
    catch { setEntitlement(noAccess); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refreshEntitlement(); }, [refreshEntitlement]);

  const can = useCallback((feature) => {
    const rules = {
      modules: entitlement.modulesEnabled,
      flashcards: entitlement.flashcardLimit > 0,
      practice: entitlement.practiceLimit === null || entitlement.practiceRemaining > 0,
      questions: entitlement.questionBankEnabled,
      mockExam: entitlement.mockExamEnabled,
      analytics: entitlement.analyticsEnabled,
      certificates: entitlement.certificatesEnabled,
      aiCoach: entitlement.aiCoachEnabled
    };
    return Boolean(rules[feature]);
  }, [entitlement]);

  const value = useMemo(() => ({ entitlement, loading, refreshEntitlement, can }), [entitlement, loading, refreshEntitlement, can]);
  return <EntitlementContext.Provider value={value}>{children}</EntitlementContext.Provider>;
}

export function useEntitlement() {
  const value = useContext(EntitlementContext);
  if (!value) throw new Error('useEntitlement must be used inside EntitlementProvider');
  return value;
}
