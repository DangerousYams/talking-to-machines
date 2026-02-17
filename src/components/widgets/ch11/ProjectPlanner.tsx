import { useState } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import BottomSheet from '../../cards/BottomSheet';

interface ProjectIdea {
  title: string;
  description: string;
  difficulty: number;
  weeks: string[];
  tools: string[];
}

const interestOptions = [
  { id: 'games', label: 'Games', icon: '\uD83C\uDFAE' },
  { id: 'stories', label: 'Stories', icon: '\uD83D\uDCD6' },
  { id: 'research', label: 'Research', icon: '\uD83D\uDD2C' },
  { id: 'apps', label: 'Apps', icon: '\uD83D\uDCBB' },
  { id: 'agents', label: 'AI / Agents', icon: '\uD83E\uDD16' },
  { id: 'art', label: 'Art / Design', icon: '\uD83C\uDFA8' },
  { id: 'music', label: 'Music', icon: '\uD83C\uDFB5' },
  { id: 'science', label: 'Science', icon: '\u2697\uFE0F' },
];

const experienceLevels = [
  { id: 'none', label: 'None', desc: 'Never written code' },
  { id: 'little', label: 'A Little', desc: 'Tried some tutorials' },
  { id: 'comfortable', label: 'Comfortable', desc: 'Built small projects' },
  { id: 'experienced', label: 'Experienced', desc: 'Code regularly' },
];

const timeOptions = [
  { id: '1week', label: '1 Week', desc: 'Quick sprint' },
  { id: '3weeks', label: '3 Weeks', desc: 'Deep dive' },
  { id: 'ongoing', label: 'Ongoing', desc: 'Long-term project' },
];

