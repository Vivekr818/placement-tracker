/**
 * TASK_POOLS — categorised task pool arrays.
 * regenTasks() samples one task per pool, assigning a fresh generateId() to each.
 * Each pool: { tag: string, color: string, tasks: string[] }
 */
export const TASK_POOLS = [
  {
    tag: 'DSA',
    color: '#6366f1',
    tasks: [
      'Solve 2 LeetCode medium problems',
      'Revise binary search patterns',
      'Practice sliding window problems',
      'Solve 1 LeetCode hard problem',
      'Revise dynamic programming basics',
      'Practice graph traversal (BFS/DFS)',
      'Solve 3 LeetCode easy problems',
      'Revise tree traversal algorithms',
      'Practice two-pointer technique',
      'Revise heap and priority queue usage',
    ],
  },
  {
    tag: 'System Design',
    color: '#0ea5e9',
    tasks: [
      'Read one system design article',
      'Design a URL shortener on paper',
      'Study CAP theorem and trade-offs',
      'Design a rate limiter system',
      'Read about consistent hashing',
      'Study database indexing strategies',
      'Design a notification service',
      'Read about message queues (Kafka/RabbitMQ)',
      'Study load balancing strategies',
      'Design a distributed cache',
    ],
  },
  {
    tag: 'Aptitude',
    color: '#f59e0b',
    tasks: [
      'Solve 10 quantitative aptitude questions',
      'Practice logical reasoning puzzles',
      'Solve 10 verbal ability questions',
      'Practice data interpretation sets',
      'Solve 5 number series problems',
      'Practice time and work problems',
      'Solve 5 probability questions',
      'Practice permutation and combination',
      'Solve 10 coding aptitude questions',
      'Practice blood relation problems',
    ],
  },
  {
    tag: 'Core CS',
    color: '#10b981',
    tasks: [
      'Revise OS concepts: scheduling algorithms',
      'Study DBMS: normalization forms',
      'Revise networking: TCP/IP model',
      'Study OOPS: SOLID principles',
      'Revise OS: memory management',
      'Study DBMS: transaction and ACID',
      'Revise networking: HTTP vs HTTPS',
      'Study compiler design basics',
      'Revise OS: deadlock conditions',
      'Study DBMS: indexing and query optimization',
    ],
  },
  {
    tag: 'HR Prep',
    color: '#ec4899',
    tasks: [
      'Prepare answer for "Tell me about yourself"',
      'Write down 3 strengths with examples',
      'Prepare answer for "Why this company?"',
      'Write down 2 weaknesses with improvement plans',
      'Prepare a STAR story for a challenge you overcame',
      'Research one target company thoroughly',
      'Prepare answer for "Where do you see yourself in 5 years?"',
      'Practice salary negotiation talking points',
      'Prepare questions to ask the interviewer',
      'Review your resume and prepare for every bullet point',
    ],
  },
];
