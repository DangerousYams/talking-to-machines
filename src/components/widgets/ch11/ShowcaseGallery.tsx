import { useState } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';

interface Project {
  title: string;
  creator: string;
  track: string;
  trackIcon: string;
  gradient: string;
  description: string;
  fullDescription: string;
  prompts: string[];
  reflection: string;
  tools: string[];
}

const projects: Project[] = [
  {
    title: 'Dungeon of Echoes',
    creator: 'Maya R.',
    track: 'Game Maker',
    trackIcon: '\uD83C\uDFAE',
    gradient: 'linear-gradient(135deg, #7B61FF 0%, #E94560 100%)',
    description: 'AI-generated branching narrative game with 50+ unique endings.',
    fullDescription: 'A text-based adventure game where every choice leads to a genuinely different path. Maya used AI to generate narrative branches, then hand-edited each one for consistency and emotional impact. The game features a memory system that references earlier choices, creating a deeply personalized experience. Built over 3 weeks using Claude for narrative generation and Twine for the game engine.',
    prompts: [
      '"You are a dark fantasy narrator. The player just entered a library where books whisper. Generate 3 choices, each leading to a tonally different scene. One should be dangerous, one mysterious, one humorous."',
      '"Review this story branch for internal consistency. Does it contradict anything established in these earlier scenes? [pasted context]"',
      '"Generate a dramatic ending for a player who chose the path of diplomacy throughout the game. Reference their key choices: [list]. Make it feel earned, not generic."',
    ],
    reflection: 'The hardest part wasn\'t getting AI to write -- it was getting it to remember. I had to build a "story bible" document that I pasted into every prompt so the AI knew what had already happened. That taught me more about context engineering than any tutorial.',
    tools: ['Claude', 'Twine', 'Midjourney', 'Canva'],
  },
  {
    title: 'The Last Archive',
    creator: 'James T.',
    track: 'Storyteller',
    trackIcon: '\uD83D\uDCD6',
    gradient: 'linear-gradient(135deg, #0F3460 0%, #16C79A 100%)',
    description: 'Short story collection where each story was co-written with AI in a different style.',
    fullDescription: 'A collection of 7 short stories, each exploring a different literary style: noir, magical realism, hard sci-fi, Southern Gothic, stream of consciousness, epistolary, and fairy tale. James wrote the first draft of each opening, then collaborated with AI differently for each story -- sometimes using it as a co-writer, sometimes as an editor, sometimes as a devil\'s advocate. The result is a study in AI collaboration styles as much as a literary project.',
    prompts: [
      '"I\'m writing in the style of Gabriel Garcia Marquez. Here\'s my opening paragraph. Continue the story for 500 words, maintaining the magical realism tone -- extraordinary things described in matter-of-fact language."',
      '"Act as a harsh literary editor. Tear this draft apart. What\'s cliche? Where does the voice falter? Where am I telling instead of showing? Be brutally specific."',
      '"Rewrite this dialogue in the style of Cormac McCarthy -- no quotation marks, sparse, with the violence implied rather than shown."',
    ],
    reflection: 'I learned that AI is a mirror. When I gave it lazy prompts, I got lazy stories. When I pushed it with specific references and high standards, it pushed back with genuinely surprising ideas. The co-writing process made me a better writer because I had to articulate exactly what "good" meant to me.',
    tools: ['Claude', 'Google Docs', 'Canva'],
  },
  {
    title: 'StudySync',
    creator: 'Priya K.',
    track: 'App Builder',
    trackIcon: '\uD83D\uDCBB',
    gradient: 'linear-gradient(135deg, #F5A623 0%, #E94560 100%)',
    description: 'Flashcard app that uses AI to generate questions from uploaded notes.',
    fullDescription: 'A web application where students paste their class notes and AI generates three types of study materials: flashcards for key terms, practice questions that test understanding (not just recall), and a concept map showing how ideas connect. Priya built a spaced repetition system that tracks which cards you struggle with and shows them more frequently. The app adapts difficulty based on your accuracy streak.',
    prompts: [
      '"Analyze these biology notes and generate 15 flashcards. For each card, create a question that tests understanding, not just memorization. Bad example: \'What is mitosis?\' Good example: \'Why would a cell that skips the G1 checkpoint be dangerous?\'"',
      '"Given these 20 flashcard topics from a chemistry unit, create a concept map showing which ideas depend on each other. Output as a JSON structure with nodes and edges."',
      '"The student got this question wrong 3 times. Generate a simpler version that breaks the concept into smaller pieces, then a hint that guides them without giving the answer."',
    ],
    reflection: 'Building this taught me that the hardest part of AI apps isn\'t the AI -- it\'s the UX. Getting the flashcard generation working took one afternoon. Making the interface feel good to study with took two weeks. The AI is maybe 20% of the app. The other 80% is design decisions.',
    tools: ['Claude Code', 'React', 'Tailwind CSS', 'Supabase'],
  },
  {
    title: 'Climate Claims Checker',
    creator: 'Alex M.',
    track: 'Researcher',
    trackIcon: '\uD83D\uDD2C',
    gradient: 'linear-gradient(135deg, #16C79A 0%, #0EA5E9 100%)',
    description: 'Tool that fact-checks climate statistics using AI + real data sources.',
    fullDescription: 'A web tool where you paste a climate-related claim and it returns a confidence rating with sources. Alex built a pipeline that breaks claims into checkable components, searches for peer-reviewed data, and synthesizes a verdict. The tool is transparent about its limitations -- it shows its reasoning chain and flags when it can\'t find reliable sources. Tested against 100+ claims from social media with 87% accuracy.',
    prompts: [
      '"Break this climate claim into its individual factual components: \'Electric cars produce more CO2 than gasoline cars when you factor in battery manufacturing.\' For each component, tell me what specific data point I would need to verify it."',
      '"Given these 5 sources about EV battery lifecycle emissions, synthesize the findings. Where do they agree? Where do they disagree? What\'s the scientific consensus as of 2024? Rate your confidence 1-10."',
      '"A user submitted this claim. Your previous analysis found it to be misleading. Write a 3-sentence summary that a high school student would understand. Avoid jargon. Be fair -- acknowledge what\'s true in the claim before explaining what\'s wrong."',
    ],
    reflection: 'I went in thinking AI would just "know" the answers. It doesn\'t. It makes stuff up about climate data all the time. That\'s actually why the tool is useful -- I built the verification pipeline because I learned you can\'t trust AI claims. The irony is that learning about AI hallucinations is what made the project work.',
    tools: ['Claude Code', 'Perplexity', 'Python', 'React'],
  },
  {
    title: 'Dreamscapes',
    creator: 'Sofia L.',
    track: 'Artist',
    trackIcon: '\uD83C\uDFA8',
    gradient: 'linear-gradient(135deg, #E94560 0%, #7B61FF 100%)',
    description: 'Series of AI-assisted digital art pieces exploring surreal landscapes.',
    fullDescription: 'A 12-piece art series where each piece starts with a real photograph Sofia took, which she then transformed through multiple rounds of AI-assisted editing and generation. The concept: "What do familiar places look like in dreams?" Each piece comes with a written reflection on the artistic choices -- what she kept from the AI, what she changed, and why. The series was exhibited at her school\'s art show and sparked conversations about authorship in AI art.',
    prompts: [
      '"Transform this photograph of a suburban backyard into a surrealist dreamscape in the style of Remedios Varo. Keep the basic composition but replace mundane elements with fantastical ones. The swing set should become something organic and alive."',
      '"This image is 80% there but the sky feels too literal. Generate 5 variations of just the sky portion -- I want something that feels like the sky is made of layered fabric or folded paper. Reference Magritte\'s sense of the uncanny."',
      '"I need artist statement language for a piece about transforming a school hallway into a dreamscape. The tone should be thoughtful, not pretentious. Reference the concept of liminal spaces and how AI lets us externalize internal mental imagery."',
    ],
    reflection: 'People kept asking "but did YOU make it?" and I realized that\'s the wrong question. I made every creative decision. I chose the source photos, directed the transformations, rejected 90% of what AI generated, combined elements from different outputs, and knew when to stop. The AI was my brush, not my brain.',
    tools: ['Midjourney', 'Stable Diffusion', 'Photoshop', 'Claude'],
  },
  {
    title: 'TaskPilot',
    creator: 'Marcus W.',
    track: 'Agent Builder',
    trackIcon: '\uD83E\uDD16',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #0F3460 100%)',
    description: 'Multi-agent system that breaks down homework assignments into manageable steps.',
    fullDescription: 'An AI agent system with three specialized agents: the Planner (breaks assignments into tasks), the Researcher (finds relevant resources for each task), and the Coach (checks in on progress and adjusts the plan). Marcus designed the handoff protocol between agents so each one receives a structured summary from the previous one. The system handles everything from essay assignments to lab reports to group projects, adapting its breakdown strategy to the assignment type.',
    prompts: [
      '"You are the Planner agent. Analyze this assignment description and break it into 5-8 concrete tasks. For each task, estimate time in minutes, list what tools or resources are needed, and identify any dependencies (tasks that must be completed first). Output as structured JSON."',
      '"You are the Researcher agent. For this task: \'Write a thesis statement about the causes of the French Revolution,\' find 3 specific, reliable starting points the student should read. Explain in 1 sentence why each source is useful. Do NOT write the thesis for them."',
      '"You are the Coach agent. The student has been stuck on task 3 for 45 minutes (estimated time was 20 minutes). Ask 2 clarifying questions to diagnose the block, then suggest a smaller first step they can complete in 5 minutes to build momentum."',
    ],
    reflection: 'The biggest lesson was about agent handoffs. My first version had agents passing huge blobs of text to each other and it was chaos. When I designed a strict schema for what each agent passes to the next -- just the essential structured data -- everything clicked. Constraints make agents smarter, just like constraints make prompts better.',
    tools: ['Claude Code', 'React', 'Node.js', 'Supabase'],
  },
];

