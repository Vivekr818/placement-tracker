/**
 * PREP — placement roadmap topic trees, keyed by prep mode.
 * Each topic: { id, title, icon, week, priority, subtopics }
 *   priority: 'high' | 'medium' | 'low'
 *   week: number
 *
 * To add a new path: add a key here and a matching entry in PREP_MODES.
 */

// ── Product-Based ─────────────────────────────────────────────────────────────
const product = [
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    icon: '🧩',
    week: 1,
    priority: 'high',
    subtopics: [
      'Arrays & Strings',
      'Linked Lists',
      'Stacks & Queues',
      'Trees & Binary Search Trees',
      'Heaps & Priority Queues',
      'Graphs (BFS, DFS, Dijkstra)',
      'Dynamic Programming',
      'Backtracking',
      'Sorting & Searching',
      'Bit Manipulation',
      'Sliding Window & Two Pointers',
      'Greedy Algorithms',
    ],
  },
  {
    id: 'system-design',
    title: 'System Design',
    icon: '🏗️',
    week: 2,
    priority: 'high',
    subtopics: [
      'Scalability & Load Balancing',
      'Databases: SQL vs NoSQL',
      'Caching (Redis, Memcached)',
      'Message Queues (Kafka, RabbitMQ)',
      'Consistent Hashing',
      'CAP Theorem',
      'Microservices Architecture',
      'API Design (REST, GraphQL)',
      'CDN & Content Delivery',
      'Rate Limiting',
      'Distributed Systems Basics',
      'Design Patterns (LLD)',
    ],
  },
];

const productRest = [
  {
    id: 'cs-fundamentals',
    title: 'CS Fundamentals',
    icon: '💻',
    week: 3,
    priority: 'medium',
    subtopics: [
      'Operating Systems: Processes & Threads',
      'OS: Memory Management & Virtual Memory',
      'OS: Deadlocks & Scheduling',
      'DBMS: Normalization & ACID',
      'DBMS: Indexing & Query Optimization',
      'Networking: TCP/IP & OSI Model',
      'Networking: HTTP/HTTPS & DNS',
      'OOP: SOLID Principles',
      'OOP: Design Patterns',
      'Compiler Design Basics',
    ],
  },
  {
    id: 'coding-practice',
    title: 'Coding Practice',
    icon: '⌨️',
    week: 4,
    priority: 'high',
    subtopics: [
      'LeetCode Easy (50+ problems)',
      'LeetCode Medium (100+ problems)',
      'LeetCode Hard (20+ problems)',
      'Company-specific problem sets',
      'Competitive programming basics',
      'Mock interviews (peer or platform)',
    ],
  },
  {
    id: 'behavioral',
    title: 'Behavioral & HR',
    icon: '🤝',
    week: 5,
    priority: 'low',
    subtopics: [
      'STAR method for answers',
      'Common HR questions',
      'Leadership & teamwork stories',
      'Conflict resolution examples',
      'Career goals articulation',
      'Company research & culture fit',
    ],
  },
];

