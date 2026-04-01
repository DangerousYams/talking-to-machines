export interface PersonalSoftwareExample {
  id: string;
  idea: string;
  description: string;
  builder: string;
  builderType: string;
  domain: 'school' | 'creative' | 'sports' | 'music' | 'productivity' | 'social' | 'science' | 'money';
  stackIcons: { name: string; emoji: string }[];
  feasibility: 'weekend' | 'week' | 'month';
}

export const personalSoftwareGallery: PersonalSoftwareExample[] = [
  {
    id: 'flashcard-gen',
    idea: 'AI Flashcard Generator',
    description: 'Paste your class notes, get study flashcards with spaced repetition scheduling.',
    builder: 'Maya, 16',
    builderType: 'High school student',
    domain: 'school',
    stackIcons: [
      { name: 'Web App', emoji: '🌐' },
      { name: 'AI', emoji: '🤖' },
      { name: 'Database', emoji: '💾' },
    ],
    feasibility: 'weekend',
  },
  {
    id: 'setlist-optimizer',
    idea: 'Setlist Optimizer',
    description: 'Analyzes your song catalog and builds setlists based on energy flow, key changes, and crowd mood.',
    builder: 'Jordan, 28',
    builderType: 'Gigging musician',
    domain: 'music',
    stackIcons: [
      { name: 'Web App', emoji: '🌐' },
      { name: 'AI', emoji: '🤖' },
      { name: 'Spotify API', emoji: '🎵' },
    ],
    feasibility: 'week',
  },
  {
    id: 'practice-tracker',
    idea: 'Practice Session Logger',
    description: 'Track basketball drills, log shooting percentages, and get AI coaching tips based on your patterns.',
    builder: 'DeShawn, 15',
    builderType: 'JV basketball player',
    domain: 'sports',
    stackIcons: [
      { name: 'Mobile Web', emoji: '📱' },
      { name: 'AI', emoji: '🤖' },
      { name: 'Charts', emoji: '📊' },
    ],
    feasibility: 'weekend',
  },
  {
    id: 'recipe-scaler',
    idea: 'Recipe Scaler & Substituter',
    description: 'Scale any recipe to any number of servings, with automatic ingredient substitutions for allergies.',
    builder: 'Priya, 34',
    builderType: 'Home cook',
    domain: 'productivity',
    stackIcons: [
      { name: 'Web App', emoji: '🌐' },
      { name: 'AI', emoji: '🤖' },
    ],
    feasibility: 'weekend',
  },
  {
    id: 'dnd-npc-gen',
    idea: 'D&D NPC Generator',
    description: 'Generate NPCs with backstories, voice descriptions, and plot hooks that fit your campaign world.',
    builder: 'Alex, 17',
    builderType: 'Dungeon master',
    domain: 'creative',
    stackIcons: [
      { name: 'Web App', emoji: '🌐' },
      { name: 'AI', emoji: '🤖' },
      { name: 'Database', emoji: '💾' },
    ],
    feasibility: 'weekend',
  },
  {
    id: 'grade-tracker',
    idea: 'GPA Scenario Planner',
    description: 'Enter your current grades, then simulate "what if I get a B+ in chemistry?" to see your GPA change.',
    builder: 'Sophie, 16',
    builderType: 'College-bound junior',
    domain: 'school',
    stackIcons: [
      { name: 'Web App', emoji: '🌐' },
      { name: 'Calculator', emoji: '🧮' },
    ],
    feasibility: 'weekend',
  },
  {
    id: 'band-poster',
    idea: 'Show Poster Generator',
    description: 'Type your band name, venue, and date. Get a printable poster in your band\'s visual style.',
    builder: 'Marcus, 22',
    builderType: 'Indie band guitarist',
    domain: 'creative',
    stackIcons: [
      { name: 'Web App', emoji: '🌐' },
      { name: 'AI Images', emoji: '🎨' },
      { name: 'PDF Export', emoji: '📄' },
    ],
    feasibility: 'week',
  },
  {
    id: 'split-tracker',
    idea: 'Friend Expense Splitter',
    description: 'Track who owes what across multiple hangouts. Settles debts with minimum transactions.',
    builder: 'Kai, 19',
    builderType: 'College sophomore',
    domain: 'money',
    stackIcons: [
      { name: 'Mobile Web', emoji: '📱' },
      { name: 'Database', emoji: '💾' },
      { name: 'Math', emoji: '🧮' },
    ],
    feasibility: 'weekend',
  },
  {
    id: 'plant-care',
    idea: 'Plant Care Reminder',
    description: 'Identify plants from photos, get custom watering schedules, and log growth over time.',
    builder: 'Lily, 27',
    builderType: 'Plant parent',
    domain: 'productivity',
    stackIcons: [
      { name: 'Mobile Web', emoji: '📱' },
      { name: 'AI Vision', emoji: '👁️' },
      { name: 'Notifications', emoji: '🔔' },
    ],
    feasibility: 'week',
  },
  {
    id: 'debate-prep',
    idea: 'Debate Case Builder',
    description: 'Enter a resolution and side. Get structured arguments, evidence summaries, and counterargument prep.',
    builder: 'Anika, 16',
    builderType: 'Debate team captain',
    domain: 'school',
    stackIcons: [
      { name: 'Web App', emoji: '🌐' },
      { name: 'AI', emoji: '🤖' },
      { name: 'Research', emoji: '🔍' },
    ],
    feasibility: 'week',
  },
  {
    id: 'workout-gen',
    idea: 'Custom Workout Generator',
    description: 'Tell it your equipment and time limit. Get a workout plan with rest timers and exercise demos.',
    builder: 'Tyler, 20',
    builderType: 'Fitness enthusiast',
    domain: 'sports',
    stackIcons: [
      { name: 'Mobile Web', emoji: '📱' },
      { name: 'AI', emoji: '🤖' },
      { name: 'Timer', emoji: '⏱️' },
    ],
    feasibility: 'weekend',
  },
  {
    id: 'lyric-notebook',
    idea: 'Lyric Writing Notebook',
    description: 'Write lyrics with AI suggestions for rhymes, syllable matching, and mood-based vocabulary.',
    builder: 'Zoe, 18',
    builderType: 'Singer-songwriter',
    domain: 'music',
    stackIcons: [
      { name: 'Web App', emoji: '🌐' },
      { name: 'AI', emoji: '🤖' },
      { name: 'Rhyme Engine', emoji: '🎤' },
    ],
    feasibility: 'week',
  },
  {
    id: 'stargazing',
    idea: 'Tonight\'s Sky Guide',
    description: 'Enter your location and get a personalized stargazing guide: what\'s visible, when to look, where to point.',
    builder: 'Raj, 14',
    builderType: 'Amateur astronomer',
    domain: 'science',
    stackIcons: [
      { name: 'Web App', emoji: '🌐' },
      { name: 'Astronomy API', emoji: '🌟' },
      { name: 'Maps', emoji: '🗺️' },
    ],
    feasibility: 'week',
  },
  {
    id: 'group-poll',
    idea: 'Quick Group Decision Maker',
    description: 'Create instant polls with ranked-choice voting. Share a link, get a decision in minutes.',
    builder: 'Sam, 21',
    builderType: 'Friend group organizer',
    domain: 'social',
    stackIcons: [
      { name: 'Web App', emoji: '🌐' },
      { name: 'Real-time', emoji: '⚡' },
      { name: 'Share Links', emoji: '🔗' },
    ],
    feasibility: 'weekend',
  },
  {
    id: 'portfolio-site',
    idea: 'Art Portfolio Builder',
    description: 'Upload your artwork, choose a layout style, and get a polished portfolio website ready to share.',
    builder: 'Nina, 17',
    builderType: 'Art student',
    domain: 'creative',
    stackIcons: [
      { name: 'Website', emoji: '🌐' },
      { name: 'Image Gallery', emoji: '🖼️' },
      { name: 'Hosting', emoji: '☁️' },
    ],
    feasibility: 'weekend',
  },
];

export const domains = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'school', label: 'School', emoji: '📚' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
  { id: 'sports', label: 'Sports', emoji: '🏀' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'productivity', label: 'Life', emoji: '⚡' },
  { id: 'social', label: 'Social', emoji: '👋' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'money', label: 'Money', emoji: '💰' },
] as const;