const trackFilters = ['All', 'Game Maker', 'Storyteller', 'App Builder', 'Researcher', 'Artist', 'Agent Builder'];

export default function ShowcaseGallery() {
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState('All');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const accent = '#16C79A';
  const filtered = filter === 'All' ? projects : projects.filter((p) => p.track === filter);

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: isMobile ? '1.25rem 1rem' : '1.5rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${accent}, ${accent}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>Student Showcase</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>Projects built by learners like you</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        padding: isMobile ? '0.75rem 1rem' : '1rem 2rem',
        borderBottom: '1px solid rgba(26,26,46,0.04)',
        display: 'flex', gap: 6,
        flexWrap: isMobile ? 'nowrap' as const : 'wrap' as const,
        overflowX: isMobile ? 'auto' as const : 'visible' as const,
        WebkitOverflowScrolling: 'touch' as any,
        msOverflowStyle: 'none' as const,
        scrollbarWidth: 'none' as const,
      }}>
        {trackFilters.map((t) => (
          <button
            key={t}
            onClick={() => { setFilter(t); setExpandedProject(null); }}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: filter === t ? 600 : 400,
              padding: '5px 12px', borderRadius: 100, border: 'none', cursor: 'pointer',
              background: filter === t ? `${accent}15` : 'transparent',
              color: filter === t ? accent : '#6B7280',
              transition: 'all 0.25s',
              whiteSpace: isMobile ? 'nowrap' as const : undefined,
              flexShrink: 0,
              minHeight: 44,
              display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={(e) => { if (filter !== t) e.currentTarget.style.background = 'rgba(26,26,46,0.04)'; }}
            onMouseLeave={(e) => { if (filter !== t) e.currentTarget.style.background = 'transparent'; }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ padding: isMobile ? '1rem' : '1.5rem 2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: isMobile ? 12 : 16,
        }}>
          {filtered.map((project) => {
            const isExpanded = expandedProject === project.title;

            return (
              <div
                key={project.title}
                onClick={() => setExpandedProject(isExpanded ? null : project.title)}
                style={{
                  borderRadius: 12, border: `1px solid ${isExpanded ? accent : 'rgba(26,26,46,0.06)'}`,
                  overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s ease',
                  gridColumn: isExpanded ? '1 / -1' : 'auto',
                }}
              >
                {/* Thumbnail gradient */}
                <div style={{ height: isExpanded ? (isMobile ? 80 : 100) : (isMobile ? 100 : 120), background: project.gradient, position: 'relative' }}>
                  <div style={{
                    position: 'absolute', bottom: 10, left: 12,
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                    padding: '3px 10px', borderRadius: 100,
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: '#1A1A2E',
                  }}>
                    <span>{project.trackIcon}</span> {project.track}
                  </div>
                </div>

                <div style={{ padding: isMobile ? '0.75rem 1rem' : '1rem 1.25rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: '#1A1A2E', margin: '0 0 4px' }}>
                    {project.title}
                  </h4>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280', margin: '0 0 8px' }}>
                    by {project.creator}
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.55, color: '#6B7280', margin: 0 }}>
                    {isExpanded ? project.fullDescription : project.description}
                  </p>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div style={{ marginTop: 20 }}>
                      {/* Key prompts */}
                      <div style={{ marginBottom: 20 }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: accent, margin: '0 0 10px' }}>
                          Key Prompts That Worked
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                          {project.prompts.map((prompt, pi) => (
                            <div key={pi} style={{
                              background: 'rgba(26,26,46,0.025)', border: '1px solid rgba(26,26,46,0.06)', borderRadius: 8,
                              padding: isMobile ? '8px 10px' : '10px 14px', fontFamily: 'var(--font-mono)', fontSize: isMobile ? '0.7rem' : '0.75rem', lineHeight: 1.6,
                              color: '#1A1A2E', wordBreak: 'break-word' as const,
                            }}>
                              {prompt}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reflection */}
                      <div style={{ marginBottom: 16 }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: accent, margin: '0 0 10px' }}>
                          Creator's Reflection
                        </p>
                        <div style={{
                          borderLeft: `3px solid ${accent}`, paddingLeft: '1rem',
                          fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontStyle: 'italic' as const,
                          lineHeight: 1.7, color: '#1A1A2E',
                        }}>
                          "{project.reflection}"
                        </div>
                      </div>

                      {/* Tools */}
                      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                        {project.tools.map((tool, ti) => (
                          <span key={ti} style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 500,
                            padding: '3px 10px', borderRadius: 100, background: `${accent}10`, color: accent,
                          }}>
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit section */}
        <div style={{
          marginTop: isMobile ? 16 : 24, padding: isMobile ? '1rem' : '1.5rem', borderRadius: 12,
          background: `linear-gradient(135deg, ${accent}08, ${accent}03)`,
          border: `1px dashed ${accent}30`, textAlign: 'center' as const,
        }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: '#1A1A2E', margin: '0 0 6px' }}>
            Your project could be here.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#6B7280', margin: '0 0 12px', maxWidth: '45ch', marginLeft: 'auto', marginRight: 'auto' }}>
            Build something you're proud of, document your process, and share it with the community. Every project in this gallery started exactly where you are now.
          </p>
          <div style={{
            display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
            padding: '8px 20px', borderRadius: 100, background: `${accent}15`, color: accent,
          }}>
            Submissions opening soon
          </div>
        </div>
      </div>
    </div>
  );
}
