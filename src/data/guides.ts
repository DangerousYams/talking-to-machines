// ─── Quick Guides Data ───
// Beginner-friendly reference guides. No assumed knowledge.
// Explain jargon inline, handle Mac vs Windows, keep the tone warm.

export interface GuideSection {
  heading: string;
  body?: string;    // explanatory paragraph(s), HTML allowed
  items?: string[]; // bullet points, HTML allowed
  note?: string;    // reassuring tip or callout, HTML allowed
  aiNote?: string;  // "Claude Code can do this for you" callout, HTML allowed
}

export interface Guide {
  number: number;
  slug: string;
  title: string;
  subtitle: string;
  accent: string;
  category: 'ai-tools' | 'claude-code' | 'infrastructure';
  categoryLabel: string;
  whatItIs: string;
  sections: GuideSection[];
  tryThis: string;
}

export const guideCategories = [
  { key: 'ai-tools', label: 'AI Tools', accent: '#0EA5E9' },
  { key: 'claude-code', label: 'Claude Code', accent: '#E94560' },
  { key: 'infrastructure', label: 'Infrastructure', accent: '#16C79A' },
] as const;

export const guides: Guide[] = [
  // ═══════════════════════════════════════════════════════════
  // AI TOOLS
  // ═══════════════════════════════════════════════════════════

  {
    number: 1,
    slug: 'choosing-the-right-ai-model',
    title: 'Choosing the Right AI Model',
    subtitle: 'Claude vs GPT vs Gemini vs open-source — a practical guide to picking the right tool',
    accent: '#0EA5E9',
    category: 'ai-tools',
    categoryLabel: 'AI Tools',
    whatItIs: 'There are dozens of AI tools out there, and it\'s hard to know where to start. This guide cuts through the noise: here\'s what each major AI model is good at, what it costs, and when to use which one.',
    sections: [
      {
        heading: 'First, what\'s an AI model?',
        body: 'When you use ChatGPT, Claude, or Gemini, you\'re talking to an <strong>AI model</strong> — a program that\'s been trained on massive amounts of text to understand and generate language. Different companies build different models, and they each have strengths. Think of it like cars: they all drive, but a pickup truck and a sports car are good at different things.',
      },
      {
        heading: 'The Big Three',
        body: 'These are the AI models most people interact with. All three are excellent — the differences are in their specialties.',
        items: [
          '<strong>Claude</strong> (by Anthropic) — Especially strong at writing, analysis, coding, and working with long documents. Tends to follow complex, multi-step instructions carefully. Available at <strong>claude.ai</strong>.',
          '<strong>ChatGPT</strong> (by OpenAI) — The most well-known AI. Great at creative tasks, and can handle text, images, and voice in the same conversation. Huge ecosystem of plugins. Available at <strong>chatgpt.com</strong>.',
          '<strong>Gemini</strong> (by Google) — Deep integration with Google products (Docs, Gmail, Search). Has an enormous <em>context window</em> (the amount of text it can "remember" in a single conversation). Available at <strong>gemini.google.com</strong>.',
        ],
        note: 'All three have free tiers. You can try each one without paying anything.',
      },
      {
        heading: 'What about open-source models?',
        body: 'The models above all run on company servers — you send your text to their computers, and they send a response back. <strong>Open-source models</strong> are different: they\'re free to download and run on your own computer. Nobody else sees your data.',
        items: [
          '<strong>Llama</strong> (by Meta) — The most popular open-source model family',
          '<strong>Mistral</strong> (by Mistral AI) — Fast and capable, great for coding',
          '<strong>Qwen</strong> (by Alibaba) — Strong multilingual support',
          '<strong>Gemma</strong> (by Google) — Lightweight, runs well on modest hardware',
        ],
        note: 'Open-source models are less capable than the Big Three, but they\'re free, private, and work offline. See <strong>Guide #2</strong> to learn how to run one.',
      },
      {
        heading: 'So which one should I use?',
        body: 'Here\'s a simple cheat sheet. When in doubt, start with whichever one you already have an account for — you can always switch later.',
        items: [
          'Writing essays, emails, or reports → <strong>Claude</strong>',
          'Analyzing images or working with audio → <strong>ChatGPT</strong>',
          'Research or anything connected to Google Workspace → <strong>Gemini</strong>',
          'Privacy-sensitive tasks (medical, legal, personal) → <strong>Local open-source</strong>',
          'Coding → <strong>Claude Code</strong> (see Guide #3) or <strong>Cursor</strong>',
        ],
      },
      {
        heading: 'Don\'t overthink it',
        body: 'The AI landscape changes fast — what\'s "best" today might not be next month. The most important thing isn\'t which model you pick, it\'s <em>how well you communicate with it</em>. A great prompt on any model beats a lazy prompt on the "best" one.',
        note: 'Most people settle on one model for daily use and occasionally try others for specific tasks. That\'s a perfectly good strategy.',
      },
    ],
    tryThis: 'Pick one task you do regularly — summarizing notes, drafting an email, brainstorming ideas. Try it on Claude, ChatGPT, and Gemini. Which response do you like best? That preference is worth paying attention to.',
  },

  {
    number: 2,
    slug: 'running-ai-locally-with-lm-studio',
    title: 'Running AI Locally with LM Studio',
    subtitle: 'Download, install, and chat with an AI that runs entirely on your computer',
    accent: '#7B61FF',
    category: 'ai-tools',
    categoryLabel: 'AI Tools',
    whatItIs: 'Normally when you use AI, your messages travel to a company\'s servers and back. <strong>LM Studio</strong> lets you skip that entirely — it downloads an AI model to your computer so everything runs locally. No internet needed, no account required, and your conversations never leave your machine.',
    sections: [
      {
        heading: 'Why would I want this?',
        items: [
          '<strong>Privacy</strong> — Your conversations stay on your computer. Period.',
          '<strong>Free</strong> — No subscription, no usage limits, no API costs',
          '<strong>Offline</strong> — Works without internet (after you download the model)',
          '<strong>Learning</strong> — A great way to understand how AI models actually work',
        ],
        note: 'Local models are less powerful than Claude or ChatGPT. Think of them as a handy assistant for everyday tasks, not a replacement for the best cloud models.',
      },
      {
        heading: 'Can my computer handle it?',
        body: 'AI models need a decent amount of memory (RAM) to run. Here\'s how to check what you have:',
        items: [
          '<strong>Mac:</strong> Click the Apple menu (top-left) → "About This Mac." Look for "Memory" — you want at least 8 GB.',
          '<strong>Windows:</strong> Press <code>Ctrl + Shift + Esc</code> to open Task Manager → click "Performance" → "Memory." Check the total.',
        ],
        note: 'Got 8 GB of RAM? You can run small models. 16 GB? You\'re in great shape for most models. Apple Silicon Macs (M1/M2/M3/M4) are especially good at this.',
      },
      {
        heading: 'Step 1: Install LM Studio',
        items: [
          'Go to <strong>lmstudio.ai</strong> in your browser',
          'Click the download button — it detects your operating system automatically',
          '<strong>Mac:</strong> Open the downloaded <code>.dmg</code> file and drag LM Studio to your Applications folder',
          '<strong>Windows:</strong> Run the downloaded <code>.exe</code> installer and follow the prompts',
          'Open LM Studio. No account or sign-up needed.',
        ],
      },
      {
        heading: 'Step 2: Download a model',
        body: 'A "model" is the AI brain itself — a large file (usually 2–5 GB) that LM Studio runs on your hardware.',
        items: [
          'Click <strong>Discover</strong> in LM Studio\'s sidebar',
          'Search for <strong>Llama 3.1 8B</strong> — it\'s a great starter model that runs well on most machines',
          'Click the <strong>Download</strong> button and wait. It\'s a big file — this might take a few minutes on slower internet.',
          'If your computer struggles, try a smaller model like <strong>Gemma 2 2B</strong> or <strong>Phi-3 Mini</strong>',
        ],
        note: 'The numbers in model names (like "8B") refer to <em>billions of parameters</em> — roughly how complex the model\'s "brain" is. Bigger = smarter but slower and more resource-hungry.',
      },
      {
        heading: 'Step 3: Start chatting',
        items: [
          'Click the <strong>Chat</strong> tab in the sidebar',
          'Select the model you just downloaded from the dropdown at the top',
          'Type a message in the chat box and hit Enter',
          'The first message might take 10–30 seconds — the model needs to load into memory. After that, responses are faster.',
        ],
      },
      {
        heading: 'Tips once you\'re up and running',
        items: [
          'If responses are too slow, try a smaller model',
          'Look for models labeled <strong>Q4</strong> — they\'re compressed to run faster while keeping most of the quality',
          'LM Studio can also run a <strong>local API server</strong>, which means other apps on your computer can talk to your local model (useful if you get into coding)',
        ],
      },
    ],
    tryThis: 'Install LM Studio, download Llama 3.1 8B, and ask it to explain a topic you\'re studying. Then ask Claude or ChatGPT the same question. Compare the answers — you\'ll get a feel for what local models do well and where cloud models still have the edge.',
  },

  // ═══════════════════════════════════════════════════════════
  // CLAUDE CODE
  // ═══════════════════════════════════════════════════════════

  {
    number: 3,
    slug: 'claude-code-getting-started',
    title: 'Claude Code: Getting Started',
    subtitle: 'A step-by-step guide to installing and using Claude\'s coding assistant',
    accent: '#E94560',
    category: 'claude-code',
    categoryLabel: 'Claude Code',
    whatItIs: 'Claude Code is an AI that helps you write software. Instead of a chat window in your browser, it lives in your <strong>terminal</strong> (the text-based command interface on your computer) and works directly with your project files. You describe what you want in plain English, and it reads your code, writes new code, runs commands, and fixes bugs. Don\'t worry if you\'ve never used a terminal before — we\'ll walk through it.',
    sections: [
      {
        heading: 'What\'s a terminal?',
        body: 'A terminal (also called "command line" or "command prompt") is a text-based way to control your computer. Instead of clicking icons, you type commands. It looks like a black or white window with a blinking cursor. Every computer has one built in.',
        items: [
          '<strong>Mac:</strong> Press <code>Cmd + Space</code> to open Spotlight, type <strong>Terminal</strong>, and press Enter.',
          '<strong>Windows:</strong> Press the <code>Windows key</code>, type <strong>PowerShell</strong>, and press Enter.',
        ],
        note: 'The terminal might look intimidating at first, but you only need a handful of commands. You won\'t break anything by typing the wrong thing — the worst that happens is an error message.',
      },
      {
        heading: 'Step 1: Install Node.js',
        body: 'Claude Code is built with a technology called <strong>Node.js</strong> — it\'s a free program that runs JavaScript code on your computer. You need to install it first (one time only).',
        items: [
          'Go to <strong>nodejs.org</strong> in your browser',
          'Download the <strong>LTS</strong> version (the one labeled "Recommended for Most Users")',
          '<strong>Mac:</strong> Open the downloaded <code>.pkg</code> file and follow the installer',
          '<strong>Windows:</strong> Run the downloaded <code>.msi</code> file and follow the installer. Check the box that says "Automatically install necessary tools" if you see it.',
          'To verify it worked, open your terminal and type: <code>node --version</code>',
          'You should see a version number like <code>v20.x.x</code>. If you see an error, try closing and reopening the terminal.',
        ],
        note: 'Node.js also installs <strong>npm</strong> (Node Package Manager) — a tool that lets you install programs built by other developers. We\'ll use it in the next step.',
      },
      {
        heading: 'Step 2: Install Claude Code',
        body: 'Now that you have Node.js, you can install Claude Code with one command in your terminal:',
        items: [
          'Type this and press Enter: <code>npm install -g @anthropic-ai/claude-code</code>',
          'Wait for it to finish (might take 30–60 seconds)',
          'The <code>-g</code> means "install globally" — it makes Claude Code available from anywhere on your computer',
        ],
        note: 'If you get a "permission denied" error on Mac, try adding <code>sudo</code> at the beginning: <code>sudo npm install -g @anthropic-ai/claude-code</code> — it will ask for your computer password.',
      },
      {
        heading: 'Step 3: Start Claude Code',
        items: [
          'In your terminal, navigate to a project folder. For example: <code>cd ~/Documents/my-project</code>',
          'Type <code>claude</code> and press Enter',
          'The first time, it will open your browser to sign in with your Anthropic account',
          'Once signed in, you\'re back in the terminal with Claude Code ready to go',
        ],
        note: '<code>cd</code> stands for "change directory" — it\'s how you navigate folders in the terminal. <code>~</code> means your home folder (like /Users/yourname on Mac or C:\\Users\\yourname on Windows).',
      },
      {
        heading: 'Step 4: Try it out',
        body: 'Now you can talk to Claude Code in plain English. Here are some good first things to try:',
        items: [
          '<strong>"What does this project do?"</strong> — Claude reads your files and gives you a summary',
          '<strong>"Create a simple webpage that says Hello World"</strong> — it creates the files for you',
          '<strong>"There\'s a bug — the button doesn\'t work when I click it"</strong> — it investigates and proposes a fix',
          'Claude Code shows you what it plans to change and <strong>asks for your approval</strong> before writing anything',
        ],
      },
      {
        heading: 'Essential commands to know',
        body: 'While chatting with Claude Code, these built-in commands are helpful:',
        items: [
          '<code>/help</code> — see everything Claude Code can do',
          '<code>/clear</code> — start a fresh conversation',
          '<code>/compact</code> — if the conversation gets long, this summarizes it to free up space',
          '<code>/cost</code> — see how much you\'ve spent this session',
        ],
      },
      {
        heading: 'The CLAUDE.md file',
        body: 'If you create a file called <code>CLAUDE.md</code> in your project\'s main folder, Claude Code reads it automatically at the start of every session. It\'s like leaving a note for Claude about your project.',
        items: [
          'What technology your project uses',
          'Coding conventions you follow ("use single quotes" or "write tests for every new function")',
          'Things to avoid ("don\'t modify the database schema" or "the auth system is fragile — be careful")',
        ],
        note: 'Think of CLAUDE.md as a persistent system prompt for your codebase. You write it once and Claude remembers it every time.',
      },
    ],
    tryThis: 'Install Node.js and Claude Code following the steps above. Navigate to any folder on your computer and type <code>claude</code>. Ask it "What files are in this folder?" to see it in action. Then try: "Create a simple HTML page with a button that counts how many times you\'ve clicked it."',
  },

  {
    number: 4,
    slug: 'claude-code-best-practices',
    title: 'Claude Code: Best Practices & Tools',
    subtitle: 'Slash commands, built-in skills, MCP connections, and tips for getting the most out of Claude Code',
    accent: '#F5A623',
    category: 'claude-code',
    categoryLabel: 'Claude Code',
    whatItIs: 'Once you\'ve got Claude Code installed (Guide #3), this guide covers the tools and workflows that make you faster. <strong>Slash commands</strong> give you quick actions. <strong>Skills</strong> are pre-built recipes for common tasks. <strong>MCP connections</strong> let Claude talk directly to services like GitHub and Supabase. Think of this as moving from "it works" to "I\'m good at this."',
    sections: [
      {
        heading: 'Slash commands you\'ll use constantly',
        body: 'Type these during any Claude Code session. They\'re built in — no setup needed.',
        items: [
          '<code>/help</code> — show all available commands and skills',
          '<code>/clear</code> — wipe the conversation and start fresh',
          '<code>/compact</code> — summarize the conversation so far (saves context space for longer sessions)',
          '<code>/cost</code> — see how much you\'ve spent this session',
          '<code>/review</code> — ask Claude to review your recent code changes',
          '<code>/commit</code> — stage your changes and create a Git commit with a good message',
          '<code>/pr</code> — create a GitHub pull request from your current branch',
          '<code>/init</code> — generate a CLAUDE.md file for a new project based on what Claude sees in the codebase',
        ],
        note: '<code>/commit</code> and <code>/pr</code> are huge time-savers. Claude writes the commit message and PR description for you based on the actual changes — no more staring at a blank message box.',
      },
      {
        heading: 'Built-in and community skills',
        body: 'Skills are pre-written instructions that Claude Code can follow for specific tasks. Some are built in, others are shared by the community. Here are some popular ones:',
        items: [
          '<code>/commit</code> — writes a clear commit message based on your staged changes',
          '<code>/review</code> — reviews your code for bugs, style issues, and potential improvements',
          '<code>/pr</code> — creates a pull request with a summary of your changes',
          '<code>/simplify</code> — looks at your recent code and suggests ways to make it cleaner',
          '<code>/claude-api</code> — helps you integrate the Claude API into your project with the latest SDK patterns',
          '<code>/frontend-design</code> — generates polished, production-grade frontend components',
        ],
        note: 'Type <code>/help</code> in any session to see all the skills available in your current project. Skills can be added by you or by anyone who contributes to the project.',
      },
      {
        heading: 'MCP: Connecting Claude to external services',
        body: '<strong>MCP</strong> (Model Context Protocol) is how Claude Code talks to services beyond your local files. Think of it as <strong>plugins</strong> — once connected, Claude can read and write to external tools directly.',
        items: [
          '<strong>Supabase MCP</strong> — Claude can query your database, run migrations, create tables, manage edge functions, and check logs — all without you leaving the terminal',
          '<strong>GitHub MCP</strong> — Search issues, read PR comments, create branches, and manage pull requests',
          '<strong>Memory MCP</strong> — Claude remembers context across sessions (useful for long-running projects)',
          '<strong>Web search/fetch</strong> — Claude can look up documentation or check a live URL',
        ],
      },
      {
        heading: 'Setting up Supabase MCP (example)',
        body: 'This is especially useful if your project has a Supabase backend (Guide #6). Once connected, you can say things like "add a \'tags\' column to the posts table" or "show me the last 10 user sign-ups" and Claude handles it.',
        items: [
          'In your project, create or edit <code>.claude/settings.json</code>',
          'Add your Supabase connection under <code>mcpServers</code>',
          'Claude Code can now run SQL, apply migrations, deploy edge functions, and more — directly from the conversation',
        ],
        aiNote: 'You can ask Claude Code to set up MCP for you: <strong>"Connect this project to our Supabase database"</strong> — it will walk you through the configuration.',
      },
      {
        heading: 'Tips for better results',
        items: [
          '<strong>Be specific about what you want.</strong> "Add a search bar that filters the product list by name" beats "make the UI better."',
          '<strong>Let Claude read first.</strong> Start with "What does this file do?" before asking it to change things.',
          '<strong>Review every change.</strong> Claude shows you diffs before writing — read them. You\'re the architect, Claude is the builder.',
          '<strong>Use <code>/compact</code> early.</strong> Long conversations slow Claude down and degrade quality. Compact after every major milestone.',
          '<strong>Iterate, don\'t restart.</strong> If the first result isn\'t right, tell Claude what to fix. "The button should be on the right side" is better than starting over.',
          '<strong>Write a CLAUDE.md.</strong> Five minutes of project context saves hours of re-explaining.',
        ],
      },
      {
        heading: 'When Claude Code can\'t help',
        body: 'Claude Code is powerful, but it works best as a partner — not a replacement for understanding.',
        items: [
          'If you don\'t understand what Claude built, ask it to explain before moving on',
          'Always test changes yourself — Claude can\'t see your screen or click your buttons',
          'For visual design, describe what you want in detail or reference a specific example',
          'If Claude gets stuck in a loop, <code>/clear</code> and try a different approach',
        ],
      },
    ],
    tryThis: 'Open Claude Code in a project and try <code>/review</code> to get feedback on your recent code. Then try asking "What MCP connections are available?" to see what plugins you can add.',
  },

  // ═══════════════════════════════════════════════════════════
  // INFRASTRUCTURE
  // Order: GitHub → Supabase → Vercel → Stripe → Shopify → Resend
  // ═══════════════════════════════════════════════════════════

  {
    number: 5,
    slug: 'github-repos-commits-prs',
    title: 'GitHub: Repos, Commits & PRs',
    subtitle: 'Save your code, track changes, and collaborate — a complete beginner\'s walkthrough',
    accent: '#0F3460',
    category: 'infrastructure',
    categoryLabel: 'Infrastructure',
    whatItIs: '<strong>GitHub</strong> is where developers store and manage their code. It\'s like Google Drive, but specifically designed for code — it tracks every change you make, lets you undo mistakes, and makes it easy to collaborate with others (or with AI tools like Claude Code). If you\'re writing code of any kind, GitHub is essential.',
    sections: [
      {
        heading: 'Why do I need this?',
        items: [
          '<strong>Version history</strong> — every change you make is saved. You can go back to any previous version at any time.',
          '<strong>Backup</strong> — your code lives in the cloud, not just on your computer. Laptop dies? Your code is safe.',
          '<strong>Deployment</strong> — services like Vercel (Guide #7) deploy directly from GitHub. Push your code → your site updates.',
          '<strong>AI tools love it</strong> — Claude Code and other AI coding tools work best when your project is a Git repository.',
        ],
      },
      {
        heading: 'Key vocabulary',
        body: 'Git and GitHub have their own language. Here are the words you\'ll see constantly:',
        items: [
          '<strong>Git</strong> — the version control software that runs on your computer. It tracks changes to files.',
          '<strong>GitHub</strong> — a website that stores your Git projects online and adds collaboration features.',
          '<strong>Repository (repo)</strong> — a project folder tracked by Git. Every project gets its own repo.',
          '<strong>Commit</strong> — a saved snapshot of your project at a specific moment. Like a save point in a video game.',
          '<strong>Push</strong> — upload your local commits to GitHub.',
          '<strong>Pull</strong> — download the latest changes from GitHub to your computer.',
          '<strong>Branch</strong> — a parallel version of your project for testing changes without affecting the main version.',
          '<strong>Pull Request (PR)</strong> — a proposal to merge changes from one branch into another. This is where code review happens.',
        ],
      },
      {
        heading: 'Step 1: Install Git',
        items: [
          '<strong>Mac:</strong> Open Terminal (<code>Cmd + Space</code>, type "Terminal"). Type <code>git --version</code>. If Git isn\'t installed, your Mac will offer to install it. Click "Install."',
          '<strong>Windows:</strong> Go to <strong>git-scm.com</strong> and download the installer. Run it with the default settings. This also installs "Git Bash," a terminal app you can use for Git commands.',
          'Verify it works: open your terminal and type <code>git --version</code> — you should see a version number.',
        ],
        aiNote: 'You can ask Claude Code to handle all of the Git commands for you. Say <strong>"commit my changes"</strong> or <strong>"create a new branch called feature-login"</strong> — Claude runs the right commands automatically.',
      },
      {
        heading: 'Step 2: Create a GitHub account',
        items: [
          'Go to <strong>github.com</strong> and sign up (free)',
          'Pick a username — this becomes part of your profile URL (<code>github.com/yourusername</code>)',
        ],
      },
      {
        heading: 'Step 3: Configure Git on your computer',
        body: 'Tell Git who you are (this info appears on your commits):',
        items: [
          'Open your terminal',
          'Type: <code>git config --global user.name "Your Name"</code>',
          'Type: <code>git config --global user.email "you@email.com"</code>',
          'Use the same email you signed up to GitHub with',
        ],
      },
      {
        heading: 'Step 4: Create your first repo and push code',
        items: [
          'On GitHub, click the <strong>+</strong> button (top-right) → <strong>"New repository"</strong>',
          'Name it something like <code>my-first-project</code>',
          'Check "Add a README file" and click <strong>"Create repository"</strong>',
          'Click the green <strong>"Code"</strong> button and copy the HTTPS URL',
          'In your terminal: <code>git clone [paste the URL]</code> — this downloads the repo to your computer',
          '<code>cd my-first-project</code> — enter the folder',
          'Make a change — edit <code>README.md</code> or create a new file',
          '<code>git add .</code> — stage all changes',
          '<code>git commit -m "my first commit"</code> — save the snapshot',
          '<code>git push</code> — upload to GitHub',
          'Refresh the GitHub page — your changes are there!',
        ],
        note: 'If GitHub asks for authentication when you push, it will walk you through setting up a token or SSH key. Follow the prompts — this is a one-time setup.',
        aiNote: 'In Claude Code, you can skip all of these commands. Just say <strong>"push my changes to GitHub"</strong> or <strong>"create a new repo for this project"</strong> and Claude handles the rest, including writing a commit message for you.',
      },
      {
        heading: 'The .gitignore file',
        body: 'Some files should <strong>never</strong> be uploaded to GitHub — things like passwords, API keys, and large auto-generated folders. A <code>.gitignore</code> file tells Git what to skip.',
        items: [
          'Create a file called <code>.gitignore</code> in your project\'s root folder',
          'Add one entry per line for things Git should ignore:',
          '<code>node_modules/</code> — the giant folder of installed packages (can be re-downloaded)',
          '<code>.env</code> — environment variables (often contain secrets)',
          '<code>.DS_Store</code> — Mac system files (nobody needs these)',
        ],
        note: '<strong>Never push API keys, passwords, or secret tokens to GitHub.</strong> Even in private repos, it\'s a bad habit. Use a <code>.env</code> file locally and add it to <code>.gitignore</code>.',
      },
    ],
    tryThis: 'Follow Steps 1–4 above end to end. Create a repo, clone it, add a file, commit, and push. It takes about 10 minutes and you\'ll have version-controlled code on GitHub. From here, you can deploy it on Vercel (Guide #7) or start using Claude Code with it (Guide #3).',
  },

  {
    number: 6,
    slug: 'supabase-instant-backend',
    title: 'Supabase: Instant Backend',
    subtitle: 'Add a database, user accounts, and file storage to your app — no server required',
    accent: '#16C79A',
    category: 'infrastructure',
    categoryLabel: 'Infrastructure',
    whatItIs: 'Most apps need to remember things — user accounts, saved data, uploaded images. That\'s what a <strong>backend</strong> is: the behind-the-scenes part that stores and manages data. Building one from scratch is complicated. <strong>Supabase</strong> gives you a ready-made backend with a database, user login system, and file storage, all through a visual dashboard. You don\'t need to manage any servers.',
    sections: [
      {
        heading: 'Wait, what\'s a backend?',
        body: 'A website has two parts: the <strong>frontend</strong> (what users see — buttons, text, images) and the <strong>backend</strong> (the invisible part that stores data and makes things work). When you create an account on a website, the backend saves your email and password. When you post a photo, the backend stores it. Supabase <em>is</em> the backend, so you only have to build the frontend.',
      },
      {
        heading: 'When you\'d use Supabase',
        items: [
          'Your app needs to <strong>save data</strong> (notes, posts, scores, orders, anything)',
          'You need <strong>user accounts</strong> — sign up, log in, log out',
          'You need to <strong>store files</strong> — images, PDFs, uploads',
          'You want <strong>real-time features</strong> — like a live chat or collaborative editing',
        ],
        note: 'If your project is a static website with no user data (like a portfolio or blog), you probably don\'t need Supabase. Use it when your app needs to <em>remember</em> things between visits.',
      },
      {
        heading: 'Getting started',
        items: [
          'Go to <strong>supabase.com</strong> and create a free account',
          'Click <strong>"New Project"</strong> — give it a name and a password (this is your database password, save it somewhere safe)',
          'Wait about 30 seconds for your project to spin up',
          'You\'ll land on a dashboard — this is your backend\'s control center',
        ],
      },
      {
        heading: 'Your first database table',
        body: 'A <strong>database</strong> stores your app\'s data in <strong>tables</strong> — think of a table like a spreadsheet. Each row is a record (like one note or one user) and each column is a property (like "title" or "created date").',
        items: [
          'In the dashboard, click <strong>Table Editor</strong> in the sidebar',
          'Click <strong>"Create a new table"</strong>',
          'Name it something like <code>notes</code>',
          'Add columns: <code>id</code> (auto-generated), <code>text</code> (type: text), <code>created_at</code> (type: timestamp)',
          'Click <strong>Save</strong> — you now have a database table',
          'Click <strong>"Insert row"</strong> to add your first piece of data',
        ],
        note: 'You can do all of this from the visual dashboard — no code required. When you\'re ready to connect it to your app, Supabase gives you copy-paste code snippets.',
        aiNote: 'With the Supabase MCP connected (see Guide #4), you can ask Claude Code to do all of this for you: <strong>"Create a notes table with id, text, and created_at columns"</strong> or <strong>"Add a tags column to the posts table"</strong> — Claude runs the SQL directly.',
      },
      {
        heading: 'User accounts (authentication)',
        body: 'Supabase has a built-in login system. You don\'t need to figure out how to securely store passwords or manage sessions — it handles all of that.',
        items: [
          '<strong>Email + password</strong> — the classic sign-up flow',
          '<strong>Magic links</strong> — user enters email, gets a login link (no password needed)',
          '<strong>"Sign in with Google/GitHub"</strong> — social login with one click',
          'Enable any of these in <strong>Authentication</strong> → <strong>Providers</strong> in the dashboard',
        ],
      },
      {
        heading: 'Connecting Supabase to your code',
        body: 'When you\'re ready to use Supabase from your app (not just the dashboard), you\'ll need two things from your project settings: your <strong>project URL</strong> and your <strong>anon key</strong> (a safe-to-share key for reading public data).',
        items: [
          'Install the library: <code>npm install @supabase/supabase-js</code>',
          'Initialize it: <code>const supabase = createClient(url, anonKey)</code>',
          'Read data: <code>const { data } = await supabase.from(\'notes\').select()</code>',
          'Write data: <code>await supabase.from(\'notes\').insert({ text: \'Hello!\' })</code>',
        ],
        note: 'The <code>npm install</code> command is how you add external code libraries to your project. It requires Node.js (see Guide #3, Step 1).',
        aiNote: 'Ask Claude Code: <strong>"Connect this project to Supabase and add a function to fetch all notes"</strong> — it will install the library, set up the client, and write the code for you.',
      },
      {
        heading: 'What does it cost?',
        items: [
          '<strong>Free tier</strong> — 500 MB database, 1 GB file storage, 50,000 monthly active users',
          'That\'s generous enough for most projects and prototypes',
          'Paid plans start at $25/month for more storage and features',
        ],
      },
    ],
    tryThis: 'Create a free Supabase project. In the Table Editor, create a "notes" table with a "text" column. Add 3 rows of data. Congratulations — you just built your first database.',
  },

  {
    number: 7,
    slug: 'vercel-deploy-anything',
    title: 'Vercel: Deploy Anything',
    subtitle: 'Put your website on the internet — for free — in under 2 minutes',
    accent: '#0F3460',
    category: 'infrastructure',
    categoryLabel: 'Infrastructure',
    whatItIs: 'You\'ve built a website on your computer, but right now only you can see it. <strong>Deploying</strong> means putting it on the internet so anyone with the link can visit it. <strong>Vercel</strong> is a platform that makes this ridiculously easy — connect your code, and it handles everything else. No server setup, no complicated configuration.',
    sections: [
      {
        heading: 'What does Vercel actually do?',
        body: 'When you build a website on your computer, it only exists on your machine. Vercel takes your project files, builds them, and puts them on fast servers all around the world. When someone visits your URL, they get served from the closest server — making your site load quickly no matter where they are.',
        items: [
          '<strong>Hosting</strong> — your site lives on Vercel\'s servers, not yours',
          '<strong>Auto-deploy</strong> — every time you update your code (via Git), Vercel automatically rebuilds and republishes',
          '<strong>Preview links</strong> — when you\'re testing changes, Vercel gives you a temporary URL to preview before going live',
          '<strong>Free SSL</strong> — your site gets <code>https://</code> automatically (the padlock icon in the browser)',
        ],
      },
      {
        heading: 'What you\'ll need first',
        items: [
          'A <strong>GitHub account</strong> (free — see Guide #5 if you don\'t have one)',
          'Your project code pushed to a GitHub repository',
          'A <strong>Vercel account</strong> — sign up at <strong>vercel.com</strong> using your GitHub account',
        ],
        note: 'If you don\'t have a project yet, that\'s fine — Vercel has starter templates you can deploy with one click to try it out.',
      },
      {
        heading: 'Your first deploy',
        items: [
          'Go to <strong>vercel.com</strong> and sign in',
          'Click <strong>"Add New…"</strong> → <strong>"Project"</strong>',
          'Select the GitHub repo you want to deploy',
          'Vercel auto-detects what kind of project it is (React, Next.js, Astro, plain HTML, etc.) and configures the build',
          'Click <strong>"Deploy"</strong>',
          'Wait about 60 seconds — you\'ll get a live URL like <code>your-project.vercel.app</code>',
        ],
        note: 'That\'s it. Seriously. From now on, every time you push code to GitHub, Vercel automatically rebuilds and updates your site.',
        aiNote: 'You can ask Claude Code: <strong>"Deploy this project to Vercel"</strong> — it can set up the Vercel configuration, push your code, and walk you through connecting the repo.',
      },
      {
        heading: 'Environment variables (keeping secrets safe)',
        body: 'If your project uses an API key or password (like a database connection or an AI API key), you should <strong>never</strong> put it directly in your code. Instead, store it as an <strong>environment variable</strong> on Vercel — a secret value that your code can access but that isn\'t visible in your source code.',
        items: [
          'In Vercel: go to your project → <strong>Settings</strong> → <strong>Environment Variables</strong>',
          'Add a name (like <code>ANTHROPIC_API_KEY</code>) and a value (your actual key)',
          'In your code, access it with <code>process.env.ANTHROPIC_API_KEY</code>',
        ],
      },
      {
        heading: 'What does it cost?',
        items: [
          '<strong>Free tier</strong> — generous enough for most personal and hobby projects',
          'Unlimited static sites, 100 GB bandwidth/month',
          'The paid tier ($20/month) adds more bandwidth, team features, and commercial use',
        ],
      },
      {
        heading: 'When to use Vercel vs. other options',
        items: [
          '<strong>Vercel</strong> — best for frontend sites and Next.js/Astro/React apps',
          '<strong>Netlify</strong> — similar to Vercel, also excellent, slight different feature set',
          '<strong>GitHub Pages</strong> — free, but only for simple static sites (no server-side code)',
          '<strong>Fly.io / Railway</strong> — when you need a full backend server running 24/7 (not just serverless)',
        ],
      },
    ],
    tryThis: 'If you have a project on GitHub, import it to Vercel right now — it takes 2 minutes and you\'ll have a live URL to share. If you don\'t have a project yet, go to vercel.com/templates and deploy a starter template with one click.',
  },

  {
    number: 8,
    slug: 'stripe-accepting-payments',
    title: 'Stripe: Accepting Payments',
    subtitle: 'How to charge money for your product — from test mode to real payments',
    accent: '#7B61FF',
    category: 'infrastructure',
    categoryLabel: 'Infrastructure',
    whatItIs: 'If you\'re selling something online — a product, a subscription, a course, or even accepting donations — you need a way to process payments. <strong>Stripe</strong> is the most popular way to do it. It handles credit card processing, receipts, refunds, and tax calculation so you don\'t have to. The best part: you can start in <strong>test mode</strong> (no real money involved) to learn how it all works.',
    sections: [
      {
        heading: 'What Stripe does for you',
        body: 'Accepting payments online is surprisingly complicated. You need to handle credit card validation, fraud detection, receipts, different currencies, tax rules, and security regulations. Stripe handles <em>all</em> of this. You tell Stripe what you\'re selling and how much it costs, and they deal with the rest.',
        items: [
          '<strong>Checkout</strong> — a beautiful payment page that Stripe builds and hosts for you',
          '<strong>Subscriptions</strong> — recurring monthly/yearly billing, handled automatically',
          '<strong>Invoices & receipts</strong> — sent to customers automatically',
          '<strong>Refunds</strong> — one click in the dashboard',
        ],
      },
      {
        heading: 'The easiest path: Payment Links',
        body: 'You don\'t need to write any code to start accepting payments. Stripe\'s <strong>Payment Links</strong> let you create a checkout page from the dashboard and share it as a URL.',
        items: [
          'Sign up at <strong>stripe.com</strong>',
          'In the dashboard, go to <strong>Product catalog</strong> → <strong>Add product</strong>',
          'Enter a name, description, and price',
          'Click <strong>Create payment link</strong>',
          'Copy the link and share it — anyone who clicks it can pay you',
        ],
        note: 'Payment Links work for selling courses, digital products, donations, consulting sessions — anything with a price. No code needed.',
      },
      {
        heading: 'Test mode: Practice without real money',
        body: 'Stripe has a full <strong>test mode</strong> that simulates real payments without charging anyone. Toggle the "Test mode" switch in the dashboard (top-right). Everything works the same, but no real money moves.',
        items: [
          'Test credit card number: <code>4242 4242 4242 4242</code>',
          'Use any future expiration date and any 3-digit CVC',
          'Test payments show up in your dashboard just like real ones',
          'Switch to "Live mode" when you\'re ready for real payments',
        ],
      },
      {
        heading: 'For developers: Stripe Checkout',
        body: 'If you\'re building an app and want to integrate payments into your code (rather than sharing a link), Stripe Checkout is the way to go. Your server creates a "Checkout Session" and redirects the user to Stripe\'s hosted payment page.',
        items: [
          'Install: <code>npm install stripe</code>',
          'On your server, create a Checkout Session with your product and price',
          'Redirect the user to the session URL — Stripe shows the payment form',
          'After payment, the user is sent back to your "success" page',
        ],
        aiNote: 'Ask Claude Code: <strong>"Add Stripe checkout to this project"</strong> — it can install the library, create the server-side endpoint, and set up the redirect flow for you.',
      },
      {
        heading: 'Webhooks: How to know a payment went through',
        body: 'A <strong>webhook</strong> is a message Stripe sends to your server when something happens — like a successful payment, a failed charge, or a cancelled subscription. This is how your app "knows" that someone paid.',
        items: [
          'You give Stripe a URL on your server (an <strong>endpoint</strong>)',
          'When a payment succeeds, Stripe sends a message to that URL with the details',
          'Your server reads the message and takes action (e.g., unlock a feature, send a confirmation email)',
          '<strong>Always verify the signature</strong> — this confirms the message actually came from Stripe and wasn\'t faked',
        ],
        note: 'Webhooks are the most important concept in Stripe integration. Without them, your app doesn\'t know that a payment happened. Don\'t skip this step if you\'re coding an integration.',
      },
      {
        heading: 'What does it cost?',
        items: [
          'Stripe charges <strong>2.9% + 30¢ per transaction</strong> (US)',
          'No monthly fee — you only pay when you get paid',
          'Test mode is completely free',
        ],
      },
    ],
    tryThis: 'Create a Stripe account, switch to test mode, and create a Payment Link for a fake product. "Buy" it yourself using the test card 4242 4242 4242 4242. Watch the payment show up in your dashboard. The whole thing takes 5 minutes.',
  },

  {
    number: 9,
    slug: 'shopify-ai-powered-storefront',
    title: 'Shopify: AI-Powered Storefront',
    subtitle: 'Set up an online store and use AI to write all the content',
    accent: '#F5A623',
    category: 'infrastructure',
    categoryLabel: 'Infrastructure',
    whatItIs: 'If you want to sell things online — physical products, digital downloads, or services — <strong>Shopify</strong> gives you a complete online store. It handles your product catalog, shopping cart, checkout, payments, shipping, and taxes. This guide shows you how to set one up and use AI to speed up the hardest part: writing all the content.',
    sections: [
      {
        heading: 'When to use Shopify vs. other options',
        items: [
          '<strong>Shopify</strong> — you\'re selling products and want a full-featured online store with inventory management, shipping, etc.',
          '<strong>Stripe Payment Links</strong> (Guide #8) — you\'re selling one or two things and just need a simple payment page',
          '<strong>Gumroad / Lemon Squeezy</strong> — you\'re selling digital products (ebooks, courses, templates) and want something simpler than Shopify',
        ],
        note: 'If you\'re unsure, start with Shopify\'s free trial — you can explore without committing.',
      },
      {
        heading: 'Setting up your store',
        items: [
          'Go to <strong>shopify.com</strong> and start a free trial',
          'Pick a <strong>theme</strong> (your store\'s visual design). <strong>Dawn</strong> is the free default and it\'s genuinely good — you can customize colors and fonts later.',
          'Add your first product: upload a photo, write a title, set a price',
          'Set up <strong>Shopify Payments</strong> (their built-in payment processor — it\'s the simplest option)',
          'Add a shipping method (flat rate is easiest to start)',
          'That\'s a working store. Choose a plan when you\'re ready to go live.',
        ],
      },
      {
        heading: 'The AI advantage: content that would take days',
        body: 'The most time-consuming part of running an online store is writing content — product descriptions, SEO tags, email campaigns, FAQ pages. This is where AI shines. Here\'s what to use it for:',
        items: [
          '<strong>Product descriptions</strong> — give Claude the product details, get polished copy in seconds',
          '<strong>SEO meta descriptions</strong> — generate optimized descriptions for every product and collection page (this helps your store show up in Google)',
          '<strong>Marketing emails</strong> — draft launch announcements, sale campaigns, and follow-ups',
          '<strong>FAQ pages</strong> — feed AI your product info, get a full Q&A page',
          '<strong>Social media posts</strong> — generate variations for Instagram, TikTok, X, etc.',
          '<strong>Image alt text</strong> — AI can describe your product images for accessibility (screen readers use this)',
        ],
      },
      {
        heading: 'A prompt template that works',
        body: 'Copy this and fill in the blanks whenever you need product copy:',
        items: [
          '<em>"Write a product description for <strong>[product name]</strong>. My target customer is <strong>[who]</strong>. The tone should be <strong>[casual / premium / playful / professional]</strong>. Include: the top 3 features, one emotional hook that makes someone want it, and a clear call to action. Keep it under 100 words."</em>',
        ],
        note: 'Generate 3 versions and pick the best one. Then edit it to sound like you. AI gives you the raw material; your taste makes it yours.',
      },
      {
        heading: 'What does Shopify cost?',
        items: [
          '<strong>Free trial</strong> — explore everything, no credit card required upfront',
          '<strong>Basic plan:</strong> $39/month + transaction fees',
          '<strong>Shopify plan:</strong> $105/month (lower transaction fees, more features)',
          'Apps from the Shopify App Store: many free, some $5–50/month',
        ],
      },
    ],
    tryThis: 'Start a free Shopify trial and add one product — even if it\'s imaginary. Then open Claude and paste this: "Write 3 different product descriptions for [your product]. One casual, one premium, one playful." Pick the best one and put it in your store. That\'s AI-assisted commerce.',
  },

  {
    number: 10,
    slug: 'resend-sending-emails',
    title: 'Resend: Sending Emails',
    subtitle: 'Make your app send beautiful emails — confirmations, notifications, and more',
    accent: '#E94560',
    category: 'infrastructure',
    categoryLabel: 'Infrastructure',
    whatItIs: 'When someone signs up for your app, buys your product, or resets their password, they expect an email. <strong>Resend</strong> is a service that sends those emails for you. You tell it who to send to, what to say, and it handles delivery, spam prevention, and making sure your email actually lands in the inbox (not the junk folder).',
    sections: [
      {
        heading: 'What kind of emails are we talking about?',
        body: 'There are two kinds of email. <strong>Marketing emails</strong> are newsletters and promotions sent to a list (tools like Mailchimp handle those). <strong>Transactional emails</strong> are triggered by something the user does — that\'s what Resend is for.',
        items: [
          '"Welcome to [your app]!" after someone signs up',
          '"Here\'s your password reset link"',
          '"Your order has shipped" with tracking info',
          '"Someone commented on your post" notifications',
          'Receipts and invoices after a purchase',
        ],
      },
      {
        heading: 'Getting started (no code)',
        items: [
          'Sign up at <strong>resend.com</strong>',
          'Find your <strong>API key</strong> in the dashboard — it looks like <code>re_abc123...</code>',
          'Use the <strong>API playground</strong> in the Resend dashboard to send a test email to yourself',
          'That\'s literally it for your first email — no code needed',
        ],
        note: 'An <strong>API key</strong> is like a password that lets your code talk to Resend\'s service. Keep it secret — don\'t put it in code that others can see. Store it as an environment variable (see Guide #7).',
      },
      {
        heading: 'Sending emails from code',
        body: 'When you\'re ready to send emails from your app programmatically:',
        items: [
          'Install the library: <code>npm install resend</code>',
          'In your code: <code>const resend = new Resend(\'re_your_key\');</code>',
          'Send: <code>await resend.emails.send({ from: \'you@yourdomain.com\', to: \'user@email.com\', subject: \'Welcome!\', html: \'&lt;p&gt;Thanks for joining!&lt;/p&gt;\' });</code>',
        ],
        note: 'This code runs on your <strong>server</strong> (not in the browser), because it contains your API key. If you\'re using Vercel, put it in a serverless function (a file in the <code>api/</code> folder).',
        aiNote: 'Ask Claude Code: <strong>"Set up Resend so this app sends a welcome email when someone signs up"</strong> — it will install the library, create the email function, and wire it up to your sign-up flow.',
      },
      {
        heading: 'Setting up your domain',
        body: 'By default, Resend can only send emails <em>to you</em> (for testing). To send to real users, you need to verify that you own the email domain you\'re sending from.',
        items: [
          'In the Resend dashboard, go to <strong>Domains</strong> → <strong>Add Domain</strong>',
          'Enter your domain (e.g., <code>yourdomain.com</code>)',
          'Resend gives you <strong>DNS records</strong> to add — these are settings you configure where you bought your domain (like Namecheap, Google Domains, or Cloudflare)',
          'The records prove to email providers that you\'re allowed to send from that address',
          'Once verified (can take minutes to hours), you can send to anyone',
        ],
        note: '<strong>DNS records</strong> are settings that control how your domain works on the internet. Don\'t worry — Resend gives you the exact values to copy-paste. You don\'t need to understand DNS deeply to set this up.',
      },
      {
        heading: 'Making your emails look good',
        body: 'Plain text emails work fine, but if you want beautiful HTML emails, Resend has a companion library called <strong>React Email</strong> that lets you design email templates as React components.',
        items: [
          'Install: <code>npm install @react-email/components</code>',
          'Build your email template as a React component (with headings, images, buttons)',
          'Preview it in your browser while you design',
          'Pass the component to Resend instead of raw HTML',
        ],
        aiNote: 'Ask Claude Code: <strong>"Create a welcome email template using React Email"</strong> — it will scaffold the component, add preview support, and wire it to Resend.',
      },
      {
        heading: 'What does it cost?',
        items: [
          '<strong>Free tier:</strong> 3,000 emails/month and 1 custom domain',
          'That\'s plenty for side projects and small apps',
          'Paid plans start at $20/month for higher volumes',
        ],
      },
    ],
    tryThis: 'Sign up for Resend, find the API playground in the dashboard, and send a test email to yourself. Read it in your inbox. That\'s your app\'s first email.',
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