const projectDatabase: Record<string, ProjectIdea[]> = {
  'games-none-1week': [
    { title: 'AI Story Maze', description: 'A choose-your-own-adventure game where AI generates branching narratives. You write the setup, AI writes the paths.', difficulty: 1, weeks: ['Design 5 starting scenarios and map the branching structure on paper', 'Build in a simple tool (Google Docs or Twine) with AI-generated branches', 'Playtest with friends, refine the best paths'], tools: ['Claude', 'Twine', 'Google Docs'] },
    { title: 'Prompt Battle Card Game', description: 'Design a physical card game where players compete to write the best prompts. AI judges the outputs.', difficulty: 1, weeks: ['Design card categories, rules, and scoring system', 'Use AI to generate 40+ prompt challenge cards', 'Print, playtest, and refine the rules'], tools: ['Claude', 'Canva', 'Printer'] },
    { title: 'AI Dungeon Master', description: 'Create a text-based RPG where AI plays the dungeon master. You define the world, AI runs the adventure.', difficulty: 2, weeks: ['Write the world-building doc: setting, characters, rules', 'Craft the system prompt and test 10+ scenarios', 'Run a live session with friends, document what works'], tools: ['Claude', 'Google Docs'] },
  ],
  'games-little-3weeks': [
    { title: 'AI-Powered Trivia Arena', description: 'Build a web-based trivia game where AI generates questions on any topic the player chooses, with difficulty scaling.', difficulty: 3, weeks: ['Design the game loop, scoring system, and UI wireframes', 'Build the frontend and connect to AI API for question generation', 'Add difficulty scaling, leaderboard, and polish the experience'], tools: ['Claude Code', 'React', 'Tailwind CSS'] },
    { title: 'Procedural Story Game', description: 'A web game with AI-generated characters, plot twists, and endings that change based on player choices.', difficulty: 3, weeks: ['Design the narrative engine: how choices map to story branches', 'Build the UI and integrate AI for dynamic story generation', 'Playtest extensively, add illustrations via AI image generation'], tools: ['Claude Code', 'React', 'Midjourney'] },
    { title: 'AI Puzzle Generator', description: 'A puzzle game that uses AI to create unique logic puzzles, riddles, and challenges that adapt to the player\'s skill level.', difficulty: 3, weeks: ['Research puzzle types and design the difficulty curve', 'Build the puzzle display UI and AI generation pipeline', 'Add hint system, progress tracking, and 20+ puzzle templates'], tools: ['Claude Code', 'JavaScript', 'HTML/CSS'] },
  ],
  'stories-none-1week': [
    { title: 'Co-Written Short Story Collection', description: 'Write 5 short stories in 5 different genres, each co-authored with AI in a unique way. Document your creative process.', difficulty: 1, weeks: ['Pick 5 genres, write opening paragraphs for each', 'Co-write with AI using different techniques per story (dialogue-first, outline-first, etc.)', 'Edit, compile into a zine-style PDF with AI-designed covers'], tools: ['Claude', 'Canva', 'Google Docs'] },
    { title: 'AI Poetry Workshop', description: 'Explore poetry by having AI write in different styles, then rewrite each poem in your own voice. Compare the versions.', difficulty: 1, weeks: ['Select 8 poetry styles (haiku, sonnet, free verse, etc.) and generate AI versions', 'Rewrite each in your voice, annotating what you changed and why', 'Compile into a visual chapbook with side-by-side comparisons'], tools: ['Claude', 'Canva'] },
    { title: 'Flash Fiction Challenge', description: 'Write 10 flash fiction pieces (under 500 words each) using AI as a brainstorming partner, not a ghostwriter.', difficulty: 1, weeks: ['Generate 20 story premises with AI, pick your 10 favorites', 'Write each story yourself, using AI only for brainstorming stuck points', 'Peer review, revise, and publish on a free blog platform'], tools: ['Claude', 'Medium or Substack'] },
  ],
  'research-little-ongoing': [
    { title: 'Fact-Check Bot', description: 'Build a tool that takes an AI-generated claim and cross-references it against reliable sources, rating confidence.', difficulty: 3, weeks: ['Research fact-checking methodologies and design the verification pipeline', 'Build the tool: input claim, AI searches sources, outputs confidence rating', 'Test against 50+ claims, refine accuracy, write up findings'], tools: ['Claude Code', 'Perplexity API', 'Python'] },
    { title: 'Research Paper Summarizer', description: 'A tool that reads academic papers and produces structured summaries with key findings, methods, and limitations.', difficulty: 3, weeks: ['Design the summary template and test with 5 papers manually', 'Build the pipeline: PDF upload, AI extraction, structured output', 'Test with 20+ papers across fields, measure accuracy, iterate'], tools: ['Claude Code', 'Python', 'PDF libraries'] },
    { title: 'AI Bias Tracker', description: 'Systematically test AI models for biases across different topics and demographics, documenting patterns.', difficulty: 2, weeks: ['Design test prompts covering 8+ bias categories', 'Run tests across multiple AI models, log all responses', 'Analyze patterns, create visualizations, write a report'], tools: ['Claude', 'GPT-4', 'Google Sheets', 'D3.js'] },
  ],
  'apps-comfortable-3weeks': [
    { title: 'Smart Study Buddy', description: 'An AI-powered flashcard app that generates questions from your notes and adapts to what you struggle with.', difficulty: 4, weeks: ['Design the spaced repetition algorithm and UI/UX wireframes', 'Build the app: note upload, AI question generation, quiz interface', 'Add progress tracking, difficulty adaptation, and export features'], tools: ['Claude Code', 'React', 'Supabase', 'Tailwind CSS'] },
    { title: 'Mood-Based Playlist Generator', description: 'An app that reads your journal entry or describes your mood and creates a perfect playlist with explanations.', difficulty: 3, weeks: ['Design the mood-to-music mapping system and UI', 'Build the app with AI mood analysis and music recommendation engine', 'Polish UI, add sharing features, test with 20+ mood inputs'], tools: ['Claude Code', 'React', 'Spotify API'] },
    { title: 'AI Writing Coach', description: 'A web app that analyzes your writing style, suggests improvements, and tracks your growth over time.', difficulty: 4, weeks: ['Design the analysis metrics (clarity, tone, vocabulary, etc.) and UI', 'Build the writing input, AI analysis pipeline, and feedback display', 'Add progress tracking, style comparisons, and export reports'], tools: ['Claude Code', 'React', 'D3.js', 'Supabase'] },
  ],
  'apps-experienced-3weeks': [
    { title: 'AI Meeting Summarizer', description: 'A tool that takes meeting recordings or notes and produces structured summaries with action items and follow-ups.', difficulty: 4, weeks: ['Design the summary schema, action item extraction, and UI architecture', 'Build the full pipeline: audio/text input, AI processing, structured output', 'Add calendar integration, email digest, and team sharing features'], tools: ['Claude Code', 'React', 'Node.js', 'ElevenLabs'] },
    { title: 'Code Review Companion', description: 'A developer tool that reviews pull requests, explains changes in plain English, and suggests improvements.', difficulty: 5, weeks: ['Design the review criteria, GitHub integration, and output format', 'Build the GitHub webhook listener, AI review pipeline, and comment system', 'Test on 30+ real PRs, refine prompts, add configuration options'], tools: ['Claude Code', 'GitHub API', 'Node.js', 'TypeScript'] },
    { title: 'Personal Knowledge Base', description: 'A smart note-taking app that links related ideas, generates summaries, and answers questions about your notes.', difficulty: 5, weeks: ['Design the data model, search system, and AI integration architecture', 'Build the note editor, AI-powered linking, and semantic search', 'Add question-answering, visualization of note connections, and export'], tools: ['Claude Code', 'React', 'Supabase', 'pgvector'] },
  ],
  'agents-comfortable-3weeks': [
    { title: 'Homework Decomposer Agent', description: 'An AI agent that breaks down complex assignments into manageable steps, estimates time, and tracks progress.', difficulty: 4, weeks: ['Design the task decomposition algorithm and agent architecture', 'Build the agent: input assignment, plan generation, step tracking UI', 'Add time estimation, progress tracking, and revision capabilities'], tools: ['Claude Code', 'React', 'Supabase'] },
    { title: 'Research Agent Pipeline', description: 'A multi-step agent that researches a topic, evaluates sources, synthesizes findings, and produces a report.', difficulty: 4, weeks: ['Design the 4-stage pipeline: search, evaluate, synthesize, format', 'Build each agent stage with appropriate tools and handoff logic', 'Test on 10+ research topics, add source quality scoring'], tools: ['Claude Code', 'Perplexity API', 'Python'] },
    { title: 'Social Media Content Agent', description: 'An agent that takes a blog post and automatically creates optimized versions for Twitter, LinkedIn, and Instagram.', difficulty: 3, weeks: ['Study platform-specific content patterns and design the adaptation rules', 'Build the agent pipeline: analyze post, generate variants, format per platform', 'Test with 15+ posts, add scheduling preview and A/B variant generation'], tools: ['Claude Code', 'React', 'Node.js'] },
  ],
  'art-none-1week': [
    { title: 'AI Art Exhibition', description: 'Create a themed art series using AI image generation, with artist statements explaining your creative direction for each piece.', difficulty: 1, weeks: ['Choose a theme, research art styles, write 8 detailed image prompts', 'Generate and curate images, iterate on the best ones', 'Write artist statements, compile into a portfolio or online gallery'], tools: ['Midjourney', 'Claude', 'Canva'] },
    { title: 'Prompt-to-Poster Series', description: 'Design 5 event posters for fictional events, mastering the art of visual prompt engineering.', difficulty: 1, weeks: ['Design 5 fictional events and research poster design principles', 'Generate and iterate on poster designs using AI image tools', 'Refine typography and layout in Canva, present the final series'], tools: ['Midjourney', 'DALL-E 3', 'Canva'] },
    { title: 'AI Style Transfer Journal', description: 'Take 7 of your own photos and reimagine each in a different art style using AI. Document the transformation process.', difficulty: 1, weeks: ['Select photos and research 7 distinct art styles', 'Use AI to transform each photo, documenting prompts and iterations', 'Create a visual journal comparing originals, AI versions, and process notes'], tools: ['Stable Diffusion', 'Midjourney', 'Canva'] },
  ],
  'music-none-1week': [
    { title: 'AI Album in a Week', description: 'Create a 5-track concept album using AI music generation. You provide the vision, themes, and lyrics.', difficulty: 1, weeks: ['Write the album concept, song themes, and draft lyrics for 5 tracks', 'Generate tracks using AI, iterate on style and arrangement', 'Sequence the album, design cover art with AI, share with friends'], tools: ['Suno', 'Udio', 'Midjourney', 'Claude'] },
    { title: 'Sound Design Exploration', description: 'Create a library of 20 unique sound effects and ambient textures using AI audio generation.', difficulty: 1, weeks: ['Categorize sounds needed (nature, sci-fi, urban, abstract)', 'Generate and curate sounds, organize into a usable library', 'Create a demo reel or short audio story using your sound library'], tools: ['Stable Audio', 'ElevenLabs', 'Audacity'] },
    { title: 'AI Remix Project', description: 'Take 3 songs in completely different genres and use AI to reimagine each in a contrasting style.', difficulty: 2, weeks: ['Select source songs and target genres, plan the transformations', 'Generate remixes, iterate on the best versions', 'Produce final versions with transitions, write liner notes about the process'], tools: ['Suno', 'Udio', 'Claude'] },
  ],
  'science-little-3weeks': [
    { title: 'AI Lab Notebook', description: 'Design and run a simple experiment with AI as your lab partner: hypothesis generation, data analysis, and report writing.', difficulty: 3, weeks: ['Choose a question, use AI to explore hypotheses and design the experiment', 'Collect data (surveys, measurements, or public datasets), analyze with AI', 'Write up findings in a proper lab report format with AI assistance'], tools: ['Claude', 'Google Sheets', 'Python'] },
    { title: 'Data Visualization Story', description: 'Find a public dataset that tells an interesting story and create a visual narrative with AI-assisted analysis.', difficulty: 3, weeks: ['Explore public datasets, identify an interesting angle, plan visualizations', 'Clean data and create 5+ visualizations with AI-assisted code', 'Write the narrative connecting the visualizations into a compelling story'], tools: ['Claude Code', 'D3.js', 'Python', 'Observable'] },
    { title: 'Science Explainer Series', description: 'Create a 5-part illustrated series explaining a complex scientific concept to a general audience.', difficulty: 2, weeks: ['Research the topic deeply, outline 5 episodes, identify key concepts', 'Write each episode with AI, generate diagrams and illustrations', 'Edit for accuracy, add interactive elements, publish as a mini-site'], tools: ['Claude', 'Midjourney', 'Canva'] },
  ],
};