// ── Service-Based ─────────────────────────────────────────────────────────────
const service = [
  {
    id: 'aptitude',
    title: 'Aptitude & Reasoning',
    icon: '🧮',
    week: 1,
    priority: 'high',
    subtopics: [
      'Quantitative Aptitude: Number Systems',
      'Quantitative Aptitude: Percentages & Ratios',
      'Quantitative Aptitude: Time, Speed & Distance',
      'Quantitative Aptitude: Probability',
      'Logical Reasoning: Syllogisms',
      'Logical Reasoning: Blood Relations',
      'Logical Reasoning: Seating Arrangements',
      'Verbal Ability: Reading Comprehension',
      'Verbal Ability: Grammar & Vocabulary',
      'Data Interpretation',
    ],
  },
  {
    id: 'technical-basics',
    title: 'Technical Basics',
    icon: '⚙️',
    week: 2,
    priority: 'high',
    subtopics: [
      'C Programming Fundamentals',
      'Java / Python Basics',
      'OOP Concepts',
      'Basic Data Structures (Arrays, Linked Lists)',
      'Basic Algorithms (Sorting, Searching)',
      'DBMS Basics',
      'Networking Basics',
      'OS Basics',
      'Software Development Life Cycle',
      'Version Control (Git)',
    ],
  },
  {
    id: 'coding-service',
    title: 'Coding Practice',
    icon: '⌨️',
    week: 3,
    priority: 'medium',
    subtopics: [
      'LeetCode Easy (30+ problems)',
      'LeetCode Medium (30+ problems)',
      'HackerRank practice sets',
      'String manipulation problems',
      'Array and matrix problems',
      'Pattern printing programs',
    ],
  },
  {
    id: 'verbal-communication',
    title: 'Verbal & Communication',
    icon: '🗣️',
    week: 4,
    priority: 'medium',
    subtopics: [
      'Group Discussion techniques',
      'Extempore speaking practice',
      'Email writing etiquette',
      'Technical presentation skills',
      'Active listening skills',
    ],
  },
  {
    id: 'hr-service',
    title: 'HR & Soft Skills',
    icon: '🤝',
    week: 5,
    priority: 'low',
    subtopics: [
      'Resume building & tailoring',
      'Common HR interview questions',
      'STAR method for answers',
      'Company research',
      'Dress code & professional etiquette',
      'Salary negotiation basics',
    ],
  },
];

// ── FAANG ─────────────────────────────────────────────────────────────────────
const faang = [
  {
    id: 'faang-dsa',
    title: 'Advanced DSA',
    icon: '🧩',
    week: 1,
    priority: 'high',
    subtopics: [
      'Hard DP (Knapsack, LCS, Matrix Chain)',
      'Advanced Graph Algorithms (Bellman-Ford, Floyd-Warshall)',
      'Segment Trees & Fenwick Trees',
      'Trie & Suffix Arrays',
      'Union-Find (Disjoint Set)',
      'Monotonic Stack & Deque',
      'Bit Manipulation tricks',
      'Number Theory (GCD, Sieve)',
    ],
  },
  {
    id: 'faang-system-design',
    title: 'Large-Scale System Design',
    icon: '🏗️',
    week: 2,
    priority: 'high',
    subtopics: [
      'Design Twitter / Instagram Feed',
      'Design YouTube / Netflix',
      'Design Uber / Lyft',
      'Design WhatsApp / Slack',
      'Distributed Databases & Sharding',
      'Event-Driven Architecture',
      'Observability: Logging, Metrics, Tracing',
      'Chaos Engineering basics',
    ],
  },
  {
    id: 'faang-lld',
    title: 'Low-Level Design',
    icon: '🔧',
    week: 3,
    priority: 'high',
    subtopics: [
      'SOLID Principles deep dive',
      'Design Patterns (Factory, Observer, Strategy)',
      'Design a Parking Lot',
      'Design a Library Management System',
      'Design an ATM',
      'Design Chess / Snake & Ladder',
      'Clean Code & Refactoring',
    ],
  },
  {
    id: 'faang-behavioral',
    title: 'Leadership Principles',
    icon: '🌟',
    week: 4,
    priority: 'medium',
    subtopics: [
      'Amazon Leadership Principles (all 16)',
      'Google Googleyness & Leadership',
      'Meta Core Values',
      'STAR stories for each principle',
      'Conflict & ambiguity handling',
      'Ownership & bias for action examples',
    ],
  },
  {
    id: 'faang-mock',
    title: 'Mock Interviews',
    icon: '🎯',
    week: 5,
    priority: 'high',
    subtopics: [
      'Pramp / Interviewing.io sessions',
      'Timed LeetCode contests',
      'Blind 75 completion',
      'NeetCode 150 completion',
      'System design mock (45 min)',
      'Behavioral mock (30 min)',
    ],
  },
];

