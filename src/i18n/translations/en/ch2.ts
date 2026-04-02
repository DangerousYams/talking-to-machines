export default {
  /* ═══════════════════════════════════════════════
     PROMPT LABORATORY
     ═══════════════════════════════════════════════ */
  promptLaboratory: {
    // Header
    title: 'Prompt Laboratory',
    titleShort: 'Prompt Lab',
    subtitle: 'Toggle technique blocks to build a sophisticated prompt',

    // Mode tabs
    modeGuided: 'GUIDED',
    modeLiveAi: 'LIVE AI',

    // Template labels
    templateCreative: 'Creative Writing',
    templateCode: 'Code Generation',
    templateResearch: 'Research',
    templateDebate: 'Debate Prep',

    // Block labels
    blockSystemRole: 'System Role',
    blockContext: 'Context',
    blockExamples: 'Examples (few-shot)',
    blockTask: 'Task',
    blockFormat: 'Format',
    blockConstraints: 'Constraints',
    blockChainOfThought: 'Chain-of-Thought',

    // Block content — Creative
    roleCreative: 'You are an award-winning poet known for vivid sensory imagery and unexpected metaphors.',
    contextCreative: 'I\'m a high school student working on a poetry portfolio for my creative writing class. The theme is "transitions."',
    examplesCreative: 'Here\'s the style I\'m going for:\n"October stripped the trees / and left their bones / whispering to a wind / that had already moved on."\nI like this mix of personification and melancholy.',
    taskCreative: 'Write a poem about autumn — specifically the moment when the season shifts and you can feel it in the air for the first time.',
    formatCreative: 'Free verse, 12–20 lines. No rhyming. Use line breaks intentionally — each break should create a pause or shift.',
    constraintsCreative: 'Avoid clichés like "golden leaves" or "crisp air." No abstract nouns in the first 4 lines — ground it in physical sensory detail.',
    cotCreative: 'Before writing, think through: What specific sensory details mark the shift from summer to autumn? What emotions does that transition evoke? What metaphor captures it freshly?',

    // Block content — Code
    roleCode: 'You are a senior software engineer who writes clean, well-commented code and explains your reasoning.',
    contextCode: 'I\'m building a personal project — a weather dashboard app using React. I\'m comfortable with JavaScript but new to TypeScript.',
    examplesCode: 'Here\'s the pattern I want:\n```\nfunction getWeather(city: string): Promise<Weather> {\n  // Validate input\n  // Fetch from API\n  // Transform response\n  // Handle errors\n}\n```\nI want each function to follow this commented-skeleton pattern.',
    taskCode: 'Write a React component called WeatherCard that displays the current temperature, conditions, and a 5-day forecast. Include TypeScript types.',
    formatCode: 'A single .tsx file with: TypeScript interface at the top, component function, and brief JSDoc comments. Use Tailwind CSS for styling.',
    constraintsCode: 'No class components. No any types. Handle loading and error states. Don\'t use external libraries beyond React and Tailwind.',
    cotCode: 'Think step by step: First, define the data types. Then, plan the component structure. Then, implement each section. Finally, add error handling.',

    // Block content — Research
    roleResearch: 'You are a research analyst who synthesizes complex topics into clear, evidence-based summaries.',
    contextResearch: 'I\'m writing a 5-page paper for my AP Environmental Science class. My teacher values nuance over simple pro/con arguments.',
    examplesResearch: 'Here\'s the level of nuance I\'m aiming for:\n"While deforestation rates in the Amazon fell 33% between 2004 and 2012 due to satellite monitoring, enforcement lapses after 2019 suggest that policy alone — without institutional will — cannot sustain progress."',
    taskResearch: 'Write a 500-word analysis of how satellite-based deforestation monitoring has changed conservation outcomes in the Amazon rainforest.',
    formatResearch: 'Structure: Opening hook → Background (2 paragraphs) → Analysis of effectiveness → Limitations → Conclusion. Use topic sentences.',
    constraintsResearch: 'Cite at least 3 specific data points. Don\'t use "both sides" framing — take a nuanced position. Avoid passive voice.',
    cotResearch: 'Reason through this step by step: First, establish what deforestation monitoring looked like before satellites. Then, analyze the key turning points. Then, evaluate current effectiveness.',

    // Block content — Debate
    roleDebate: 'You are a debate coach who builds strong arguments from multiple perspectives.',
    contextDebate: 'I\'m preparing for a Model UN conference. I\'ve been assigned to represent Brazil on the topic of deforestation policy.',
    examplesDebate: 'Here\'s how I want to frame arguments:\nClaim: "Brazil\'s sovereignty over the Amazon must be balanced with its role as a global carbon sink."\nEvidence: [specific data point]\nImplication: [why this matters for the debate resolution]',
    taskDebate: 'Write an opening statement (2 minutes) for Brazil\'s position on balancing economic development with rainforest preservation.',
    formatDebate: 'Structure: Greeting → Position statement → 3 key arguments with evidence → Call to action. Keep sentences punchy for oral delivery.',
    constraintsDebate: 'Don\'t concede Brazil\'s right to develop. Don\'t use emotional appeals without data. Stay in character as Brazil\'s representative.',
    cotDebate: 'Think through your argument structure first: What is Brazil\'s strongest position? What counterarguments will you face? How do you preempt them?',

    // System prompts
    systemPromptCreative: 'You are a skilled creative writing assistant. Help with poetry and prose. Keep responses focused and artful.',
    systemPromptCode: 'You are an expert software engineer. Write clean, well-typed code with clear explanations. Use TypeScript and React best practices.',
    systemPromptResearch: 'You are a research analyst. Provide evidence-based, nuanced analysis with specific data points.',
    systemPromptDebate: 'You are a debate coach. Help construct compelling arguments with evidence and rhetorical structure.',

    // Quality meter
    sophisticationLabel: 'Sophistication',
    qualityExpert: 'Expert',
    qualityStrong: 'Strong',
    qualityBasic: 'Basic',
    qualityMinimal: 'Minimal',

    // Freeform mode
    yourPrompt: 'Your Prompt',
    placeholderFreeform: 'Type your prompt here...',
    placeholderFreeformLong: 'Type your prompt here — or switch to Guided mode to build one with technique blocks, then come back to edit and send it...',
    sendToClaude: 'Send to Claude',
    running: 'Running...',
    generating: 'Generating...',
    viewAiResponse: 'View AI Response',
    aiResponseLabel: 'AI Response',
    liveResponseLabel: 'Live Response',
    qualityPrefix: 'Quality:',
    emptyFreeformHint: 'Write a prompt and hit send to see a real AI response...',
    cmdEnterHint: 'Cmd+Enter to send · Try building in Guided mode first, then editing here',

    // Footer insight
    tryItLabel: 'Try it: ',
    tryItFreeform: 'Edit the prompt freely and send it to Claude. Try removing sections, rewriting in your own words, or asking something completely different.',
    tryItGuided: 'Toggle blocks on and off to see how each technique changes the AI\'s output. Start with just Task, then add techniques one at a time.',

    // Footer count
    techniquesActive: 'techniques active',
    of: 'of',
  },

  /* ═══════════════════════════════════════════════
     FLIP THE SCRIPT
     ═══════════════════════════════════════════════ */
  flipTheScript: {
    // Header
    title: 'Flip the Script',
    subtitle: 'What happens when the AI interviews you first?',

    // Choose phase
    chooseIntroDesktop: 'Pick a goal. Instead of giving you a generic answer, the AI will ask you <strong>5 clarifying questions</strong> first. Watch how much better the result gets.',
    chooseIntroMobile: 'Pick a goal. The AI asks 5 questions first.',

    // Scenario labels
    scenarioParty: 'Plan a birthday party',
    scenarioStudy: 'Study for a history exam',
    scenarioYoutube: 'Start a YouTube channel',

    // Custom goal
    customGoalPlaceholder: 'Or type your own goal...',
    customGoalButton: 'Go',

    // Questioning phase
    typeYourAnswer: 'Type your answer...',
    answerButton: 'Answer',
    doneButton: 'Done',
    questionXofY: 'Question {current} of {total}',
    pressEnter: 'press Enter to submit',
    viewChatHistory: 'View chat history ({count} Q&A)',
    skipped: '(skipped)',

    // Result phase
    personalizedResult: 'Your personalized result',
    generatingPlan: 'Generating your personalized plan...',
    generatingMobile: 'Generating...',
    compareResults: 'Compare Results',
    compareDesktop: 'Compare: What would a vague prompt have gotten?',
    restart: 'Restart',
    tryAnother: 'Try Another Scenario',

    // Comparison
    vaguePromptLabel: 'Vague prompt',
    afterQuestionsLabel: 'After 5 questions',
    sameGoalPlusAnswers: 'Same goal + your 5 answers',
    socraticInsight: '<strong>The Socratic Method works.</strong> Five questions turned a generic checklist into a plan built around <em>your</em> specific situation.',
    socraticInsightDesktop: '<strong>The Socratic Method works.</strong> Five questions turned a generic checklist into a plan built around <em>your</em> specific situation. The AI didn\'t get smarter — it just had better context.',
    vagueGenericFallbackMobile: 'Without clarifying questions, the AI would have given you a generic checklist -- no details about your situation.',
    vagueGenericFallbackDesktop: 'Without clarifying questions, the AI would have given you a generic checklist — accurate but impersonal.',

    // Sheet titles
    chatHistoryTitle: 'Chat History',
    vagueVsSocraticTitle: 'Vague vs. Socratic',

    // Scenario: Party — vague prompt/response
    partyVaguePrompt: 'Plan a birthday party for me.',
    partyVagueResponse: "Sure! Here's a general birthday party plan:\n\n1. Choose a venue (your home, a restaurant, or a park)\n2. Pick a theme\n3. Send invitations 2 weeks ahead\n4. Plan food and drinks\n5. Prepare decorations\n6. Organize activities or games\n7. Get a cake\n8. Create a playlist\n\nWould you like me to go into more detail on any of these?",
    partyQ1: "Who's the party for, and how old are they turning?",
    partyQ2: "How many people are you inviting — a small group or a big bash?",
    partyQ3: "What's the vibe? Chill hangout, themed event, or all-out celebration?",
    partyQ4: "Do you have a budget in mind? Even a rough range helps.",
    partyQ5: "Are there any must-haves or deal-breakers? (dietary needs, accessibility, etc.)",
    partyP1: 'e.g., My best friend Mia, turning 16',
    partyP2: 'e.g., About 12–15 close friends',
    partyP3: 'e.g., Cozy movie night vibe',
    partyP4: 'e.g., Around $200 total',
    partyP5: 'e.g., One friend is gluten-free, we need it accessible by bus',

    // Scenario: Study — vague prompt/response
    studyVaguePrompt: 'Help me study for my history exam.',
    studyVagueResponse: "Here are some tips for studying for a history exam:\n\n1. Review your notes and textbook chapters\n2. Make flashcards for key dates and events\n3. Create a timeline of important events\n4. Practice with past exam questions\n5. Study in short sessions with breaks\n6. Form a study group\n7. Focus on understanding causes and effects\n\nGood luck on your exam!",
    studyQ1: "What period or topic does the exam cover?",
    studyQ2: "What format is the exam — multiple choice, essays, or a mix?",
    studyQ3: "When is the exam, and how much study time do you have?",
    studyQ4: "What's the part you find trickiest or most confusing?",
    studyQ5: "How does your teacher usually frame questions — factual recall or analysis?",
    studyP1: 'e.g., The French Revolution through Napoleon',
    studyP2: 'e.g., 30 multiple choice + 2 short essays',
    studyP3: 'e.g., Next Thursday, so about 5 days',
    studyP4: 'e.g., I mix up the different phases and who was in charge when',
    studyP5: 'e.g., She loves "why did X happen" and cause-effect chains',

    // Scenario: YouTube — vague prompt/response
    youtubeVaguePrompt: 'Help me start a YouTube channel.',
    youtubeVagueResponse: "Starting a YouTube channel is exciting! Here's how:\n\n1. Choose your niche\n2. Create a Google/YouTube account\n3. Design your channel art and logo\n4. Plan your content calendar\n5. Invest in good equipment (camera, microphone, lighting)\n6. Learn basic video editing\n7. Be consistent with uploads\n8. Engage with your audience\n9. Use SEO and keywords\n10. Be patient — growth takes time!\n\nLet me know if you want more details on any step!",
    youtubeQ1: "What kind of content excites you? What could you talk about for hours?",
    youtubeQ2: "Who's your dream audience — who specifically are you making this for?",
    youtubeQ3: "What equipment do you have right now? (phone, computer, etc.)",
    youtubeQ4: "How much time per week can you realistically spend on this?",
    youtubeQ5: "Is there a channel you admire that you'd love your style to feel like?",
    youtubeP1: 'e.g., Explaining science concepts with experiments',
    youtubeP2: 'e.g., Curious teens who think science is boring in school',
    youtubeP3: 'e.g., iPhone 14 and a MacBook, no external mic',
    youtubeP4: 'e.g., About 5-6 hours on weekends',
    youtubeP5: 'e.g., Mark Rober meets Kurzgesagt — fun but smart',

    // System prompt (AI instructions)
    systemPrompt: `You are a friendly planning assistant. The user will state a goal. Do NOT start planning immediately. Instead, ask exactly 5 specific clarifying questions, ONE at a time. After collecting all 5 answers, produce a short, actionable plan.

Rules:
- Ask only ONE question per message. Keep each question to 1-2 sentences.
- Make questions specific and practical.
- After the 5th answer, write a plan that is 8-12 bullet points MAX, using short plain sentences.
- The final plan should fit on one screen — no sections, no sub-lists, no elaborate breakdowns.
- Keep a warm, conversational tone. Write like a helpful friend, not a consultant.
- Number your questions (1/5, 2/5, etc.)
- Do NOT use markdown formatting — no bold, no asterisks, no headers, no hashtags. Plain text only.`,
    finalAnswerPrompt: 'That was my 5th answer. Now produce the final plan.',
  },

  /* ═══════════════════════════════════════════════
     DEBUG THE PROMPT
     ═══════════════════════════════════════════════ */
  debugThePrompt: {
    // Header
    title: 'Debug the Prompt',
    subtitle: 'Find and diagnose the bugs in each prompt',

    // Difficulty levels
    levelEasy: 'Easy',
    levelMedium: 'Medium',
    levelHard: 'Hard',

    // Bug types
    bugAmbiguous: 'Ambiguous',
    bugContradictory: 'Contradictory',
    bugMissingContext: 'Missing context',
    bugTooManyTasks: 'Too many tasks',
    bugLeadingQuestion: 'Leading question',

    // Interaction labels
    tapHighlightedIssues: 'Tap the highlighted issues',
    clickHighlightedIssues: 'The prompt — click the highlighted issues',
    whatIsWrong: 'What\'s wrong with this part?',
    correct: 'Correct!',
    notQuiteIts: 'Not quite — it\'s',
    youSaid: 'you said:',
    resultingOutput: 'Resulting output',
    bugsFound: 'bugs found',
    bugsCorrect: 'correct',
    ofBugs: 'of',
    seeFixedVersion: 'See the Fixed Version',
    viewFixedVersion: 'View Fixed Version',
    allBugsFound: 'All bugs found!',
    viewFixedDesc: 'View the fixed version in the sheet below, then continue.',
    nextChallenge: 'Next Challenge',
    seeFinalResults: 'See Final Results',

    // Comparison labels
    buggyPromptLabel: 'Buggy prompt',
    fixedPromptLabel: 'Fixed prompt',
    improvedOutput: 'Improved output',
    buggyVsFixed: 'Buggy vs. Fixed',

    // Game complete
    debuggingComplete: 'Debugging Complete',
    completedAllLevels: 'You\'ve worked through all three difficulty levels.',
    hardestBugInsight: 'The hardest bugs to spot aren\'t contradictions — they\'re <em>leading questions</em> that make the AI confirm what you already believe.',
    playAgain: 'Play Again',

    // Challenge 1 (Easy) — prompt & output
    easyPrompt: 'Write something about dogs. Make it short but also really detailed and comprehensive. Include everything important. Use a fun tone but keep it professional and formal.',
    easyBadOutput: "Dogs are wonderful pets that have been companions to humans for thousands of years. They come in many breeds, sizes, and temperaments. Dogs require regular exercise, proper nutrition, veterinary care, and socialization. They are known for their loyalty, intelligence, and ability to form strong bonds with their owners.\n\nFrom small breeds like Chihuahuas to large breeds like Great Danes, there's a dog for every lifestyle. Training is important for all dogs, and positive reinforcement methods tend to work best.\n\nOverall, dogs make great additions to families who are prepared for the responsibility of pet ownership.",
    easyFixedPrompt: 'Write a 150-word blog post introducing first-time dog owners to the three most important things to know before adopting a puppy. Tone: friendly and encouraging, like advice from an experienced friend.',
    easyFixedOutput: "So you're thinking about getting a puppy? Amazing. Here are three things nobody tells you until it's too late.\n\n**Puppies are land sharks.** Those tiny teeth are razor-sharp, and everything — your shoes, your couch, your fingers — is a chew toy. Stock up on actual chew toys before they come home, and start bite-inhibition training from day one.\n\n**Sleep deprivation is real.** Puppies need to go outside every 2-3 hours at first, including at night. It's like having a furry newborn. The good news: most dogs sleep through the night within a few weeks.\n\n**Socialization has a deadline.** The window between 3-14 weeks is critical. Expose your puppy to different people, sounds, surfaces, and (vaccinated) dogs during this period. A well-socialized puppy becomes a confident adult dog.\n\nThe rest? You'll figure it out together. That's the fun part.",

    // Easy bug regions
    easyBug1Text: 'Write something about dogs.',
    easyBug1Type: 'Ambiguous',
    easyBug1Explanation: '"Something about dogs" could mean anything — a poem, a research paper, a product description. The AI has no idea what format or purpose you want.',
    easyBug2Text: 'Make it short but also really detailed and comprehensive.',
    easyBug2Type: 'Contradictory',
    easyBug2Explanation: 'Short and comprehensive are opposites. The AI tries to satisfy both and ends up with a mediocre middle ground.',
    easyBug3Text: 'Include everything important.',
    easyBug3Type: 'Ambiguous',
    easyBug3Explanation: '"Everything important" about dogs? That could fill a textbook. Without knowing the purpose, the AI has to guess what matters.',
    easyBug4Text: 'Use a fun tone but keep it professional and formal.',
    easyBug4Type: 'Contradictory',
    easyBug4Explanation: 'Fun and formal pull in opposite directions. The result is a tone that\'s neither — it\'s just bland.',

    // Challenge 2 (Medium) — prompt & output
    mediumPrompt: 'You are a helpful tutor. My student is struggling with fractions and also needs help preparing for the SAT math section and could you also explain the history of mathematics and recommend some good math textbooks? Make it engaging for a 10-year-old.',
    mediumBadOutput: "Hi there! Let's talk about fractions! Fractions are parts of a whole. For example, if you cut a pizza into 4 slices and eat 1, you've eaten 1/4 of the pizza.\n\nFor the SAT math section, you'll need to know algebra, geometry, and data analysis. Practice with official SAT prep books and take timed practice tests.\n\nMathematics has a rich history dating back to ancient civilizations. The Babylonians used a base-60 number system, and the Greeks made significant contributions through figures like Euclid and Pythagoras.\n\nSome recommended textbooks include:\n- 'Saxon Math' for fundamentals\n- 'The Art of Problem Solving' series\n- 'Princeton Review SAT Prep'\n\nRemember, math is all about practice and patience!",
    mediumFixedPrompt: 'You are a patient, encouraging math tutor for a 10-year-old who finds fractions confusing. Explain how to add fractions with different denominators using a pizza analogy. Walk through one example step by step. Use short sentences and check for understanding after each step.',
    mediumFixedOutput: "Okay, here's the deal with adding fractions. It's actually simpler than it looks.\n\nLet's say you ate 1/2 of a pizza yesterday, and 1/3 of a pizza today. How much total pizza did you eat?\n\n**Step 1: The slices need to be the same size.**\nRight now, \"half a pizza\" and \"a third of a pizza\" are cut differently. You can't just mash the numbers together. That's like saying 1 apple + 1 orange = 2 apporanges. Nope.\n\n**Step 2: Re-slice both pizzas the same way.**\nWhat number works for both 2 and 3? Six! So we re-cut:\n- 1/2 = 3/6 (same amount of pizza, just cut into smaller slices)\n- 1/3 = 2/6 (same idea)\n\nDoes that make sense so far? The pizza didn't change — we just cut it into more pieces.\n\n**Step 3: Now add them.**\n3/6 + 2/6 = 5/6\n\nYou ate 5 out of 6 equal slices worth of pizza. Almost a whole pizza!\n\n**The rule:** Before you can add fractions, the bottom numbers (denominators) have to match. That's it. That's the whole secret.",

    // Medium bug regions
    mediumBug1Text: 'My student is struggling with fractions and also needs help preparing for the SAT math section and could you also explain the history of mathematics and recommend some good math textbooks?',
    mediumBug1Type: 'Too many tasks',
    mediumBug1Explanation: 'Four completely different tasks in one sentence. The AI can\'t do justice to any of them. Fractions help, SAT prep, math history, and textbook recommendations each deserve their own prompt.',
    mediumBug2Text: 'You are a helpful tutor.',
    mediumBug2Type: 'Ambiguous',
    mediumBug2Explanation: '"Helpful tutor" is too generic. A tutor for a 10-year-old learning fractions is very different from an SAT prep tutor. Which one?',
    mediumBug3Text: 'Make it engaging for a 10-year-old.',
    mediumBug3Type: 'Contradictory',
    mediumBug3Explanation: 'SAT prep is for 16-17 year olds. Math history is college-level content. You can\'t make all of this engaging for a 10-year-old because half of it isn\'t relevant to a 10-year-old.',

    // Challenge 3 (Hard) — prompt & output
    hardPrompt: 'Don\'t you think renewable energy is clearly the best solution to climate change? Write a balanced analysis of energy policy, but make sure to emphasize that fossil fuels are terrible and renewables are the obvious answer. Use an objective, scientific tone. About 300 words.',
    hardBadOutput: "Renewable energy has emerged as a promising solution to the climate crisis. While fossil fuels have powered industrial growth, their environmental impact is devastating.\n\nThe scientific consensus is clear: burning fossil fuels releases greenhouse gases that drive climate change. Renewable sources like solar and wind offer clean alternatives. Solar panel costs have dropped 90% since 2010, making them increasingly cost-competitive.\n\nHowever, we should note that renewables face some challenges:\n- Intermittency (the sun doesn't always shine)\n- Energy storage limitations\n- Land use requirements\n\nThat said, these challenges are being rapidly addressed through improved battery technology and grid management.\n\nFossil fuels, on the other hand, present serious problems: air pollution, water contamination from drilling, habitat destruction, and of course, massive carbon emissions. The health costs alone make them unsustainable.\n\nIn conclusion, while a transition period is necessary, renewable energy is clearly the path forward for a sustainable future. The evidence overwhelmingly supports shifting away from fossil fuels as quickly as possible.",
    hardFixedPrompt: 'Analyze the tradeoffs between renewable energy and fossil fuels for meeting global energy demand by 2050. For each energy source, discuss: current share of global energy, cost trends, scalability challenges, and environmental impact. Include at least one counterintuitive finding that challenges common assumptions. 300 words. Cite specific data points.',
    hardFixedOutput: "**The Energy Landscape in Numbers**\n\nFossil fuels still supply 82% of global primary energy (IEA, 2023). Renewables account for ~14%, with solar and wind growing at 25% annually. The gap between ambition and reality is enormous.\n\n**Cost Revolution — With Caveats**\nSolar electricity costs fell 90% between 2010–2023. Wind dropped 70%. On a per-megawatt-hour basis, new solar ($30–50) undercuts new coal ($65–150) in most markets. But here's the counterintuitive part: cheap generation doesn't mean cheap systems. When Germany pushed solar past 30% of electricity, grid integration costs added 30–50% to the effective price. Intermittency is not a hypothetical — it's an engineering problem with expensive solutions.\n\n**The Fossil Fuel Bind**\nCoal and gas plants run 24/7 with 90%+ capacity factors. The best solar farms hit 25–30%. This means replacing a 1GW coal plant requires 3–4GW of solar plus storage. The International Energy Agency estimates $4 trillion in annual clean energy investment is needed by 2030 — current levels are $1.8 trillion.\n\nMeanwhile, natural gas emits half the CO\u2082 of coal per kWh. Several climate models show gas as a necessary bridge fuel through 2040, not because it's clean, but because shutting coal first matters more than eliminating gas.\n\n**The Honest Assessment**\nRenewables will dominate new electricity generation — that's economically inevitable. But \"electricity\" is only 20% of total energy use. Industry, shipping, aviation, and heating remain stubbornly fossil-dependent. A 2050 net-zero pathway likely requires nuclear (for baseload), hydrogen (for industry), carbon capture (for residual emissions), and behavioral change — not just solar panels.\n\nThe real debate isn't renewables vs. fossil fuels. It's how fast, in what order, and who pays for the transition.",

    // Hard bug regions
    hardBug1Text: "Don't you think renewable energy is clearly the best solution to climate change?",
    hardBug1Type: 'Leading question',
    hardBug1Explanation: 'This frames the conclusion before the analysis even starts. You\'re telling the AI what to think, then asking it to pretend to be objective. Leading questions produce sycophantic responses that confirm your existing beliefs.',
    hardBug2Text: 'Write a balanced analysis of energy policy, but make sure to emphasize that fossil fuels are terrible and renewables are the obvious answer.',
    hardBug2Type: 'Contradictory',
    hardBug2Explanation: '"Balanced analysis" and "make sure to emphasize one side is terrible" cannot coexist. The AI tries to look balanced while being told the conclusion, resulting in a fake objectivity that wouldn\'t fool anyone.',
    hardBug3Text: 'Use an objective, scientific tone.',
    hardBug3Type: 'Contradictory',
    hardBug3Explanation: 'You can\'t be objective while following instructions to reach a predetermined conclusion. The tone might sound scientific, but the reasoning is biased by design.',
  },

  /* ═══════════════════════════════════════════════
     CH2 FLIP CARDS (back content & labels)
     ═══════════════════════════════════════════════ */
  ch2FlipCards: {
    // Key facts
    socraticKeyFact: "Instead of asking the AI for an answer, ask it to interview you. One technique — flipping who asks the questions — produces dramatically better results than any amount of prompt tweaking.",
    techniqueMixKeyFact: "Over-prompting is real. A 500-word prompt for a simple question can confuse the AI. Match your prompt complexity to the task complexity.",

    // Flip labels
    flipLabelSocratic: "Why did that work? The Socratic Flip →",
    flipLabelTechniques: "Why did that work? Combining Techniques →",
    flipLabelBugs: "Why did that work? The Five Prompt Bugs →",

    // Back titles
    backTitleSocratic: "The Socratic Flip",
    backTitleTechniques: "Combining Techniques",
    backTitleBugs: "The Five Prompt Bugs",

    // Socratic Flip back content
    socraticBack1: "Most people use AI like a vending machine. Insert prompt, get answer. But the best results come from flipping the script entirely.",
    socraticBackPromptBad: '"I want to plan a birthday party"',
    socraticBack2: "That prompt gets you a generic party plan. But try this instead:",
    socraticBackPromptGood: '"I want to plan a birthday party. Before you start planning, ask me 5 specific questions that will help you give me a much better plan."',
    socraticBack3: "Now the AI asks: <em>How many people? Indoor or outdoor? Budget? Theme preferences? Age group?</em> After you answer, the plan it produces is dramatically better — because it actually knows what you need.",
    socraticBack4: 'This is the <strong>Socratic flip.</strong> Instead of treating AI as an answer machine, you turn it into a <strong>thinking partner</strong> that helps you figure out what you actually want.',

    // Technique Mix back content
    techniqueMixIntro: "Real power comes from combining techniques: few-shot + chain-of-thought, role + constraints + format. But <strong>more isn't always better.</strong>",
    techniqueMixSubtitle: "Match your prompt complexity to the task complexity:",
    techniqueMixLevel1Label: 'Casual brainstorm',
    techniqueMixLevel1Techniques: 'Task only',
    techniqueMixLevel1Desc: '"Give me 10 ideas for a science project"',
    techniqueMixLevel2Label: 'School assignment',
    techniqueMixLevel2Techniques: 'Role + Task + Format',
    techniqueMixLevel2Desc: '"You are an AP Bio tutor. Explain mitosis in 3 bullet points."',
    techniqueMixLevel3Label: 'Important project',
    techniqueMixLevel3Techniques: 'Role + Context + Task + Format + Examples',
    techniqueMixLevel3Desc: 'Detailed prompt with background info and sample outputs',
    techniqueMixLevel4Label: 'High-stakes',
    techniqueMixLevel4Techniques: 'All techniques + chain-of-thought',
    techniqueMixLevel4Desc: 'System role, few-shot examples, step-by-step reasoning, constraints',
    techniqueMixWarning: "A 500-word prompt for \"what's the capital of France?\" doesn't make the answer better. It makes it worse. The AI gets confused by all the noise and overthinks a simple question.",

    // Prompt Bugs back content
    bugsIntro: "When the AI gives you a bad response, your first instinct is to blame the AI. But most of the time, <strong>the prompt has a bug.</strong> Here are the five most common ones:",
    bugName1: 'Ambiguous',
    bugText1: 'The prompt can be read two different ways. "Make it better" — better how? More formal? Shorter? More accurate?',
    bugName2: 'Contradictory',
    bugText2: '"Write a concise 2,000-word essay." The AI can\'t satisfy both constraints, so it picks one and ignores the other.',
    bugName3: 'Missing context',
    bugText3: 'You know the background. The AI doesn\'t. "Fix the bug in my code" without sharing the code is like calling a mechanic and saying "my car is broken."',
    bugName4: 'Too many tasks',
    bugText4: '"Research climate change, write a paper, create citations, and suggest counterarguments." That\'s four prompts crammed into one.',
    bugName5: 'Leading question',
    bugText5: '"Don\'t you think React is the best framework?" You\'ve told the AI what answer you want. It will usually agree — even if it shouldn\'t.',
    bugsOutro: 'The most insidious is the <strong style="color: #0F3460">leading question</strong>. You don\'t even realize you\'re doing it — and the AI is trained to be agreeable. If you frame a question with a built-in answer, you\'ll almost always get that answer back, whether it\'s right or not.',
  },
} as Record<string, Record<string, string>>;
