/**
 * Mock data used throughout the LMS to illustrate pages without back‑end
 * connectivity. Replace this with real API calls once a server is available.
 */
export const modules = [
  {
    id: 'people',
    title: 'People Domain',
    description: 'Focuses on team leadership, stakeholder engagement and collaboration.',
    lessons: 12,
    progress: 30
  },
  {
    id: 'process',
    title: 'Process Domain',
    description: 'Covers the project management processes required to deliver value.',
    lessons: 15,
    progress: 60
  },
  {
    id: 'business',
    title: 'Business Environment',
    description: 'Explores the organizational environment and business strategy alignment.',
    lessons: 8,
    progress: 10
  }
];

export const flashcards = [
  { id: 1, front: 'What is a project?', back: 'A temporary endeavor undertaken to create a unique product, service, or result.' },
  { id: 2, front: 'Define stakeholder.', back: 'An individual, group, or organization who may affect or be affected by a decision, activity, or outcome of a project.' },
  { id: 3, front: 'What does EVM stand for?', back: 'Earned Value Management.' }
];

export const sampleQuestions = [
  {
    id: 1,
    text: 'Which document authorizes the project and provides the project manager with authority?',
    options: ['Project Charter', 'Statement of Work', 'Scope Statement', 'Project Plan'],
    correctIndex: 0,
    explanation: 'The project charter is the document that formally authorizes the project.'
  },
  {
    id: 2,
    text: 'What is the formula for Schedule Variance (SV)?',
    options: ['SV = EV - PV', 'SV = PV - EV', 'SV = AC - EV', 'SV = EV / AC'],
    correctIndex: 0,
    explanation: 'Schedule variance equals earned value minus planned value.'
  }
];

export const dashboardStats = {
  examReadiness: 72,
  studyStreak: 5,
  modulesCompleted: 4,
  questionsAnswered: 250,
  flashcardsDue: 12
};

export const pricingPlans = [
  {
    name: 'Trial',
    price: 'Free / 7 Days',
    features: [
      'Limited modules',
      '20 flashcards',
      '25 practice questions',
      'No mock exams',
      'No AI coach'
    ]
  },
  {
    name: 'Standard',
    price: 'NZD 19.90 / 6 Months',
    features: [
      'Full learning modules',
      'Full flashcards',
      'Full question bank',
      'Basic analytics',
      'Certificates'
    ]
  },
  {
    name: 'Premium',
    price: 'NZD 69.90 / 6 Months',
    features: [
      'Everything in Standard',
      'AI Coach',
      'Mock exams',
      'Advanced analytics',
      'Personalized recommendations',
      'Priority support'
    ],
    highlight: true
  }
];

export const adminStats = {
  activeUsers: 1250,
  revenue: 0, // placeholder
  completionRate: 68,
  newRegistrations: 75,
  popularModule: 'Process Domain',
  supportTickets: 3,
  trialUsers: 85,
  premiumUsers: 400
};

export const activities = [
  { id: 1, description: 'Completed People Domain quiz', timestamp: '2026-06-25' },
  { id: 2, description: 'Reviewed flashcards on Cost Management', timestamp: '2026-06-26' },
  { id: 3, description: 'Scored 85% on Practice Questions', timestamp: '2026-06-27' }
];

export const certificates = [
  { id: 1, title: 'People Domain Completion', unlocked: false },
  { id: 2, title: 'Process Domain Completion', unlocked: true },
  { id: 3, title: 'Full Course Completion', unlocked: false }
];

export const analyticsData = {
  readiness: 72,
  domainPerformance: {
    People: 80,
    Process: 65,
    Business: 60
  },
  knowledgeAreas: {
    Scope: 70,
    Schedule: 75,
    Cost: 68,
    Quality: 70,
    Risk: 65
  },
  accuracyTrend: [60, 62, 65, 68, 70, 72],
  studyHours: [2, 1.5, 3, 2.5, 2, 2],
  flashcardRetention: 80,
  strongestTopics: ['Scope', 'Schedule'],
  weakestTopics: ['Risk', 'Cost'],
  recommendations: ['Review Risk Management module', 'Practice Cost questions']
};