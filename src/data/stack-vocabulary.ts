export interface StackLayer {
  id: string;
  name: string;
  emoji: string;
  color: string;
  tagline: string;
  description: string;
  analogy: string;
  nouns: { term: string; explanation: string; examples: string[] }[];
  verbs: { term: string; explanation: string }[];
}

export const stackLayers: StackLayer[] = [
  {
    id: 'frontend',
    name: 'Frontend',
    emoji: '🖥️',
    color: '#7B61FF',
    tagline: 'What people see and touch',
    description: 'The frontend is everything a user interacts with — buttons, text, images, forms, animations. It runs in the browser on the user\'s device.',
    analogy: 'Think of a restaurant. The frontend is the dining room — the menu, the tables, the decor. It\'s what customers experience.',
    nouns: [
      { term: 'Component', explanation: 'A reusable piece of the interface, like a button or a card.', examples: ['React', 'Vue', 'Svelte'] },
      { term: 'Page', explanation: 'A single screen or view in your app.', examples: ['Home page', 'Settings page', 'Profile page'] },
      { term: 'Style', explanation: 'How things look — colors, fonts, spacing, layout.', examples: ['CSS', 'Tailwind', 'Sass'] },
      { term: 'State', explanation: 'Data that can change — like whether a menu is open or a form field is filled.', examples: ['Dark mode on/off', 'Item count in cart', 'Current tab'] },
    ],
    verbs: [
      { term: 'Render', explanation: 'Display something on screen. When a page renders, it becomes visible.' },
      { term: 'Navigate', explanation: 'Move from one page to another.' },
      { term: 'Handle events', explanation: 'React to user actions like clicks, typing, or scrolling.' },
    ],
  },
  {
    id: 'backend',
    name: 'Backend',
    emoji: '⚙️',
    color: '#0F3460',
    tagline: 'The logic behind the scenes',
    description: 'The backend is the server-side code that processes requests, applies business logic, and communicates with the database. Users never see it directly.',
    analogy: 'The backend is the kitchen. Orders come in, the kitchen prepares them, and sends out the finished dish. Customers don\'t see the kitchen, but nothing works without it.',
    nouns: [
      { term: 'Server', explanation: 'A computer that listens for requests and sends back responses.', examples: ['Node.js', 'Python/Flask', 'Go'] },
      { term: 'API', explanation: 'A set of rules for how the frontend talks to the backend. Like a waiter taking orders.', examples: ['REST API', 'GraphQL', 'tRPC'] },
      { term: 'Endpoint', explanation: 'A specific URL the frontend can call to get or send data.', examples: ['/api/users', '/api/login', '/api/posts'] },
      { term: 'Authentication', explanation: 'Verifying who a user is — login systems, passwords, sessions.', examples: ['JWT tokens', 'OAuth', 'Cookies'] },
    ],
    verbs: [
      { term: 'Fetch', explanation: 'Request data from the backend. "The app fetches your profile from the server."' },
      { term: 'Process', explanation: 'Apply logic to data — calculate, validate, transform.' },
      { term: 'Authorize', explanation: 'Check if a user has permission to do something.' },
    ],
  },
  {
    id: 'database',
    name: 'Database',
    emoji: '💾',
    color: '#16C79A',
    tagline: 'Where your app remembers things',
    description: 'The database stores all the persistent data — user accounts, posts, settings, anything that needs to survive a page refresh or server restart.',
    analogy: 'The database is the pantry and the recipe book. It stores all the ingredients (data) and keeps them organized so the kitchen (backend) can find them fast.',
    nouns: [
      { term: 'Table', explanation: 'A structured collection of data, like a spreadsheet. Each row is a record.', examples: ['Users table', 'Posts table', 'Orders table'] },
      { term: 'Schema', explanation: 'The blueprint for your data — what fields exist and what type of data each holds.', examples: ['name: text', 'age: number', 'created_at: date'] },
      { term: 'Query', explanation: 'A request to find, add, update, or delete data in the database.', examples: ['SELECT * FROM users', 'INSERT INTO posts', 'DELETE FROM comments'] },
      { term: 'Migration', explanation: 'A change to your database structure — like adding a new column to a table.', examples: ['Add email field', 'Create orders table', 'Remove old column'] },
    ],
    verbs: [
      { term: 'Store', explanation: 'Save data so it persists. "Store the user\'s preferences in the database."' },
      { term: 'Query', explanation: 'Ask the database for specific data. "Query all users who signed up today."' },
      { term: 'Migrate', explanation: 'Update the database structure without losing existing data.' },
    ],
  },
  {
    id: 'deployment',
    name: 'Deployment',
    emoji: '🚀',
    color: '#E94560',
    tagline: 'How it gets on the internet',
    description: 'Deployment is the process of taking your app from your computer and putting it on the internet where anyone can use it. It includes hosting, domains, and keeping things running.',
    analogy: 'Deployment is opening the restaurant. You\'ve built the dining room, hired the kitchen staff, stocked the pantry — now you unlock the front door and put up a sign.',
    nouns: [
      { term: 'Hosting', explanation: 'A service that runs your app on the internet 24/7.', examples: ['Vercel', 'Netlify', 'Railway', 'Fly.io'] },
      { term: 'Domain', explanation: 'Your app\'s address on the internet — the URL people type to find you.', examples: ['myapp.com', 'cool-project.vercel.app'] },
      { term: 'Environment Variables', explanation: 'Secret settings (like API keys) stored outside your code so they stay private.', examples: ['API_KEY=abc123', 'DATABASE_URL=...'] },
      { term: 'Build', explanation: 'The process of converting your source code into optimized files ready to serve.', examples: ['npm run build', 'Production build', 'Static export'] },
    ],
    verbs: [
      { term: 'Deploy', explanation: 'Push your app to the internet. "Deploy to Vercel" means put it live.' },
      { term: 'Build', explanation: 'Prepare your code for production — optimize, bundle, compress.' },
      { term: 'Monitor', explanation: 'Watch your app for errors, slowdowns, or crashes after it\'s live.' },
    ],
  },
];

