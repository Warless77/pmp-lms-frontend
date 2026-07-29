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
  // People
  { id: 'people-01', domain: 'People', front: 'What is a project?', back: 'A temporary endeavour undertaken to create a unique product, service, or result.' },
  { id: 'people-02', domain: 'People', front: 'Who is a stakeholder?', back: 'An individual, group, or organisation that may affect, be affected by, or perceive itself to be affected by a project decision, activity, or outcome.' },
  { id: 'people-03', domain: 'People', front: 'What is emotional intelligence?', back: 'The ability to recognise, understand, and manage your own emotions and respond effectively to the emotions of others.' },
  { id: 'people-04', domain: 'People', front: 'What should a project manager do first when team conflict occurs?', back: 'Understand the source of the conflict and facilitate direct, respectful discussion before choosing a resolution approach.' },
  { id: 'people-05', domain: 'People', front: 'What is servant leadership?', back: 'A leadership approach that puts the needs, growth, and success of the team first, helping people perform at their best.' },
  { id: 'people-06', domain: 'People', front: 'What is a ground rule?', back: 'An agreed expectation for team behaviour, communication, decision-making, or collaboration.' },
  { id: 'people-07', domain: 'People', front: 'What is a RACI matrix used for?', back: 'Clarifying who is Responsible, Accountable, Consulted, and Informed for project work or decisions.' },
  { id: 'people-08', domain: 'People', front: 'What is active listening?', back: 'Giving full attention, clarifying what was said, reflecting understanding, and responding without prematurely judging.' },
  { id: 'people-09', domain: 'People', front: 'What does a high-performing team need?', back: 'Clear purpose, trust, appropriate skills, shared accountability, constructive conflict, and continuous improvement.' },
  { id: 'people-10', domain: 'People', front: 'What is stakeholder engagement?', back: 'Working with stakeholders to understand their needs, manage expectations, and encourage appropriate involvement and support.' },
  { id: 'people-11', domain: 'People', front: 'What is coaching?', back: 'Helping another person improve performance and capability by asking questions, providing feedback, and supporting their own solutions.' },
  { id: 'people-12', domain: 'People', front: 'What is mentoring?', back: 'Providing guidance based on experience to support another person’s longer-term development.' },
  { id: 'people-13', domain: 'People', front: 'What is a team charter?', back: 'A document that establishes team values, operating agreements, communication methods, and decision-making expectations.' },
  { id: 'people-14', domain: 'People', front: 'What is psychological safety?', back: 'A shared belief that people can speak up, ask questions, admit mistakes, and raise concerns without fear of humiliation or punishment.' },
  { id: 'people-15', domain: 'People', front: 'What is the most effective response to resistance to change?', back: 'Listen to concerns, explain the reason and benefits of the change, involve affected people, and provide support.' },
  { id: 'people-16', domain: 'People', front: 'What does “manage by walking around” support?', back: 'Visible leadership, informal communication, early issue discovery, relationship building, and timely support.' },
  { id: 'people-17', domain: 'People', front: 'What is conflict avoidance?', back: 'Deliberately withdrawing from or postponing a conflict; it can be useful temporarily but does not solve the underlying issue.' },
  { id: 'people-18', domain: 'People', front: 'When is collaboration the best conflict approach?', back: 'When the issue is important, multiple viewpoints are needed, and there is time to find a solution that satisfies all parties.' },

  // Process
  { id: 'process-01', domain: 'Process', front: 'What does EVM stand for?', back: 'Earned Value Management: a method that integrates scope, schedule, and cost to measure project performance.' },
  { id: 'process-02', domain: 'Process', front: 'What is the formula for Schedule Variance (SV)?', back: 'SV = EV − PV. A negative value means the project is behind schedule; a positive value means it is ahead.' },
  { id: 'process-03', domain: 'Process', front: 'What is the formula for Cost Variance (CV)?', back: 'CV = EV − AC. A negative value means over budget; a positive value means under budget.' },
  { id: 'process-04', domain: 'Process', front: 'What does CPI measure?', back: 'Cost Performance Index: CPI = EV ÷ AC. A CPI below 1.0 indicates cost inefficiency.' },
  { id: 'process-05', domain: 'Process', front: 'What does SPI measure?', back: 'Schedule Performance Index: SPI = EV ÷ PV. An SPI below 1.0 indicates schedule delay.' },
  { id: 'process-06', domain: 'Process', front: 'What is the project charter?', back: 'The document that formally authorises the project and gives the project manager authority to use organisational resources.' },
  { id: 'process-07', domain: 'Process', front: 'What is a WBS?', back: 'A Work Breakdown Structure: a hierarchical decomposition of the total project scope into manageable deliverables and work packages.' },
  { id: 'process-08', domain: 'Process', front: 'What is the critical path?', back: 'The longest path through the schedule network; it determines the shortest possible project duration.' },
  { id: 'process-09', domain: 'Process', front: 'What is float?', back: 'The amount of time a scheduled activity can be delayed without delaying a specified milestone or the project finish date.' },
  { id: 'process-10', domain: 'Process', front: 'What is a risk?', back: 'An uncertain event or condition that, if it occurs, has a positive or negative effect on one or more project objectives.' },
  { id: 'process-11', domain: 'Process', front: 'What is an issue?', back: 'A current problem or condition that has already happened and requires action.' },
  { id: 'process-12', domain: 'Process', front: 'What is a risk register?', back: 'A document that records identified risks, analysis, owners, planned responses, and monitoring information.' },
  { id: 'process-13', domain: 'Process', front: 'What is integrated change control?', back: 'The formal process of reviewing change requests, approving or rejecting them, and managing their impact across the project.' },
  { id: 'process-14', domain: 'Process', front: 'What is a change request?', back: 'A formal proposal to modify a document, deliverable, baseline, or another component of the project.' },
  { id: 'process-15', domain: 'Process', front: 'What is quality assurance?', back: 'A process-focused activity that evaluates whether project processes are appropriate and effective at preventing defects.' },
  { id: 'process-16', domain: 'Process', front: 'What is quality control?', back: 'A product-focused activity that checks deliverables against requirements and identifies defects or non-conformance.' },
  { id: 'process-17', domain: 'Process', front: 'What is acceptance criteria?', back: 'The conditions that a deliverable must meet before it can be formally accepted by the customer or authorised stakeholder.' },
  { id: 'process-18', domain: 'Process', front: 'What is a lessons-learned register?', back: 'A record of knowledge, experiences, improvements, and recommendations collected throughout the project.' },

  // Business environment
  { id: 'business-01', domain: 'Business Environment', front: 'What is business value?', back: 'The net measurable benefit that an organisation receives from an initiative, product, service, or result.' },
  { id: 'business-02', domain: 'Business Environment', front: 'What is a benefits management plan?', back: 'A plan describing how and when project benefits will be delivered, measured, transitioned, and sustained.' },
  { id: 'business-03', domain: 'Business Environment', front: 'What is a benefits realisation plan?', back: 'A documented approach for ensuring intended benefits are achieved and remain aligned to strategic objectives.' },
  { id: 'business-04', domain: 'Business Environment', front: 'What is compliance?', back: 'Conforming to applicable laws, regulations, standards, policies, contracts, and organisational requirements.' },
  { id: 'business-05', domain: 'Business Environment', front: 'What is organisational change management?', back: 'The structured approach to preparing, supporting, and helping people adopt changes needed to realise project benefits.' },
  { id: 'business-06', domain: 'Business Environment', front: 'What is a business case?', back: 'A documented economic justification for a project, describing the need, options, benefits, costs, risks, and expected value.' },
  { id: 'business-07', domain: 'Business Environment', front: 'What is governance?', back: 'The framework of decision rights, oversight, policies, and controls used to direct and monitor an organisation or project.' },
  { id: 'business-08', domain: 'Business Environment', front: 'Why should a project manager understand organisational strategy?', back: 'To ensure project decisions, priorities, and benefits remain aligned with the organisation’s strategic objectives.' },
  { id: 'business-09', domain: 'Business Environment', front: 'What is a regulatory requirement?', back: 'A legally binding obligation imposed by a government or authorised regulatory body.' },
  { id: 'business-10', domain: 'Business Environment', front: 'What is a market condition?', back: 'An external economic, competitive, customer, or industry factor that can affect a project’s viability or direction.' },
  { id: 'business-11', domain: 'Business Environment', front: 'What is a project phase gate?', back: 'A formal review point where authorised decision-makers evaluate performance and decide whether to continue, change, pause, or stop work.' },
  { id: 'business-12', domain: 'Business Environment', front: 'What is a product roadmap?', back: 'A high-level visual plan that communicates a product’s direction, priorities, and intended releases over time.' },
  { id: 'business-13', domain: 'Business Environment', front: 'What is value delivery?', back: 'The ongoing process of creating benefits that meet stakeholder needs and support organisational strategy.' },
  { id: 'business-14', domain: 'Business Environment', front: 'What is a sustainability consideration?', back: 'The environmental, social, and economic impact of a project, product, or decision over its lifecycle.' },
  { id: 'business-15', domain: 'Business Environment', front: 'What is a procurement contract?', back: 'A mutually binding agreement that obligates the seller to provide specified products, services, or results and the buyer to provide consideration.' },
  { id: 'business-16', domain: 'Business Environment', front: 'What is an assumption?', back: 'A factor believed to be true for planning purposes, without proof or certainty; it should be monitored because it can create risk.' },
  { id: 'business-17', domain: 'Business Environment', front: 'What is a constraint?', back: 'A limiting factor that affects project execution, such as scope, schedule, cost, quality, resources, or risk.' },
  { id: 'business-18', domain: 'Business Environment', front: 'What should happen at project closure?', back: 'Obtain formal acceptance, transition deliverables and benefits ownership, close contracts, release resources, and capture lessons learned.' }
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