function getProjects(interests: string[], experience: string, time: string): ProjectIdea[] {
  const results: ProjectIdea[] = [];
  const seen = new Set<string>();

  for (const interest of interests) {
    const key = `${interest}-${experience}-${time}`;
    if (projectDatabase[key]) {
      for (const p of projectDatabase[key]) {
        if (!seen.has(p.title)) {
          results.push(p);
          seen.add(p.title);
        }
      }
    }
  }

  // Fallback: try partial matches
  if (results.length < 3) {
    for (const interest of interests) {
      for (const dbKey of Object.keys(projectDatabase)) {
        if (dbKey.startsWith(interest) && results.length < 6) {
          for (const p of projectDatabase[dbKey]) {
            if (!seen.has(p.title)) {
              results.push(p);
              seen.add(p.title);
            }
          }
        }
      }
    }
  }

  // Ultimate fallback
  if (results.length < 3) {
    for (const dbKey of Object.keys(projectDatabase)) {
      for (const p of projectDatabase[dbKey]) {
        if (!seen.has(p.title) && results.length < 3) {
          results.push(p);
          seen.add(p.title);
        }
      }
    }
  }

  return results.slice(0, 3);
}

export default function ProjectPlanner() {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [time, setTime] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectIdea | null>(null);
  const [copied, setCopied] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const accent = '#16C79A';

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const canProceed = () => {
    if (step === 0) return interests.length > 0;
    if (step === 1) return experience !== '';
    if (step === 2) return time !== '';
    return true;
  };

  const projects = step === 3 ? getProjects(interests, experience, time) : [];

  const exportPlan = (project: ProjectIdea) => {
    const plan = [
      `# ${project.title}`,
      '',
      project.description,
      '',
      `Difficulty: ${'*'.repeat(project.difficulty)} (${project.difficulty}/5)`,
      `Tools: ${project.tools.join(', ')}`,
      '',
      '## Week-by-Week Plan',
      ...project.weeks.map((w, i) => `\nWeek ${i + 1}: ${w}`),
      '',
      '---',
      'Generated by Talking to Machines — Chapter 11: Build Something Real',
    ].join('\n');

    navigator.clipboard.writeText(plan).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleProjectTap = (project: ProjectIdea) => {
    setSelectedProject(project);
    if (isMobile) {
      setSheetOpen(true);
    }
  };

  const stepLabels = ['Interests', 'Experience', 'Timeline', 'Your Projects'];

  /* ============ MOBILE LAYOUT ============ */
  if (isMobile) {
    return (
      <div className="widget-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{ padding: '1rem 1rem 0.75rem', borderBottom: '1px solid rgba(26,26,46,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${accent}, ${accent}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>Project Planner</h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>Find your capstone project</p>
            </div>
          </div>
        </div>

        {/* Progress dots (compact) */}
        <div style={{ display: 'flex', gap: 4, padding: '0.5rem 1rem', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {stepLabels.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700,
                  background: i <= step ? accent : 'rgba(26,26,46,0.06)',
                  color: i <= step ? 'white' : '#6B7280',
                  transition: 'all 0.3s ease',
                }}>
                  {i < step ? '\u2713' : i + 1}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: i <= step ? accent : '#6B728080' }}>
                  {label}
                </span>
              </div>
              {i < 3 && (
                <div style={{ width: 12, height: 1, background: i < step ? accent : 'rgba(26,26,46,0.08)', marginBottom: 14 }} />
              )}
            </div>
          ))}
        </div>

        {/* Main content area */}
        <div style={{ flex: 1, padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          {/* Step 0: Interests */}
          {step === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: '#1A1A2E', margin: '0 0 0.25rem', textAlign: 'center' }}>
                What interests you?
              </h4>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#6B7280', textAlign: 'center', margin: '0 0 0.75rem' }}>
                Pick one or more topics.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, flex: 1 }}>
                {interestOptions.map((opt) => {
                  const isActive = interests.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleInterest(opt.id)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        padding: '0.5rem', borderRadius: 10,
                        border: `1.5px solid ${isActive ? accent : 'rgba(26,26,46,0.08)'}`,
                        background: isActive ? `${accent}0A` : 'transparent',
                        cursor: 'pointer', minHeight: 44,
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>{opt.icon}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: isActive ? 600 : 400, color: isActive ? accent : '#1A1A2E' }}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Experience */}
          {step === 1 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: '#1A1A2E', margin: '0 0 0.25rem', textAlign: 'center' }}>
                Coding experience?
              </h4>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#6B7280', textAlign: 'center', margin: '0 0 0.75rem' }}>
                Be honest -- great projects at every level.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {experienceLevels.map((opt) => {
                  const isActive = experience === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setExperience(opt.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '0.65rem 0.75rem', borderRadius: 10,
                        border: `1.5px solid ${isActive ? accent : 'rgba(26,26,46,0.08)'}`,
                        background: isActive ? `${accent}0A` : 'transparent',
                        cursor: 'pointer', textAlign: 'left', minHeight: 44,
                      }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${isActive ? accent : 'rgba(26,26,46,0.15)'}`,
                        background: isActive ? accent : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isActive && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'white' }} />}
                      </div>
                      <div>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: isActive ? 600 : 400, color: isActive ? accent : '#1A1A2E', display: 'block' }}>
                          {opt.label}
                        </span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#6B7280' }}>{opt.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Time */}
          {step === 2 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: '#1A1A2E', margin: '0 0 0.25rem', textAlign: 'center' }}>
                How much time?
              </h4>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#6B7280', textAlign: 'center', margin: '0 0 0.75rem' }}>
                Every timeframe produces something real.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {timeOptions.map((opt) => {
                  const isActive = time === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setTime(opt.id)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                        padding: '0.75rem 0.5rem', borderRadius: 10,
                        border: `1.5px solid ${isActive ? accent : 'rgba(26,26,46,0.08)'}`,
                        background: isActive ? `${accent}0A` : 'transparent',
                        cursor: 'pointer', minHeight: 44,
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 700, color: isActive ? accent : '#1A1A2E' }}>
                        {opt.label}
                      </span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: '#6B7280' }}>{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Results (compact cards) */}
          {step === 3 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: '#1A1A2E', margin: '0 0 0.5rem', textAlign: 'center' }}>
                Your Project Ideas
              </h4>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
                {projects.map((project, i) => (
                  <button
                    key={i}
                    onClick={() => handleProjectTap(project)}
                    style={{
                      borderRadius: 10, border: `1.5px solid ${selectedProject?.title === project.title ? accent : 'rgba(26,26,46,0.08)'}`,
                      background: selectedProject?.title === project.title ? `${accent}05` : 'white',
                      padding: '0.75rem', cursor: 'pointer', textAlign: 'left', width: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h5 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 700, color: '#1A1A2E', margin: 0, flex: 1 }}>
                        {project.title}
                      </h5>
                      <div style={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                        {Array.from({ length: 5 }, (_, j) => (
                          <span key={j} style={{ fontSize: '0.6rem', color: j < project.difficulty ? accent : '#E5E7EB' }}>{'\u2605'}</span>
                        ))}
                      </div>
                    </div>
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.75rem', lineHeight: 1.5, color: '#6B7280', margin: 0,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden',
                    }}>
                      {project.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                      {project.tools.slice(0, 3).map((tool, ti) => (
                        <span key={ti} style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 500,
                          padding: '1px 6px', borderRadius: 100, background: `${accent}10`, color: accent,
                        }}>
                          {tool}
                        </span>
                      ))}
                      {project.tools.length > 3 && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#6B7280' }}>+{project.tools.length - 3}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div style={{ padding: '0.75rem 1rem', flexShrink: 0, borderTop: '1px solid rgba(26,26,46,0.06)' }}>
          {step < 3 ? (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
                style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 500,
                  padding: '0.5rem 1rem', borderRadius: 100,
                  border: '1px solid rgba(26,26,46,0.12)', background: 'transparent',
                  cursor: step === 0 ? 'default' : 'pointer', color: step === 0 ? '#CBD5E1' : '#6B7280',
                  opacity: step === 0 ? 0.4 : 1, minHeight: 44,
                }}
              >
                Back
              </button>
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600,
                  padding: '0.5rem 1.25rem', borderRadius: 100, border: 'none',
                  cursor: canProceed() ? 'pointer' : 'default',
                  background: canProceed() ? '#1A1A2E' : '#E5E7EB',
                  color: canProceed() ? '#FAF8F5' : '#9CA3AF',
                  minHeight: 44,
                }}
              >
                {step === 2 ? 'Find Projects' : 'Next'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setStep(0); setInterests([]); setExperience(''); setTime(''); setSelectedProject(null); }}
              style={{
                fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 500,
                padding: '0.5rem 1.25rem', borderRadius: 100,
                border: '1px solid rgba(26,26,46,0.12)', background: 'transparent',
                cursor: 'pointer', color: '#6B7280', width: '100%', minHeight: 44,
              }}
            >
              Start Over
            </button>
          )}
        </div>

        {/* BottomSheet for full project details */}
        {selectedProject && (
          <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title={selectedProject.title}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.6, color: '#6B7280', margin: '0 0 1rem' }}>
              {selectedProject.description}
            </p>

            <div style={{ display: 'flex', gap: 2, marginBottom: '1rem' }}>
              {Array.from({ length: 5 }, (_, j) => (
                <span key={j} style={{ fontSize: '0.75rem', color: j < selectedProject.difficulty ? accent : '#E5E7EB' }}>{'\u2605'}</span>
              ))}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280', marginLeft: 4 }}>
                {selectedProject.difficulty}/5 difficulty
              </span>
            </div>

            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: accent, margin: '0 0 0.5rem' }}>
              Week-by-Week Plan
            </p>
            {selectedProject.weeks.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: accent,
                }}>
                  {wi + 1}
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', lineHeight: 1.5, color: '#1A1A2E', margin: 0 }}>
                  {week}
                </p>
              </div>
            ))}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {selectedProject.tools.map((tool, ti) => (
                <span key={ti} style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 500,
                  padding: '3px 8px', borderRadius: 100, background: `${accent}10`, color: accent,
                }}>
                  {tool}
                </span>
              ))}
            </div>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button
                onClick={(e) => { e.stopPropagation(); exportPlan(selectedProject); }}
                style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600,
                  padding: '0.5rem 1.25rem', borderRadius: 100, border: 'none', cursor: 'pointer',
                  background: '#1A1A2E', color: '#FAF8F5', minHeight: 44,
                }}
              >
                {copied ? 'Copied!' : 'Export Plan'}
              </button>
            </div>
          </BottomSheet>
        )}
      </div>
    );
  }

  /* ============ DESKTOP LAYOUT (unchanged) ============ */
  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${accent}, ${accent}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>Project Planner</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>Find the perfect capstone project</p>
          </div>
        </div>
      </div>

      {/* Progress indicators */}
      <div style={{ padding: '1.25rem 2rem 0', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
        {stepLabels.map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                background: i <= step ? accent : 'rgba(26,26,46,0.06)',
                color: i <= step ? 'white' : '#6B7280', transition: 'all 0.3s ease',
              }}>
                {i < step ? '\u2713' : i + 1}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: i <= step ? accent : '#6B728080', letterSpacing: '0.04em' }}>
                {label}
              </span>
            </div>
            {i < 3 && (
              <div style={{ width: 32, height: 1, background: i < step ? accent : 'rgba(26,26,46,0.08)', transition: 'all 0.3s ease', marginBottom: 16 }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: '1.5rem 2rem 2rem' }}>
        {step === 0 && (
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1A2E', margin: '0 0 0.5rem', textAlign: 'center' }}>What interests you?</h4>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#6B7280', textAlign: 'center', margin: '0 0 1.5rem' }}>Pick one or more topics that excite you.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
              {interestOptions.map((opt) => {
                const isActive = interests.includes(opt.id);
                return (
                  <button key={opt.id} onClick={() => toggleInterest(opt.id)} style={{
                    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 6,
                    padding: '1rem 0.75rem', borderRadius: 12,
                    border: `1.5px solid ${isActive ? accent : 'rgba(26,26,46,0.08)'}`,
                    background: isActive ? `${accent}0A` : 'transparent', cursor: 'pointer', transition: 'all 0.25s', minHeight: 44,
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = `${accent}40`; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}>
                    <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: isActive ? 600 : 400, color: isActive ? accent : '#1A1A2E' }}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1A2E', margin: '0 0 0.5rem', textAlign: 'center' }}>How much coding experience do you have?</h4>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#6B7280', textAlign: 'center', margin: '0 0 1.5rem' }}>Be honest. There's a great project for every level.</p>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10, maxWidth: 400, margin: '0 auto' }}>
              {experienceLevels.map((opt) => {
                const isActive = experience === opt.id;
                return (
                  <button key={opt.id} onClick={() => setExperience(opt.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.25rem', borderRadius: 12,
                    border: `1.5px solid ${isActive ? accent : 'rgba(26,26,46,0.08)'}`,
                    background: isActive ? `${accent}0A` : 'transparent', cursor: 'pointer', transition: 'all 0.25s', textAlign: 'left' as const, minHeight: 44,
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = `${accent}40`; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, border: `2px solid ${isActive ? accent : 'rgba(26,26,46,0.15)'}`, background: isActive ? accent : 'transparent', transition: 'all 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                    </div>
                    <div>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: isActive ? 600 : 400, color: isActive ? accent : '#1A1A2E', display: 'block' }}>{opt.label}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#6B7280' }}>{opt.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1A2E', margin: '0 0 0.5rem', textAlign: 'center' }}>How much time do you have?</h4>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#6B7280', textAlign: 'center', margin: '0 0 1.5rem' }}>Every timeframe can produce something real.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' as const }}>
              {timeOptions.map((opt) => {
                const isActive = time === opt.id;
                return (
                  <button key={opt.id} onClick={() => setTime(opt.id)} style={{
                    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4,
                    padding: '1.25rem 2rem', borderRadius: 12, minWidth: 130,
                    border: `1.5px solid ${isActive ? accent : 'rgba(26,26,46,0.08)'}`,
                    background: isActive ? `${accent}0A` : 'transparent', cursor: 'pointer', transition: 'all 0.25s', minHeight: 44,
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = `${accent}40`; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: isActive ? accent : '#1A1A2E' }}>{opt.label}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#6B7280' }}>{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1A2E', margin: '0 0 0.5rem', textAlign: 'center' }}>Your Project Ideas</h4>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#6B7280', textAlign: 'center', margin: '0 0 1.5rem' }}>Based on your interests, experience, and timeline. Click one to see the full plan.</p>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
              {projects.map((project, i) => {
                const isExpanded = selectedProject?.title === project.title;
                return (
                  <div key={i} style={{ borderRadius: 12, border: `1.5px solid ${isExpanded ? accent : 'rgba(26,26,46,0.08)'}`, background: isExpanded ? `${accent}05` : 'transparent', overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'pointer' }}>
                    <div onClick={() => setSelectedProject(isExpanded ? null : project)} style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <h5 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: '#1A1A2E', margin: 0 }}>{project.title}</h5>
                          <div style={{ display: 'flex', gap: 2 }}>
                            {Array.from({ length: 5 }, (_, j) => (<span key={j} style={{ fontSize: '0.75rem', color: j < project.difficulty ? accent : '#E5E7EB' }}>{'\u2605'}</span>))}
                          </div>
                        </div>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.6, color: '#6B7280', margin: 0 }}>{project.description}</p>
                      </div>
                      <span style={{ fontSize: '1rem', color: '#6B7280', flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s' }}>{'\u25BC'}</span>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid rgba(26,26,46,0.06)' }}>
                        <div style={{ paddingTop: '1.25rem' }}>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: accent, margin: '0 0 0.75rem' }}>Week-by-Week Plan</p>
                          {project.weeks.map((week, wi) => (
                            <div key={wi} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                              <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: accent }}>{wi + 1}</div>
                              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.6, color: '#1A1A2E', margin: 0 }}>{week}</p>
                            </div>
                          ))}
                          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                            {project.tools.map((tool, ti) => (<span key={ti} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 500, padding: '3px 10px', borderRadius: 100, background: `${accent}10`, color: accent }}>{tool}</span>))}
                          </div>
                          <div style={{ marginTop: 16, textAlign: 'right' as const }}>
                            <button onClick={(e) => { e.stopPropagation(); exportPlan(project); }} style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: 100, border: 'none', cursor: 'pointer', background: '#1A1A2E', color: '#FAF8F5', transition: 'all 0.25s', minHeight: 44 }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>{copied ? 'Copied!' : 'Export Plan'}</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <button onClick={() => { setStep(0); setInterests([]); setExperience(''); setTime(''); setSelectedProject(null); }} style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 500, padding: '0.5rem 1.25rem', borderRadius: 100, border: '1px solid rgba(26,26,46,0.12)', background: 'transparent', cursor: 'pointer', color: '#6B7280', transition: 'all 0.25s', minHeight: 44 }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = accent}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(26,26,46,0.12)'}>Start Over</button>
            </div>
          </div>
        )}

        {step < 3 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button onClick={() => setStep((s) => s - 1)} disabled={step === 0} style={{
              fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500, padding: '0.6rem 1.25rem', borderRadius: 100,
              border: '1px solid rgba(26,26,46,0.12)', background: 'transparent', cursor: step === 0 ? 'default' : 'pointer',
              color: step === 0 ? '#CBD5E1' : '#6B7280', transition: 'all 0.25s', opacity: step === 0 ? 0.4 : 1, minHeight: 44,
            }}>{'\u2190'} Back</button>
            <button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} style={{
              fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, padding: '0.6rem 1.5rem', borderRadius: 100, border: 'none',
              cursor: canProceed() ? 'pointer' : 'default', background: canProceed() ? '#1A1A2E' : '#E5E7EB',
              color: canProceed() ? '#FAF8F5' : '#9CA3AF', transition: 'all 0.25s', minHeight: 44,
            }}
            onMouseEnter={(e) => canProceed() && (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => canProceed() && (e.currentTarget.style.transform = 'scale(1)')}>
              {step === 2 ? 'Find Projects' : 'Next'} {'\u2192'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
