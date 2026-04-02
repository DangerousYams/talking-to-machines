// FR translations for Chapter 7
// Auto-generated stub — uses English fallbacks until translated
const translations: Record<string, Record<string, string>> = {
  ch7: {
  // === TerminalPlayground ===
  terminalTitle: 'Terminal Playground',
  terminalSubtitle: 'Watch Claude Code think, write, and run',
  terminalPickTask: 'Pick a task and watch how Claude Code breaks it down, writes the code, and verifies it works.',
  tryAnotherTask: 'Try another task',
  filesLabel: 'FILES',
  filesMobileButton: 'Files',
  writeLabel: 'WRITE',

  // Terminal presets
  presetCountdownLabel: 'Create a React countdown timer',
  presetCountdownDesc: 'Build a reusable countdown component with start/pause controls',
  presetBugLabel: 'Fix the login bug',
  presetBugDesc: 'Diagnose and fix a broken authentication flow',
  presetDarkmodeLabel: 'Add dark mode to the app',
  presetDarkmodeDesc: 'Implement a system-aware dark mode toggle with persistence',

  // Terminal step texts (thinking only - code/commands stay in English)
  thinkingReadingProject: 'Reading project structure and understanding the codebase...',
  thinkingPlanCountdown: 'Planning: Create a CountdownTimer component with useState and useEffect hooks, start/pause/reset controls, and formatted time display.',
  successCountdown: 'CountdownTimer component created with start, pause, and reset controls. Ready at localhost:5173.',
  thinkingReadingLogin: 'Reading src/auth/login.ts and src/auth/session.ts...',
  thinkingFoundBug: 'Found the bug: the login handler awaits fetchUser() but never checks for a null response before setting the session token. When the API returns 401, the code crashes.',
  successBugFix: 'Bug fixed: Added null check and proper error handling for failed API responses. All 3 tests passing.',
  thinkingReadingStyles: 'Reading existing styles and component structure...',
  thinkingPlanDarkMode: 'Plan: 1) Create a useDarkMode hook with localStorage persistence, 2) Add CSS custom properties for dark theme, 3) Build a toggle button component.',
  successDarkMode: 'Dark mode added with system preference detection, localStorage persistence, and smooth CSS transitions.',

  // === SkillBuilder ===
  skillBuilderTitle: 'Skill Builder',
  skillBuilderSubtitle: 'Write reusable instructions for Claude Code',
  claudeMdLabel: 'CLAUDE.md',
  editedLabel: 'edited',
  validationLabel: 'Validation',
  triggerLabel: 'Trigger',
  stepsLabel: 'Steps',
  examplesLabel: 'Examples',
  hasClearTrigger: 'Has clear trigger',
  stepsAreSpecific: 'Steps are specific',
  includesExamples: 'Includes examples',
  testLabel: 'Test',
  testScenarioLabel: 'Test Scenario',
  userRequestLabel: 'User Request',
  requestPrefix: 'Request:',
  viewFullOutput: 'View full output',

  // Skill templates
  templateReactComponent: 'React Component Generator',
  templateTestWriter: 'Test Writer',
  templateDocGenerator: 'Documentation Generator',

  // Test tasks
  testTaskReact: 'Create a UserProfile component that shows an avatar, name, and bio',
  testTaskTest: 'Write tests for utils/formatDate.ts',
  testTaskDoc: 'Document the auth module',

  // === RefactorRace ===
  refactorRaceTitle: 'Refactor Race',
  refactorRaceSubtitle: 'You vs. Claude Code -- clean up this messy function',
  refactorRaceIntro: 'Below is a function with cryptic variable names, no types, and a hand-written bubble sort. Your job: refactor it into something readable. Claude Code will be doing the same thing beside you.',
  startRefactoring: 'Start Refactoring',
  yourTurn: 'Your Turn',
  doneButton: 'Done',
  finishedAt: 'Finished at',
  claudeCodeLabel: 'Claude Code',
  imDone: "I'm Done",
  yourCodeTab: 'Your Code',
  aiTab: 'AI',

  // Done phase
  yourVersion: 'Your Version',
  claudeCodeVersion: 'Claude Code Version (~5.5s)',
  readabilityLabel: 'Readability',
  linesOfCode: 'Lines of Code',
  namingLabel: 'Naming',
  youDecide: 'You decide',
  typesAndComments: 'Types + comments',
  linesLabel: 'lines',
  yourChoice: 'Your choice',
  descriptiveNames: 'Descriptive names',
  youLabel: 'You',
  aiLabel: 'AI',
  pointNotSpeed: 'The point is not who finishes first.',
  pointNotSpeedBody: "Claude Code is fast, but speed is not the skill. The skill is looking at both versions and judging which one you would actually ship. Can you read it? Does it handle edge cases? Would your teammate understand it at 2 AM? That judgment is yours alone.",
  pointNotSpeedMobile: 'Speed is not the skill. The skill is judging which version you would ship. That judgment is yours alone.',
  compareCode: 'Compare Code',
  retryButton: 'Retry',
  tryAgain: 'Try Again',
  codeComparison: 'Code Comparison',

  // Metrics (mobile)
  metricLines: 'Lines',
  metricTime: 'Time',
  metricNames: 'Names',
  metricTyped: 'Typed',

  // === WhatWouldYouBuild ===
  whatWouldYouBuildTitle: 'What Would You Build?',
  projectsCount: 'projects built by people like you',
  noProjectsInCategory: 'No projects in this category yet.',
  yourTurnHeading: 'Your turn',
  yourTurnPromptMobile: 'What problem would you solve with personal software?',
  yourTurnPromptDesktop: 'What problem in your life would you solve with personal software? Describe the tool you wish existed.',
  ideaPlaceholder: "I'd build an app that...",
  saveIdea: 'Save idea',
  savedConfirmationMobile: "Saved! You'll use this in Chapter 11.",
  savedConfirmationDesktop: "Idea saved! You'll use this in Chapter 11.",
  builderLabel: 'Builder',
  builtBy: 'Built by',
  techStack: 'Tech Stack',
  timeEstimate: 'Time estimate:',
  feasibilityWeekend: 'Weekend build',
  feasibilityWeek: 'One-week project',
  feasibilityMonth: 'Month-long build',
  footerInspiration: 'Every one of these was built by someone who started with just an idea.',

  // === Ch7FlipCards ===
  claudeCodeKeyFact: "Claude Code follows a loop: Read your codebase \u2192 Plan changes \u2192 Write code \u2192 Run it \u2192 Fix errors. CLAUDE.md is the permanent instruction set that shapes every interaction.",
  skillsKeyFact: "A skill has three parts: Trigger (when to activate), Steps (what to do), Examples (what good looks like). One skill definition replaces hundreds of repeated explanations.",

  flipLabelClaudeCode: 'Why did that work? How Claude Code Thinks',
  flipLabelSkills: 'Why did that work? Building Skills',
  flipLabelSkillParadox: 'Why did that work? The Skill Paradox',
  backTitleClaudeCode: 'How Claude Code Thinks',
  backTitleSkills: 'Building Skills (T-S-E Framework)',
  backTitleSkillParadox: 'The Skill Paradox',

  // ClaudeCode Back
  ccBackIntro: "Claude Code isn't a chatbot that writes code. It's an agentic loop \u2014 a system that reads, plans, writes, runs, and fixes, cycling until the task is done.",
  ccReadName: 'Read',
  ccReadText: 'Scans your files, understands your architecture, reads CLAUDE.md for project rules.',
  ccPlanName: 'Plan',
  ccPlanText: 'Breaks the task into steps, decides which files to touch and in what order.',
  ccWriteName: 'Write',
  ccWriteText: 'Generates code across multiple files \u2014 not snippets, but coherent, connected changes.',
  ccRunName: 'Run',
  ccRunText: 'Executes the code, runs tests, checks for errors. If something breaks, loops back to fix it.',
  ccFixName: 'Fix',
  ccFixText: 'Reads the error, diagnoses the cause, writes a patch, and runs again. Automatically.',
  ccBackNote: "It sees your entire project \u2014 not just the file you're editing. And CLAUDE.md is your project's constitution: permanent instructions that shape every interaction. Think of it as the system prompt for your codebase.",

  // Skills Back
  skillsBackIntro: "A skill is a reusable instruction set \u2014 a recipe that tells Claude Code exactly how to handle a category of task. Every skill follows the T-S-E framework:",
  skillsTriggerName: 'Trigger',
  skillsTriggerText: 'When should this skill activate? e.g., "when asked to create a React component"',
  skillsStepsName: 'Steps',
  skillsStepsText: 'What should it do? A numbered list of specific actions, in order.',
  skillsExamplesName: 'Examples',
  skillsExamplesText: 'What does good output look like? Concrete input/output pairs that anchor quality.',
  skillsTemplatesLabel: 'Pre-loaded templates to start from:',
  skillsBackFooter: 'One skill definition replaces hundreds of repeated explanations. Write it once, use it forever.',

  // Skill Paradox Back
  paradoxIntro: "Here's the paradox nobody warns you about: AI makes coding faster, but it doesn't eliminate the need to understand code.",
  paradoxQuote: "The tool is only as good as the human steering it. If you can't read what Claude generates, you can't tell the difference between working code and plausible-looking nonsense.",
  paradoxWorkflowLabel: 'The fundamental workflow:',
  paradoxSpecify: 'Specify.',
  paradoxSpecifyDesc: 'Be ruthlessly clear about what you want. Ambiguity is the enemy.',
  paradoxGenerate: 'Generate.',
  paradoxGenerateDesc: 'Let Claude Code do the typing. It handles the boilerplate, the syntax, the wiring.',
  paradoxVerify: 'Verify.',
  paradoxVerifyDesc: 'Read, test, and judge the result. This is where your knowledge matters most.',
  paradoxMiddle: "You need enough knowledge to evaluate output, not to write every line. That's the skill paradox \u2014 AI lowers the floor for producing code, but raises the bar for judging it.",
  paradoxClosing: "The people who thrive with AI coding tools aren't the ones who type the least. They're the ones who think the most clearly about what needs to exist \u2014 and can tell when the output is right.",
  },
};

export default translations;
