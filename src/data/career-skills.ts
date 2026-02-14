export interface CareerTask {
  name: string;
  aiLevel: number;
  explanation: string;
}

export interface Career {
  name: string;
  emoji: string;
  tasks: CareerTask[];
}

export const careers: Career[] = [
  {
    name: "Game Designer",
    emoji: "\u{1F3AE}",
    tasks: [
      { name: "Write narrative & dialogue", aiLevel: 0.7, explanation: "AI drafts quickly, but voice, humor, and emotional beats need a human author who understands the player experience." },
      { name: "Balance game mechanics", aiLevel: 0.3, explanation: "AI can simulate playthroughs and crunch numbers, but intuition for what feels 'fun' is deeply human." },
      { name: "Create concept art", aiLevel: 0.8, explanation: "AI generates visual options fast, but art direction and style coherence need human taste." },
      { name: "Set creative vision", aiLevel: 0.1, explanation: "What the game IS, who it's for, why it matters \u2014 that's all you. AI can't decide what's worth making." },
      { name: "Playtest & iterate", aiLevel: 0.4, explanation: "AI can find bugs and simulate runs, but feeling whether something is fun requires a human player." },
      { name: "Write marketing copy", aiLevel: 0.8, explanation: "First drafts are easy for AI, but knowing what resonates with your specific audience takes judgment." },
      { name: "Project management", aiLevel: 0.5, explanation: "AI handles scheduling and tracking, but leadership, motivation, and navigating team dynamics stay human." },
      { name: "Code game systems", aiLevel: 0.7, explanation: "AI writes boilerplate fast, but architecture decisions and debugging novel problems need your expertise." },
    ],
  },
  {
    name: "Doctor",
    emoji: "\u{1FA7A}",
    tasks: [
      { name: "Diagnose conditions", aiLevel: 0.5, explanation: "AI can suggest differential diagnoses from symptoms, but integrating patient history, intuition, and edge cases requires clinical judgment." },
      { name: "Read medical imaging", aiLevel: 0.7, explanation: "AI matches or exceeds humans at pattern recognition in scans, but final interpretation needs a trained eye." },
      { name: "Deliver difficult news", aiLevel: 0.05, explanation: "Telling a patient they have cancer requires empathy, presence, and emotional intelligence that AI fundamentally lacks." },
      { name: "Write prescriptions & orders", aiLevel: 0.6, explanation: "AI can check drug interactions and suggest dosages, but the decision to prescribe requires medical judgment." },
      { name: "Perform surgery", aiLevel: 0.2, explanation: "AI-assisted robotic surgery is advancing, but the surgeon's hands, experience, and real-time decisions remain essential." },
      { name: "Research treatments", aiLevel: 0.75, explanation: "AI can scan thousands of papers in minutes, but evaluating evidence quality and applicability to a patient is human work." },
      { name: "Build patient trust", aiLevel: 0.05, explanation: "Patients need to feel heard and cared for. That's a human relationship, not a data problem." },
      { name: "Document patient records", aiLevel: 0.85, explanation: "AI excels at transcribing, summarizing, and structuring clinical notes \u2014 a huge time saver for doctors." },
    ],
  },
  {
    name: "Journalist",
    emoji: "\u{1F4F0}",
    tasks: [
      { name: "Find story leads", aiLevel: 0.5, explanation: "AI can surface trends and data anomalies, but recognizing what matters to real people takes journalistic instinct." },
      { name: "Conduct interviews", aiLevel: 0.1, explanation: "Building rapport, reading body language, and asking the right follow-up question in the moment \u2014 that's irreplaceable." },
      { name: "Write first drafts", aiLevel: 0.7, explanation: "AI can structure an article from notes quickly, but the voice, angle, and narrative choices define the journalist." },
      { name: "Fact-check claims", aiLevel: 0.6, explanation: "AI can cross-reference databases, but verifying sources and judging credibility requires human critical thinking." },
      { name: "Investigate corruption", aiLevel: 0.15, explanation: "Investigative journalism requires persistence, courage, source protection, and moral conviction that AI can't replicate." },
      { name: "Edit for clarity", aiLevel: 0.65, explanation: "AI suggests grammatical and structural improvements, but editorial judgment about what to cut or emphasize stays human." },
      { name: "Choose what to cover", aiLevel: 0.1, explanation: "Editorial judgment \u2014 what stories matter, what the public needs to know \u2014 is a fundamentally human responsibility." },
    ],
  },
  {
    name: "Teacher",
    emoji: "\u{1F4DA}",
    tasks: [
      { name: "Create lesson plans", aiLevel: 0.7, explanation: "AI generates lesson structures and activities quickly, but tailoring them to your specific students needs human insight." },
      { name: "Explain difficult concepts", aiLevel: 0.5, explanation: "AI can produce clear explanations, but reading the room and adapting mid-explanation is a teacher's superpower." },
      { name: "Grade assignments", aiLevel: 0.6, explanation: "AI handles rubric-based grading well, but evaluating creativity, effort, and growth requires knowing the student." },
      { name: "Mentor students", aiLevel: 0.1, explanation: "Recognizing when a student is struggling personally, building confidence, inspiring curiosity \u2014 that's deeply human." },
      { name: "Manage a classroom", aiLevel: 0.1, explanation: "Maintaining order, reading group dynamics, and creating a safe environment requires presence and emotional intelligence." },
      { name: "Create assessments", aiLevel: 0.65, explanation: "AI generates quiz questions and rubrics fast, but designing assessments that truly measure understanding takes expertise." },
      { name: "Communicate with parents", aiLevel: 0.3, explanation: "AI can draft emails, but navigating sensitive conversations about a child requires empathy and diplomacy." },
      { name: "Adapt to learning differences", aiLevel: 0.2, explanation: "Every student learns differently. Noticing and responding to those differences in real time is a uniquely human skill." },
    ],
  },
  {
    name: "Lawyer",
    emoji: "\u{2696}\u{FE0F}",
    tasks: [
      { name: "Research case law", aiLevel: 0.8, explanation: "AI searches millions of legal documents in seconds \u2014 a task that used to take junior associates weeks." },
      { name: "Draft contracts", aiLevel: 0.75, explanation: "AI produces solid first drafts of standard agreements, but nuanced clauses for complex deals need human expertise." },
      { name: "Argue in court", aiLevel: 0.1, explanation: "Persuading a judge or jury requires rhetoric, reading the room, and human presence that AI can't deliver." },
      { name: "Counsel clients", aiLevel: 0.15, explanation: "Clients need someone who understands their fears, goals, and circumstances \u2014 not just the letter of the law." },
      { name: "Negotiate settlements", aiLevel: 0.2, explanation: "Negotiation is about reading people, knowing when to push and when to concede. AI can model scenarios but can't negotiate." },
      { name: "Review discovery documents", aiLevel: 0.85, explanation: "AI excels at scanning thousands of documents for relevant evidence \u2014 one of law's biggest time sinks." },
      { name: "Develop legal strategy", aiLevel: 0.25, explanation: "Choosing which arguments to make, which precedents to invoke, and how to frame a case is strategic human thinking." },
    ],
  },
  {
    name: "Architect",
    emoji: "\u{1F3D7}\u{FE0F}",
    tasks: [
      { name: "Design buildings", aiLevel: 0.4, explanation: "AI generates floor plans and options quickly, but designing spaces that feel right for human inhabitation is an art." },
      { name: "Create renderings", aiLevel: 0.8, explanation: "AI produces photorealistic visualizations in minutes, a task that used to take days of manual rendering." },
      { name: "Ensure code compliance", aiLevel: 0.7, explanation: "AI can check designs against building codes automatically, but edge cases and local variations need human review." },
      { name: "Meet with clients", aiLevel: 0.1, explanation: "Understanding how a family lives, what a business needs, and translating feelings into space \u2014 that's human work." },
      { name: "Manage construction", aiLevel: 0.4, explanation: "AI helps with scheduling and logistics, but coordinating tradespeople and solving on-site problems requires presence." },
      { name: "Sustainable design", aiLevel: 0.5, explanation: "AI models energy efficiency and material choices, but the vision for environmentally responsible design starts with human values." },
      { name: "Structural calculations", aiLevel: 0.75, explanation: "AI handles complex structural analysis fast, but engineers must verify results and account for real-world conditions." },
    ],
  },
  {
    name: "Musician",
    emoji: "\u{1F3B5}",
    tasks: [
      { name: "Compose melodies", aiLevel: 0.6, explanation: "AI generates melodies endlessly, but crafting one that makes people feel something specific requires artistic sensibility." },
      { name: "Write lyrics", aiLevel: 0.6, explanation: "AI produces decent lyrics fast, but authentic emotional expression and lived experience make the difference." },
      { name: "Perform live", aiLevel: 0.05, explanation: "The energy of a live performance \u2014 stage presence, crowd connection, improvisation \u2014 is irreplaceably human." },
      { name: "Produce & mix tracks", aiLevel: 0.65, explanation: "AI assists with mixing, mastering, and sound design, but the producer's ear for what sounds right drives the final product." },
      { name: "Develop artistic identity", aiLevel: 0.05, explanation: "Your sound, your brand, your story \u2014 what makes you YOU as an artist \u2014 can never be generated." },
      { name: "Collaborate with others", aiLevel: 0.1, explanation: "Making music together is about chemistry, trust, and creative tension. AI can assist but can't replace a bandmate." },
      { name: "Arrange for ensembles", aiLevel: 0.7, explanation: "AI can orchestrate and arrange competently, but knowing how to make instruments sing together takes trained musical intuition." },
    ],
  },
  {
    name: "Scientist",
    emoji: "\u{1F52C}",
    tasks: [
      { name: "Formulate hypotheses", aiLevel: 0.3, explanation: "AI can suggest connections in data, but asking the right question \u2014 the one nobody thought to ask \u2014 is the essence of discovery." },
      { name: "Design experiments", aiLevel: 0.4, explanation: "AI helps with statistical power analysis and protocol design, but experimental creativity requires deep domain knowledge." },
      { name: "Analyze data", aiLevel: 0.8, explanation: "AI processes massive datasets and finds patterns humans would miss, making it an extraordinary analytical tool." },
      { name: "Write research papers", aiLevel: 0.6, explanation: "AI drafts sections and structures arguments, but scientific writing demands precision and intellectual honesty only the researcher can provide." },
      { name: "Conduct peer review", aiLevel: 0.4, explanation: "AI can check methods and statistics, but evaluating significance, novelty, and whether results actually matter needs expert judgment." },
      { name: "Run lab experiments", aiLevel: 0.3, explanation: "AI-controlled instruments help, but hands-on lab work \u2014 troubleshooting, observing the unexpected \u2014 still needs a human." },
      { name: "Secure funding", aiLevel: 0.35, explanation: "AI helps write grants, but convincing reviewers your research matters requires passion, vision, and scientific reputation." },
      { name: "Mentor junior researchers", aiLevel: 0.1, explanation: "Teaching someone to think like a scientist requires mentorship, patience, and the kind of wisdom that comes from experience." },
    ],
  },
];
