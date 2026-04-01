export interface DebugResponse {
  label: string;
  quality: 'best' | 'okay' | 'poor';
  message: string;
  agentReaction: string;
  rounds: number;
}

export interface DebugScenario {
  id: string;
  title: string;
  mockup: {
    description: string;
    bugDescription: string;
    visual: 'broken-layout' | 'wrong-data' | 'deploy-error' | 'ugly-output' | 'missing-feature';
  };
  responses: [DebugResponse, DebugResponse, DebugResponse];
  lesson: string;
}

export const debugScenarios: DebugScenario[] = [
  {
    id: 'broken-button',
    title: 'The Button That Does Nothing',
    mockup: {
      description: 'You asked the agent to build a sign-up form. The form looks great, but the "Submit" button doesn\'t do anything when you click it.',
      bugDescription: 'Submit button is unresponsive',
      visual: 'broken-layout',
    },
    responses: [
      {
        label: 'Describe the symptom',
        quality: 'best',
        message: 'The submit button on the sign-up form doesn\'t respond when I click it. Nothing happens — no error, no loading state, no feedback. The form fields all work fine.',
        agentReaction: 'The agent immediately checks the button\'s onClick handler, finds it\'s missing the form submission logic, adds it, and confirms with a test.',
        rounds: 1,
      },
      {
        label: 'Guess the technical cause',
        quality: 'okay',
        message: 'I think the onClick event handler is broken. Can you fix the JavaScript?',
        agentReaction: 'The agent checks the onClick handler (which actually exists but calls the wrong function), gets confused by your diagnosis, checks multiple files, and eventually finds the real issue.',
        rounds: 3,
      },
      {
        label: 'Vague complaint',
        quality: 'poor',
        message: 'The form is broken. Fix it.',
        agentReaction: 'The agent asks "What exactly is broken about the form?" — you\'re back to square one. After two rounds of clarification, it finally understands and fixes it.',
        rounds: 4,
      },
    ],
    lesson: 'Describe what you see (or don\'t see) happening. The agent can diagnose the cause — that\'s its job.',
  },
  {
    id: 'wrong-colors',
    title: 'It Works, But It\'s Ugly',
    mockup: {
      description: 'The agent built your portfolio site. The layout is fine, but the colors are garish — bright green text on a purple background, and the fonts look like a default system font.',
      bugDescription: 'Bad color scheme and fonts',
      visual: 'ugly-output',
    },
    responses: [
      {
        label: 'Give specific visual feedback',
        quality: 'best',
        message: 'The layout structure is good, but the visual design needs work. The green-on-purple color scheme is hard to read. I\'d like a clean, minimal look — dark text on white/light gray background, with one accent color (something like a muted blue). Use a modern sans-serif font for headings and a readable serif for body text.',
        agentReaction: 'The agent updates the color palette and typography in one pass. The result matches your vision closely.',
        rounds: 1,
      },
      {
        label: 'Give a reference instead',
        quality: 'okay',
        message: 'This doesn\'t look professional. Can you make it look more like stripe.com — clean, modern, lots of whitespace?',
        agentReaction: 'The agent recognizes the Stripe aesthetic and applies a similar design language. It takes a revision to get the details right, but it\'s close.',
        rounds: 2,
      },
      {
        label: 'Just say it\'s bad',
        quality: 'poor',
        message: 'This looks terrible. Make it look better.',
        agentReaction: 'The agent makes changes, but "better" is subjective. It picks a different color scheme that\'s still not what you wanted. You go back and forth three times before landing on something acceptable.',
        rounds: 4,
      },
    ],
    lesson: 'For visual feedback, be specific about what you want (colors, fonts, mood) or give a reference site. "Make it better" is not actionable.',
  },
  {
    id: 'deploy-fail',
    title: 'It Works on My Computer',
    mockup: {
      description: 'Your app works perfectly when you test it locally. But when you deploy it to Vercel, you get a blank white page with "Application Error" in the console.',
      bugDescription: 'Deployment fails — blank page in production',
      visual: 'deploy-error',
    },
    responses: [
      {
        label: 'Share the error message',
        quality: 'best',
        message: 'The app works locally but shows a blank page after deploying to Vercel. The browser console shows: "ReferenceError: process is not defined" and the Vercel build log says "Build completed successfully" but there\'s a warning about "process.env used in client-side code."',
        agentReaction: 'The agent immediately identifies the issue — environment variables are accessed with process.env which doesn\'t exist in the browser. It switches to the correct Vite/Astro env pattern and redeploys.',
        rounds: 1,
      },
      {
        label: 'Describe without the error',
        quality: 'okay',
        message: 'My app works on localhost but when I deploy to Vercel I just get a white page. No idea why — the build says it succeeded.',
        agentReaction: 'The agent asks you to check the browser console and Vercel logs. After you share them, it identifies and fixes the environment variable issue.',
        rounds: 2,
      },
      {
        label: 'Panic',
        quality: 'poor',
        message: 'Deployment is broken!!! Everything was working and now nothing works. Help!',
        agentReaction: 'The agent asks what "broken" means, which platform, what changed. After multiple rounds of back-and-forth to gather basic info, it finally gets to the actual error.',
        rounds: 5,
      },
    ],
    lesson: 'Always share the exact error message. Copy-paste it. The error message is the single most useful thing you can give the agent.',
  },
  {
    id: 'wrong-data',
    title: 'The List Shows the Wrong Items',
    mockup: {
      description: 'You built a to-do app. When you add a new item and refresh the page, the items come back in random order instead of the order you added them. Some items from yesterday show up that you already deleted.',
      bugDescription: 'Items out of order + deleted items reappearing',
      visual: 'wrong-data',
    },
    responses: [
      {
        label: 'Describe the expected vs. actual behavior',
        quality: 'best',
        message: 'Two issues with the to-do list: (1) Items should show in the order I added them (newest first), but they appear in random order after refresh. (2) Items I deleted yesterday are showing up again. It seems like deletes aren\'t being saved permanently.',
        agentReaction: 'The agent checks the query (missing ORDER BY clause) and the delete function (wasn\'t actually calling the database delete). Both fixed in one pass.',
        rounds: 1,
      },
      {
        label: 'Report only one issue',
        quality: 'okay',
        message: 'The items are in the wrong order. They should be newest first.',
        agentReaction: 'The agent fixes the ordering. But you have to come back later about the delete bug, since you didn\'t mention it. Two separate fix cycles.',
        rounds: 2,
      },
      {
        label: 'Blame the agent',
        quality: 'poor',
        message: 'The database is messed up. You probably wrote the queries wrong.',
        agentReaction: 'The agent reviews all queries defensively, finds the issues, but your adversarial tone makes the conversation longer than it needs to be. It also adds unnecessary defensive error handling you didn\'t ask for.',
        rounds: 3,
      },
    ],
    lesson: 'Report all the symptoms you notice, and describe what you expected vs. what actually happened. More info upfront = fewer rounds.',
  },
  {
    id: 'missing-responsive',
    title: 'Looks Great on Desktop, Broken on Phone',
    mockup: {
      description: 'Your landing page looks polished on a laptop. But when you open it on your phone, the text overflows the screen, buttons are tiny, and the navigation menu is invisible.',
      bugDescription: 'Not mobile-friendly',
      visual: 'broken-layout',
    },
    responses: [
      {
        label: 'List the specific mobile issues',
        quality: 'best',
        message: 'The site looks great on desktop but breaks on mobile. Three specific issues: (1) Text extends past the right edge of the screen — need to fix overflow. (2) Buttons are too small to tap — they need to be at least 44px tall on mobile. (3) The navigation menu doesn\'t appear at all on small screens — probably needs a hamburger menu.',
        agentReaction: 'The agent addresses all three issues systematically: adds responsive text sizing, increases touch targets, and implements a mobile hamburger menu.',
        rounds: 1,
      },
      {
        label: 'Send a screenshot description',
        quality: 'okay',
        message: 'It looks broken on my phone. The text goes off screen and I can\'t find the menu. Can you make it responsive?',
        agentReaction: 'The agent adds responsive breakpoints and a mobile menu. It misses the button size issue since you didn\'t mention it — you catch that in the next round.',
        rounds: 2,
      },
      {
        label: 'Just say "make it responsive"',
        quality: 'poor',
        message: 'It doesn\'t work on mobile.',
        agentReaction: 'The agent adds basic responsive classes but doesn\'t know your specific pain points. The result is better but still not right — takes several rounds of "no, that\'s still wrong" to converge.',
        rounds: 4,
      },
    ],
    lesson: 'List specific issues you see. "Make it responsive" is too vague — the agent needs to know exactly what\'s wrong to fix it efficiently.',
  },
];
