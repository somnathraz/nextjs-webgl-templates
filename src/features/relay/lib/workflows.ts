export const WORKFLOWS = [
  {
    name: 'Market research',
    prompt: 'Find the signal in a crowded market.',
    steps: [
      'Read the brief',
      'Map the landscape',
      'Compare the evidence',
      'Challenge the findings',
      'Deliver the brief',
    ],
    agents: ['Router', 'Researcher', 'Analyst', 'Reviewer', 'Publisher'],
    result: 'Research brief ready',
    body: 'The simulated team compared three market segments, checked source coverage, and prepared a prioritized opportunity brief.',
    artifact: [
      '01 / Market map — 3 segments',
      '02 / Evidence matrix — 12 sample sources',
      '03 / Recommended direction — specialist workflows',
    ],
  },
  {
    name: 'Release review',
    prompt: 'Give this release a second set of eyes.',
    steps: [
      'Scope the release',
      'Inspect the changes',
      'Run the checks',
      'Review the risks',
      'Prepare the handoff',
    ],
    agents: ['Router', 'Code agent', 'Test agent', 'Reviewer', 'Publisher'],
    result: 'Release review ready',
    body: 'The simulated team inspected the change set, assessed test coverage, and assembled a release checklist for human review.',
    artifact: [
      '01 / Change summary — 8 sample files',
      '02 / Check report — 6 simulated checks',
      '03 / Release checklist — ready for review',
    ],
  },
  {
    name: 'Customer support',
    prompt: 'Turn a complex request into a clear answer.',
    steps: [
      'Understand the request',
      'Search the knowledge base',
      'Draft a response',
      'Check the policy',
      'Prepare the reply',
    ],
    agents: ['Router', 'Researcher', 'Support agent', 'Reviewer', 'Publisher'],
    result: 'Response draft ready',
    body: 'The simulated team located a relevant policy, drafted a response, and flagged it for a person to approve before sending.',
    artifact: [
      '01 / Request summary — account access',
      '02 / Policy reference — sample recovery guide',
      '03 / Reply draft — pending human approval',
    ],
  },
] as const;
export const NODES = [
  {
    name: 'Intent',
    detail:
      'A clear goal enters the system. The router identifies the work and its constraints.',
  },
  {
    name: 'Research',
    detail:
      'A specialist gathers relevant context. Every finding remains attached to its source.',
  },
  {
    name: 'Reason',
    detail: 'The analyst combines evidence into a proposed answer or action.',
  },
  {
    name: 'Review',
    detail:
      'A separate reviewer checks the work before anything leaves the system.',
  },
  {
    name: 'Deliver',
    detail:
      'The result is packaged with its trace, ready for a person to inspect.',
  },
];