// ── Startup ───────────────────────────────────────────────────────────────────
const startup = [
  {
    id: 'startup-fullstack',
    title: 'Full-Stack Fundamentals',
    icon: '🚀',
    week: 1,
    priority: 'high',
    subtopics: [
      'React / Vue / Angular basics',
      'Node.js & Express',
      'REST API design',
      'SQL & NoSQL databases',
      'Authentication (JWT, OAuth)',
      'Deployment (Vercel, Railway, Render)',
    ],
  },
  {
    id: 'startup-dsa',
    title: 'Practical DSA',
    icon: '🧩',
    week: 2,
    priority: 'high',
    subtopics: [
      'Arrays, Strings, Hash Maps',
      'Trees & Recursion',
      'Sorting & Binary Search',
      'LeetCode Easy + Medium (60+ problems)',
      'Take-home assignment patterns',
    ],
  },
  {
    id: 'startup-product',
    title: 'Product Thinking',
    icon: '💡',
    week: 3,
    priority: 'medium',
    subtopics: [
      'Product metrics (DAU, retention, churn)',
      'User story writing',
      'A/B testing basics',
      'Agile & sprint planning',
      'Reading product case studies',
    ],
  },
  {
    id: 'startup-projects',
    title: 'Portfolio Projects',
    icon: '🛠️',
    week: 4,
    priority: 'high',
    subtopics: [
      'Build 2–3 end-to-end projects',
      'Open source contributions',
      'GitHub profile polish',
      'README & documentation',
      'Demo video / live deployment',
    ],
  },
  {
    id: 'startup-culture',
    title: 'Startup Culture Fit',
    icon: '🤝',
    week: 5,
    priority: 'low',
    subtopics: [
      'Why startups? Motivation story',
      'Comfort with ambiguity examples',
      'Fast iteration & ownership mindset',
      'Salary vs equity trade-off awareness',
      'Research the startup (product, funding, team)',
    ],
  },
];

// ── Internship ────────────────────────────────────────────────────────────────
const internship = [
  {
    id: 'intern-dsa',
    title: 'Core DSA (Intern Level)',
    icon: '🧩',
    week: 1,
    priority: 'high',
    subtopics: [
      'Arrays, Strings, Hash Maps',
      'Linked Lists & Stacks',
      'Basic Trees & Recursion',
      'Sorting algorithms',
      'LeetCode Easy (40+ problems)',
      'LeetCode Medium (20+ problems)',
    ],
  },
  {
    id: 'intern-lang',
    title: 'Language Proficiency',
    icon: '💻',
    week: 2,
    priority: 'high',
    subtopics: [
      'Python or Java fluency',
      'OOP concepts & practice',
      'Standard library usage',
      'File I/O & error handling',
      'Unit testing basics',
    ],
  },
  {
    id: 'intern-web',
    title: 'Web / Tech Basics',
    icon: '🌐',
    week: 3,
    priority: 'medium',
    subtopics: [
      'HTML, CSS, JavaScript basics',
      'How the web works (HTTP, DNS)',
      'REST APIs & JSON',
      'Git & GitHub workflow',
      'Basic SQL queries',
    ],
  },
  {
    id: 'intern-projects',
    title: 'Academic Projects',
    icon: '🛠️',
    week: 4,
    priority: 'medium',
    subtopics: [
      'Highlight 1–2 strong projects',
      'Explain tech stack choices',
      'Quantify impact where possible',
      'GitHub repo cleanup',
      'Prepare 2-min project pitch',
    ],
  },
  {
    id: 'intern-hr',
    title: 'HR & Basics',
    icon: '🤝',
    week: 5,
    priority: 'low',
    subtopics: [
      'Why this company / role?',
      'Tell me about yourself (60 sec)',
      'Strengths & weaknesses',
      'Internship goals & learning mindset',
      'Professional email etiquette',
    ],
  },
];

// ── Exports ───────────────────────────────────────────────────────────────────

/** All roadmap data keyed by prepType id */
export const PREP = {
  product:    [...product, ...productRest],
  service,
  faang,
  startup,
  internship,
};

/**
 * Tab config — drives the tab bar in StudyPath.
 * Add a new entry here (+ a matching key in PREP) to add a new path.
 */
export const PREP_MODES = [
  { id: 'product',    label: 'Product',    emoji: '📦' },
  { id: 'service',    label: 'Service',    emoji: '⚙️' },
  { id: 'faang',      label: 'FAANG',      emoji: '🌟' },
  { id: 'startup',    label: 'Startup',    emoji: '🚀' },
  { id: 'internship', label: 'Internship', emoji: '🎓' },
];
