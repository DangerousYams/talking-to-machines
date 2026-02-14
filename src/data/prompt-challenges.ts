export interface PromptChallenge {
  output: string;
  outputType: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const promptChallenges: PromptChallenge[] = [
  {
    output: `Subject: Rec Letter Request — Summer CS Program\n\nHi Ms. Patel,\n\nI hope your week is going well! I'm applying to Carnegie Mellon's Pre-College CS program this summer and wanted to ask if you'd be willing to write me a recommendation letter.\n\nI thought you'd be a great fit because:\n1. Your AP CS class is where I first got excited about algorithms — especially the pathfinding project where I built the A* visualizer.\n2. You've seen me go from struggling with recursion to helping other students debug theirs.\n\nThe deadline is March 15th, and I've attached the form. Totally understand if you're too busy — no pressure at all.\n\nThank you so much,\nJordan`,
    outputType: "Email to a Teacher",
    options: [
      "Write an email asking my teacher for a recommendation",
      "Write an email to my CS teacher Ms. Patel asking for a rec letter for Carnegie Mellon's Pre-College summer program. Mention specific class experiences (A* pathfinding project, helping others debug). Be respectful and give an easy out. Keep it under 120 words. Deadline is March 15th.",
      "Write a polite email to my teacher about a recommendation letter for a summer program",
      "Help me ask my teacher for a letter of recommendation. Make it sound nice and professional.",
    ],
    correctIndex: 1,
    explanation: "The winning prompt specifies the teacher's name (Ms. Patel), the exact program (CMU Pre-College CS), specific experiences to reference (A* project, helping debug), tone (respectful with an easy out), format constraints (under 120 words), and a key detail (March 15th deadline). The output's specificity — naming real projects, showing growth — only comes from a prompt with that level of detail.",
  },
  {
    output: `def fibonacci(n):\n    """Return the nth Fibonacci number using memoization."""\n    memo = {0: 0, 1: 1}\n    \n    def fib(k):\n        if k not in memo:\n            memo[k] = fib(k - 1) + fib(k - 2)\n        return memo[k]\n    \n    return fib(n)`,
    outputType: "Python Code",
    options: [
      "Write a Fibonacci function",
      "Write Python code for Fibonacci numbers. Make it efficient and add a docstring. Use memoization with a dictionary, not recursion limits.",
      "Can you help me with a coding problem about Fibonacci?",
      "Write a recursive Fibonacci function in Python that uses memoization with a nested helper function and dictionary cache. Include a one-line docstring.",
    ],
    correctIndex: 3,
    explanation: "Look at how specific the output is: recursive with a nested helper, dictionary-based memoization, one-line docstring. Only the last prompt specifies ALL of these implementation details. The second option is close but doesn't mention the nested function pattern.",
  },
  {
    output: `The sunset didn't fade — it shattered.\nGold cracked through the clouds like something\nbreaking open from inside,\nand for a moment the whole bay\nheld its breath in amber.\n\nI thought of you then.\nNot the you who left,\nbut the you who once stood here\nand said the light looked like forgiveness.`,
    outputType: "Poem",
    options: [
      "Write a poem about a sunset",
      "Write a short, emotional poem about watching a sunset and being reminded of someone. Use vivid imagery with gold and amber tones. Free verse, no rhyming. Under 10 lines. End with a memory of something the person said.",
      "Write a really beautiful poem. Make it emotional and deep.",
      "Write a free verse poem about nature and lost love",
    ],
    correctIndex: 1,
    explanation: "The output has very specific qualities: sunset + memory of someone, gold/amber color palette, free verse, under 10 lines, ends with a quoted memory. Only one prompt specifies all of these constraints. \"Beautiful and deep\" gives no actionable direction.",
  },
  {
    output: `**Why Your School's Phone Ban Misses the Point**\n\nBanning phones in class treats the symptom, not the disease. Students aren't distracted because phones exist — they're distracted because sitting through a 50-minute lecture on mitosis with zero interaction is genuinely boring.\n\nHere's what the research actually says: **the problem isn't the device, it's the lack of engagement.** Schools with project-based learning and student-driven discussions report 40% fewer phone issues — without banning anything.\n\nTaking away phones teaches students one thing: that adults would rather remove temptation than build something worth paying attention to.`,
    outputType: "Opinion Piece",
    options: [
      "Write about phones in school",
      "Write a hot take about school rules",
      "Write a 100-word opinion piece arguing that school phone bans address the wrong problem. Use boredom and engagement data as counterpoints. Bold your key thesis statement. Tone: sharp but not disrespectful.",
      "Write a short essay about why banning phones in schools is a bad idea",
    ],
    correctIndex: 2,
    explanation: "The output is exactly ~100 words, frames the argument around engagement (not just 'phones good'), bolds a key thesis, and maintains a sharp-but-respectful tone. These are all explicit constraints in the correct prompt. The other options would produce much vaguer, longer responses.",
  },
  {
    output: `| Feature | Notion | Obsidian |\n|---------|--------|----------|\n| Pricing | Free tier + $8/mo | Free (core) + $50/yr sync |\n| Offline | Limited | Full offline |\n| Data ownership | Cloud (Notion servers) | Local markdown files |\n| Collaboration | Excellent real-time | Limited (paid sync) |\n| Learning curve | Low — intuitive UI | Medium — markdown + plugins |\n| Best for | Teams & project management | Personal knowledge base |`,
    outputType: "Comparison Table",
    options: [
      "Compare Notion and Obsidian in a table with 6 rows covering pricing, offline support, data ownership, collaboration, learning curve, and best use case. Keep each cell under 6 words.",
      "Tell me about Notion vs Obsidian",
      "What's better, Notion or Obsidian? Give me a comparison.",
      "Make a table comparing note-taking apps",
    ],
    correctIndex: 0,
    explanation: "The output is a precise 6-row table with exactly the specified categories, and every cell is concise (under 6 words). This level of structural precision only comes from a prompt that explicitly defines the rows, format, and brevity constraint.",
  },
];
