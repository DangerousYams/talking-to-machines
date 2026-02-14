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
      "Write a formal email to my AP CS teacher Ms. Patel requesting a recommendation for MIT's summer STEM camp. Mention my robotics club leadership and the hackathon I won. Keep it professional. Deadline is April 1st.",
      "Write an email to my CS teacher Ms. Patel asking for a rec letter for Carnegie Mellon's Pre-College summer program. Mention the A* pathfinding project and helping others debug. Be respectful, give an easy out. Deadline March 15th.",
      "Write a warm, casual email to my favorite teacher Ms. Patel asking for a recommendation letter for a summer CS program. Mention that I love her class and I've grown a lot. Include 3 bullet points of my achievements. Deadline March 15th.",
      "Write an email asking my CS teacher for a rec letter for Carnegie Mellon's Pre-College program. Use a numbered list of 5 reasons she should write it. Tone: confident and persuasive. Mention my GPA and test scores.",
    ],
    correctIndex: 1,
    explanation: "Compare the details: the output mentions CMU (not MIT), references the A* project and debugging help (not robotics or hackathons), uses a gentle tone with an easy out (not 'confident and persuasive'), and has a numbered list of 2 reasons (not 3 bullet points or 5 reasons). Only option B matches all of these.",
  },
  {
    output: `def fibonacci(n):\n    """Return the nth Fibonacci number using memoization."""\n    memo = {0: 0, 1: 1}\n    \n    def fib(k):\n        if k not in memo:\n            memo[k] = fib(k - 1) + fib(k - 2)\n        return memo[k]\n    \n    return fib(n)`,
    outputType: "Python Code",
    options: [
      "Write a recursive Fibonacci function in Python that uses memoization with a nested helper function and dictionary cache. Include a one-line docstring.",
      "Write an iterative Fibonacci function in Python using a dictionary to store previously computed values. Include a docstring and type hints. Make it efficient for large inputs.",
      "Write a Fibonacci function in Python using the @functools.lru_cache decorator for memoization. Keep it clean and Pythonic with a docstring. Use recursion.",
      "Write a Fibonacci generator in Python that yields each number in the sequence using memoization. Use a nested function with a dictionary. Include a one-line docstring.",
    ],
    correctIndex: 0,
    explanation: "The output uses recursion with a nested helper (not iterative), a plain dictionary (not @lru_cache), returns a single value (not a generator), and has no type hints. Option B describes iterative code, C uses a decorator, and D describes a generator — none match the actual implementation.",
  },
  {
    output: `The sunset didn't fade — it shattered.\nGold cracked through the clouds like something\nbreaking open from inside,\nand for a moment the whole bay\nheld its breath in amber.\n\nI thought of you then.\nNot the you who left,\nbut the you who once stood here\nand said the light looked like forgiveness.`,
    outputType: "Poem",
    options: [
      "Write a rhyming poem about a sunset over the ocean that evokes nostalgia. Use gold and amber imagery. Two stanzas, 10 lines. End with a line about memory.",
      "Write a short, emotional free verse poem about watching a sunset alone on a beach. Use cold blue and silver tones. Under 10 lines. End with acceptance of loss.",
      "Write a free verse poem about a sunset and being reminded of someone. Gold and amber imagery. Under 10 lines. End with a memory of something the person said.",
      "Write an emotional poem about watching a sunset with a loved one. Vivid warm imagery, gold and amber tones. Free verse, no rhyming. Include dialogue between two people.",
    ],
    correctIndex: 2,
    explanation: "The output is free verse (not rhyming — eliminates A), uses gold/amber (not blue/silver — eliminates B), the speaker is alone remembering someone (not watching with them — eliminates D), and ends with a remembered quote. Only C captures all of these: free verse, gold/amber, memory of someone, ends with what they said.",
  },
  {
    output: `**Why Your School's Phone Ban Misses the Point**\n\nBanning phones in class treats the symptom, not the disease. Students aren't distracted because phones exist — they're distracted because sitting through a 50-minute lecture on mitosis with zero interaction is genuinely boring.\n\nHere's what the research actually says: **the problem isn't the device, it's the lack of engagement.** Schools with project-based learning and student-driven discussions report 40% fewer phone issues — without banning anything.\n\nTaking away phones teaches students one thing: that adults would rather remove temptation than build something worth paying attention to.`,
    outputType: "Opinion Piece",
    options: [
      "Write a 100-word opinion piece arguing that phone bans are necessary but poorly implemented. Use student mental health data as your main evidence. Bold the conclusion. Tone: measured and academic.",
      "Write a 300-word persuasive essay arguing against school phone bans. Include 3 counterarguments with sources. Use bold headings for each section. Tone: sharp but not disrespectful.",
      "Write a 100-word opinion piece arguing school phone bans address the wrong problem. Use boredom and engagement data as counterpoints. Bold the key thesis. Tone: sharp but not disrespectful.",
      "Write a 100-word opinion piece about phones in schools from a student's perspective. Use personal anecdotes and emotional appeals. Bold the opening line. Tone: passionate and rebellious.",
    ],
    correctIndex: 2,
    explanation: "The output argues bans are wrong (not 'necessary but poorly implemented' — eliminates A), is ~100 words (not 300 — eliminates B), frames around engagement data (not personal anecdotes — eliminates D), and bolds a mid-piece thesis (not the opening line). C is the only match.",
  },
  {
    output: `| Feature | Notion | Obsidian |\n|---------|--------|----------|\n| Pricing | Free tier + $8/mo | Free (core) + $50/yr sync |\n| Offline | Limited | Full offline |\n| Data ownership | Cloud (Notion servers) | Local markdown files |\n| Collaboration | Excellent real-time | Limited (paid sync) |\n| Learning curve | Low — intuitive UI | Medium — markdown + plugins |\n| Best for | Teams & project management | Personal knowledge base |`,
    outputType: "Comparison Table",
    options: [
      "Compare Notion and Obsidian in a table. Include 8 rows covering pricing, offline, data, collaboration, learning curve, mobile apps, integrations, and best use case. Be detailed in each cell.",
      "Compare Notion, Obsidian, and Roam Research in a 6-row table covering pricing, offline support, data ownership, collaboration, learning curve, and best use case. Keep cells concise.",
      "Compare Notion and Obsidian in a table with 6 rows covering pricing, offline support, data ownership, collaboration, learning curve, and best use case. Keep each cell under 6 words.",
      "Compare Notion and Obsidian as a pros/cons list with 6 categories: pricing, offline support, data ownership, collaboration, learning curve, and best use case. Bold the winner in each category.",
    ],
    correctIndex: 2,
    explanation: "The output has exactly 6 rows (not 8 — eliminates A), compares 2 tools (not 3 — eliminates B), uses a table format (not a pros/cons list — eliminates D), and every cell is ultra-concise. C is the only prompt that specifies the exact row count, the two tools, table format, AND the brevity constraint.",
  },
];