export interface QuizItem {
  description: string;
  correctLayer: string;
  explanation: string;
}

export const quizItems: QuizItem[] = [
  { description: 'The button changes color when you hover over it', correctLayer: 'frontend', explanation: 'Hover effects are visual interactions — that\'s the frontend\'s job.' },
  { description: 'Your account info is still there when you log back in tomorrow', correctLayer: 'database', explanation: 'Persistent data that survives sessions is stored in the database.' },
  { description: 'The app checks if your password is correct', correctLayer: 'backend', explanation: 'Password verification is sensitive logic that runs on the server, never in the browser.' },
  { description: 'Anyone in the world can visit your app at myapp.com', correctLayer: 'deployment', explanation: 'A public URL means the app has been deployed to a hosting service with a domain.' },
  { description: 'The page shows a list of your recent orders', correctLayer: 'frontend', explanation: 'Displaying data on screen is the frontend rendering information it received.' },
  { description: 'The server calculates the total price including tax and shipping', correctLayer: 'backend', explanation: 'Business logic like pricing calculations runs on the backend.' },
  { description: 'Your profile photo is saved so you don\'t have to re-upload it', correctLayer: 'database', explanation: 'Saved files and user data are stored in the database (or file storage).' },
  { description: 'The API key is kept secret so no one can steal it', correctLayer: 'deployment', explanation: 'Secrets are stored as environment variables during deployment, never in client-side code.' },
  { description: 'When you type in the search bar, suggestions appear in real time', correctLayer: 'frontend', explanation: 'Real-time UI updates as the user types are handled by the frontend.' },
  { description: 'A new "favorites" feature is added to the user table', correctLayer: 'database', explanation: 'Adding a new field to a table is a database migration.' },
  { description: 'The app sends a notification email when someone signs up', correctLayer: 'backend', explanation: 'Sending emails is server-side logic — the backend triggers it.' },
  { description: 'The latest version of your code goes live at 2pm', correctLayer: 'deployment', explanation: 'Pushing new code to production is a deployment.' },
];
