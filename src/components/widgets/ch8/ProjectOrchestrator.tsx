import { useState, useCallback } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import BottomSheet from '../../cards/BottomSheet';

/* ─── Types ─── */
interface TaskCard {
  id: string;
  name: string;
  aiInteractions: number;
  dependencies: string[];
  description: string;
  simulatedChat: { role: 'user' | 'ai'; text: string }[];
  output: string;
}

interface ProjectTemplate {
  label: string;
  description: string;
  tasks: TaskCard[];
}

type Column = 'todo' | 'inProgress' | 'done';

/* ─── Project Templates ─── */
const projects: Record<string, ProjectTemplate> = {
  game: {
    label: 'Make a Game',
    description: 'A 2D puzzle platformer with original art and music',
    tasks: [
      {
        id: 'g1', name: 'Define game concept', aiInteractions: 2, dependencies: [],
        description: 'Nail down the core mechanic, theme, and target audience.',
        simulatedChat: [
          { role: 'user', text: 'Help me brainstorm a puzzle platformer concept for teens. Core mechanic: gravity shifting.' },
          { role: 'ai', text: 'Great concept! Here are three directions:\n1. "Flip" - A noir-styled world where gravity inverts when you solve logic puzzles\n2. "Orbit" - A space station where each room has its own gravity field\n3. "Shift" - A painting that comes alive, where rotating the canvas changes gravity' },
        ],
        output: 'Game concept doc: "Shift" - a puzzle platformer inside a living painting. Core mechanic: rotating canvas changes gravity direction. Target: teens 13-18. Art style: watercolor.',
      },
      {
        id: 'g2', name: 'Design 5 core levels', aiInteractions: 4, dependencies: ['g1'],
        description: 'Create level layouts that teach mechanics progressively.',
        simulatedChat: [
          { role: 'user', text: 'Based on the "Shift" concept, design level 1 that teaches gravity rotation without any text tutorial.' },
          { role: 'ai', text: 'Level 1: "First Brushstroke"\n- Single room, one exit on the ceiling\n- Player naturally tries to jump (can\'t reach)\n- A glowing canvas frame on the wall invites interaction\n- Rotating shifts gravity up, player "falls" to the exit\n- Teaches: rotation mechanic through environmental storytelling' },
        ],
        output: 'Level design document with 5 progressively complex levels, each introducing one new mechanic variation.',
      },
      {
        id: 'g3', name: 'Generate art assets', aiInteractions: 5, dependencies: ['g1'],
        description: 'Create character sprites, backgrounds, and UI elements.',
        simulatedChat: [
          { role: 'user', text: 'I need a character sprite concept for the player in "Shift" - watercolor style, simple enough to animate in 2D.' },
          { role: 'ai', text: 'Character concept: "The Brushstroke"\n- A small figure made of living paint\n- Leaves colorful trails when moving\n- Expression changes with gravity (surprised when falling up)\n- 4-frame walk cycle, 2-frame jump\n- Palette: warm ochres and deep indigos against light canvas' },
        ],
        output: 'Art direction guide with character concept, 5 background themes, and UI mockup descriptions.',
      },
      {
        id: 'g4', name: 'Build game engine scaffolding', aiInteractions: 3, dependencies: ['g2'],
        description: 'Set up the project structure, physics, and gravity system.',
        simulatedChat: [
          { role: 'user', text: 'Scaffold a Pygame project with gravity rotation. I need: player movement, collision detection, and 4-directional gravity switching.' },
          { role: 'ai', text: 'Here\'s the project structure:\n/shift-game\n  /assets (sprites, sounds)\n  /levels (JSON level data)\n  main.py (game loop)\n  player.py (movement + gravity)\n  world.py (collision + rotation)\n  camera.py (smooth follow)\n\nThe gravity system uses a direction vector that rotates 90 degrees on input...' },
        ],
        output: 'Working game scaffold with player movement, collision detection, and gravity rotation system.',
      },
      {
        id: 'g5', name: 'Implement levels', aiInteractions: 4, dependencies: ['g4', 'g2'],
        description: 'Build all 5 levels with puzzles, triggers, and progression.',
        simulatedChat: [
          { role: 'user', text: 'Help me implement the level loading system. Levels are defined in JSON with tile data, spawn points, and trigger zones.' },
          { role: 'ai', text: 'Here\'s a level loader that reads JSON tile maps:\n\nclass Level:\n  def __init__(self, path):\n    with open(path) as f:\n      data = json.load(f)\n    self.tiles = self.parse_tiles(data["layers"])\n    self.spawn = tuple(data["spawn"])\n    self.triggers = [Trigger(**t) for t in data["triggers"]]...' },
        ],
        output: 'Five playable levels with all puzzles, triggers, and win conditions implemented.',
      },
      {
        id: 'g6', name: 'Compose music & SFX', aiInteractions: 2, dependencies: ['g1'],
        description: 'Create ambient music and sound effects that match the watercolor theme.',
        simulatedChat: [
          { role: 'user', text: 'Describe a soundtrack direction for "Shift" - ambient, painterly, with cues for gravity changes.' },
          { role: 'ai', text: 'Soundtrack direction:\n- Base: soft piano arpeggios with watercolor-wash reverb\n- Gravity shift: ascending harp glissando (up), descending marimba (down)\n- Puzzle solved: gentle chime cluster, like paint drops hitting water\n- Ambient: layered field recordings (rain, brushstrokes)\n- Each level adds one instrument to build the palette' },
        ],
        output: 'Music direction doc and 6 SFX descriptions ready for audio generation tools.',
      },
      {
        id: 'g7', name: 'Playtest & polish', aiInteractions: 3, dependencies: ['g5', 'g3', 'g6'],
        description: 'Test all levels, fix bugs, tune difficulty, add juice.',
        simulatedChat: [
          { role: 'user', text: 'I playtested level 3 and it\'s too hard. Players can\'t figure out the double-rotation puzzle. How do I add hints without breaking the "no text" rule?' },
          { role: 'ai', text: 'Environmental hint strategies:\n1. Particle trails: faint paint drops show the gravity path before the player commits\n2. Canvas cracks: subtle lines on the background suggest rotation direction\n3. NPC brushstroke: a tiny paint creature demos the mechanic in the background\n4. Progressive disclosure: first attempt shows a ghost preview of where you\'ll land' },
        ],
        output: 'Bug-fixed, difficulty-tuned game with visual hints and particle effects.',
      },
    ],
  },
  magazine: {
    label: 'Write a Magazine Article',
    description: 'A longform feature article about AI in creative industries',
    tasks: [
      {
        id: 'm1', name: 'Research the topic', aiInteractions: 3, dependencies: [],
        description: 'Gather sources, statistics, and expert perspectives.',
        simulatedChat: [
          { role: 'user', text: 'I\'m writing about how AI is changing music production. Find me 5 key angles to explore.' },
          { role: 'ai', text: '5 angles for AI in music production:\n1. Democratization: bedroom producers using AI to sound professional\n2. The authenticity debate: is AI-assisted music "real"?\n3. Copyright grey zones: who owns AI-generated melodies?\n4. New instruments: AI as a creative collaborator, not replacement\n5. The economics: how streaming + AI changes who gets paid' },
        ],
        output: 'Research brief with 5 angles, 12 sources, and 3 potential interview subjects.',
      },
      {
        id: 'm2', name: 'Create article outline', aiInteractions: 2, dependencies: ['m1'],
        description: 'Structure the piece with a compelling narrative arc.',
        simulatedChat: [
          { role: 'user', text: 'Help me outline a 3,000-word feature. I want to open with a specific producer\'s story, then zoom out.' },
          { role: 'ai', text: 'Outline: "The Ghost in the Mix"\n\nI. COLD OPEN (300 words): A 17-year-old producer in Lagos finishes a track that sounds like it was made in a million-dollar studio. It cost $0.\n\nII. THE SHIFT (500 words): How AI tools collapsed the gap between bedroom and professional...\n\nIII. THE TENSION (600 words): When a Grammy-nominated track is revealed to use AI...' },
        ],
        output: 'Detailed outline with 6 sections, word counts, source placement, and narrative transitions.',
      },
      {
        id: 'm3', name: 'Write first draft', aiInteractions: 5, dependencies: ['m2'],
        description: 'Draft each section, maintaining voice and narrative flow.',
        simulatedChat: [
          { role: 'user', text: 'Write the cold open section. Tone: literary journalism, present tense, vivid sensory detail. Max 300 words.' },
          { role: 'ai', text: 'The bass hits at 2 AM Lagos time, rattling the single speaker balanced on Chidi Okafor\'s physics textbook. He\'s seventeen, hunched over a cracked laptop screen, and the track he\'s building sounds like it was mixed in Abbey Road...' },
        ],
        output: 'Complete 3,000-word first draft with all sections, transitions, and source citations.',
      },
      {
        id: 'm4', name: 'Fact-check claims', aiInteractions: 2, dependencies: ['m3'],
        description: 'Verify every statistic, quote, and factual claim.',
        simulatedChat: [
          { role: 'user', text: 'Fact-check this claim from my draft: "AI-generated music on Spotify grew 400% in 2024." Is this accurate?' },
          { role: 'ai', text: 'I cannot verify that exact statistic. Here\'s what I found:\n- Spotify removed 7% of tracks flagged as AI-generated in 2024 (Reuters)\n- The number of tracks using AI tools is hard to measure since many producers use AI partially\n- Recommendation: rephrase to "the volume of AI-assisted tracks on streaming platforms has surged, though exact figures are disputed"' },
        ],
        output: 'Fact-check report: 3 claims corrected, 2 statistics updated with proper sourcing.',
      },
      {
        id: 'm5', name: 'Edit and polish prose', aiInteractions: 3, dependencies: ['m3', 'm4'],
        description: 'Tighten language, strengthen transitions, cut fluff.',
        simulatedChat: [
          { role: 'user', text: 'This paragraph feels flabby. Tighten it without losing the voice:\n"The thing about AI in music is that it\'s really changing a lot of things about how people make music these days."' },
          { role: 'ai', text: 'Options:\n1. "AI didn\'t just change how music is made. It changed who gets to make it."\n2. "The revolution isn\'t in the sound. It\'s in the access."\n3. "Three years ago, this track would have required a studio. Now it requires a laptop and taste."' },
        ],
        output: 'Polished final draft: tighter prose, stronger transitions, 2,800 words.',
      },
      {
        id: 'm6', name: 'Design layout & visuals', aiInteractions: 2, dependencies: ['m5', 'm1'],
        description: 'Create pull quotes, image captions, and layout notes.',
        simulatedChat: [
          { role: 'user', text: 'Suggest 3 pull quotes from my article and describe hero image concepts.' },
          { role: 'ai', text: 'Pull quotes:\n1. "The revolution isn\'t in the sound. It\'s in the access."\n2. "He\'s seventeen, and the track sounds like Abbey Road."\n3. "AI is the best session musician who ever lived \u2014 and charges nothing."\n\nHero image concept: Split frame \u2014 left side shows a professional mixing board, right side shows a laptop with headphones on a messy desk. Both producing the same waveform.' },
        ],
        output: 'Layout guide with 3 pull quotes, hero image direction, and sidebar content plan.',
      },
    ],
  },
  app: {
    label: 'Build an App',
    description: 'A study group organizer app with AI-powered scheduling',
    tasks: [
      {
        id: 'a1', name: 'Define requirements', aiInteractions: 2, dependencies: [],
        description: 'Clarify features, user stories, and technical constraints.',
        simulatedChat: [
          { role: 'user', text: 'I want to build a study group app for high schoolers. Core features: group creation, schedule matching, AI study plan. Help me write user stories.' },
          { role: 'ai', text: 'User stories for "StudySync":\n\n1. As a student, I want to create a study group for my AP Bio class so my friends can join\n2. As a group member, I want to input my free times so the app finds when we can all meet\n3. As a group leader, I want AI to generate a study plan based on our exam date and topics\n4. As a student, I want to see what topics each person will cover so we don\'t overlap\n5. As a user, I want push notifications when study sessions are scheduled' },
        ],
        output: 'Requirements doc with 8 user stories, tech stack decision (React + Supabase), and MVP scope.',
      },
      {
        id: 'a2', name: 'Design database schema', aiInteractions: 2, dependencies: ['a1'],
        description: 'Model users, groups, schedules, and study plans.',
        simulatedChat: [
          { role: 'user', text: 'Design a database schema for StudySync. I need: users, groups, availability slots, and study plans.' },
          { role: 'ai', text: 'Schema:\n\nusers: id, name, email, school\ngroups: id, name, subject, exam_date, created_by\ngroup_members: user_id, group_id, role\navailability: user_id, day_of_week, start_time, end_time\nstudy_plans: group_id, generated_at, plan_json\nsessions: group_id, datetime, location, topics[], assigned_to[]' },
        ],
        output: 'Database schema with 6 tables, relationships, and RLS policies.',
      },
      {
        id: 'a3', name: 'Build UI components', aiInteractions: 4, dependencies: ['a1'],
        description: 'Create reusable React components for the interface.',
        simulatedChat: [
          { role: 'user', text: 'Build me a GroupCard component in React. Show group name, subject, member count, next session date. Tailwind styling.' },
          { role: 'ai', text: 'export function GroupCard({ group }) {\n  return (\n    <div className="rounded-xl border p-4 hover:shadow-md transition">\n      <div className="flex items-center justify-between">\n        <h3 className="font-semibold">{group.name}</h3>\n        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{group.subject}</span>\n      </div>\n      <p className="text-sm text-gray-500 mt-2">{group.memberCount} members</p>\n      <p className="text-sm mt-1">Next: {group.nextSession}</p>\n    </div>\n  );\n}' },
        ],
        output: 'Component library: GroupCard, AvailabilityGrid, StudyPlanView, SessionCard, MemberList.',
      },
      {
        id: 'a4', name: 'Implement scheduling algorithm', aiInteractions: 3, dependencies: ['a2'],
        description: 'Find overlapping free times across all group members.',
        simulatedChat: [
          { role: 'user', text: 'Write an algorithm that finds the best meeting times given each member\'s weekly availability. Prefer times where ALL members can attend, then fall back to majority.' },
          { role: 'ai', text: 'function findBestTimes(members, minDuration = 60) {\n  // Create a time grid (7 days x 48 half-hour slots)\n  const grid = new Array(7).fill(null).map(() => new Array(48).fill(0));\n  \n  // Count availability per slot\n  members.forEach(m => {\n    m.availability.forEach(slot => {\n      const daySlots = getSlotRange(slot.start, slot.end);\n      daySlots.forEach(s => grid[slot.day][s]++);\n    });\n  });\n  \n  // Find consecutive slots where count === members.length\n  // Then fall back to count >= ceil(members.length * 0.75)...' },
        ],
        output: 'Scheduling algorithm that finds optimal group meeting times from individual availability.',
      },
      {
        id: 'a5', name: 'Build AI study plan generator', aiInteractions: 3, dependencies: ['a2', 'a1'],
        description: 'Use AI to create topic breakdowns and assign study responsibilities.',
        simulatedChat: [
          { role: 'user', text: 'Create a function that calls Claude to generate a study plan. Input: subject, exam date, topics list, number of sessions, group size.' },
          { role: 'ai', text: 'async function generateStudyPlan({ subject, examDate, topics, sessions, groupSize }) {\n  const prompt = `Create a study plan for ${groupSize} students preparing for a ${subject} exam on ${examDate}.\n  Topics to cover: ${topics.join(", ")}\n  Number of sessions: ${sessions}\n  \n  For each session, specify:\n  - Topics to cover\n  - Who presents what (rotate fairly)\n  - Practice problems\n  - Review strategy`;\n  \n  return await callClaude(prompt);\n}' },
        ],
        output: 'AI study plan generator that creates personalized, balanced study schedules.',
      },
      {
        id: 'a6', name: 'Connect everything', aiInteractions: 3, dependencies: ['a3', 'a4', 'a5'],
        description: 'Wire up frontend to backend, add auth, deploy.',
        simulatedChat: [
          { role: 'user', text: 'Help me connect my React frontend to Supabase. I need auth, real-time group updates, and the study plan API.' },
          { role: 'ai', text: 'Here\'s the integration layer:\n\n1. Auth: Use Supabase Auth with magic links (no password friction for teens)\n2. Real-time: Subscribe to group_members changes for live member count\n3. Study plan: Edge function that wraps your AI generator\n\nimport { createClient } from \'@supabase/supabase-js\';\nconst supabase = createClient(URL, ANON_KEY);\n\n// Real-time subscription\nsupabase.channel(\'group-\'+groupId)\n  .on(\'postgres_changes\', { event: \'*\', schema: \'public\', table: \'group_members\' }, handleChange)\n  .subscribe();' },
        ],
        output: 'Fully connected app with auth, real-time updates, and AI study plan generation.',
      },
      {
        id: 'a7', name: 'Test & deploy', aiInteractions: 2, dependencies: ['a6'],
        description: 'Write tests, fix edge cases, deploy to production.',
        simulatedChat: [
          { role: 'user', text: 'What are the critical edge cases I should test for the scheduling algorithm?' },
          { role: 'ai', text: 'Critical edge cases:\n1. Zero overlap: no time works for everyone (should suggest best partial match)\n2. Single member: should still generate valid times\n3. Timezone differences: if members span zones\n4. Back-to-back availability: slots that are adjacent but not overlapping\n5. Holiday/break conflicts: exam period scheduling\n6. Group size changes: recalculate when someone joins/leaves' },
        ],
        output: 'Test suite covering 12 edge cases, all passing. App deployed to Vercel.',
      },
    ],
  },
};

/* ─── Component ─── */
export default function ProjectOrchestrator() {
  const [activeProject, setActiveProject] = useState<'game' | 'magazine' | 'app'>('game');
  const [columns, setColumns] = useState<Record<string, Column>>({});
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [chatStep, setChatStep] = useState<Record<string, number>>({});

  const project = projects[activeProject];

  // Reset when project changes
  const handleProjectChange = useCallback((key: 'game' | 'magazine' | 'app') => {
    setActiveProject(key);
    setColumns({});
    setExpandedTask(null);
    setChatStep({});
  }, []);

  const getColumn = (taskId: string): Column => columns[taskId] || 'todo';

  const canMoveForward = (task: TaskCard): boolean => {
    const col = getColumn(task.id);
    if (col === 'done') return false;
    if (col === 'todo') {
      // Check dependencies are done
      return task.dependencies.every(dep => getColumn(dep) === 'done');
    }
    // inProgress -> done: needs to have "completed" the chat
    return true;
  };

  const moveForward = (task: TaskCard) => {
    const col = getColumn(task.id);
    if (col === 'todo' && canMoveForward(task)) {
      setColumns(prev => ({ ...prev, [task.id]: 'inProgress' }));
      setExpandedTask(task.id);
      setChatStep(prev => ({ ...prev, [task.id]: 0 }));
    } else if (col === 'inProgress') {
      setColumns(prev => ({ ...prev, [task.id]: 'done' }));
      setExpandedTask(null);
    }
  };

  const advanceChat = (taskId: string, maxSteps: number) => {
    setChatStep(prev => ({
      ...prev,
      [taskId]: Math.min((prev[taskId] || 0) + 1, maxSteps - 1),
    }));
  };

  const todoTasks = project.tasks.filter(t => getColumn(t.id) === 'todo');
  const inProgressTasks = project.tasks.filter(t => getColumn(t.id) === 'inProgress');
  const doneTasks = project.tasks.filter(t => getColumn(t.id) === 'done');

  const completedIds = new Set(doneTasks.map(t => t.id));

  const isMobile = useIsMobile();

  // Mobile bottom sheet state
  const [mobileSheetTask, setMobileSheetTask] = useState<TaskCard | null>(null);

  // Styles
  const accent = '#0F3460';

  const statusColor = (col: Column) =>
    col === 'done' ? '#16C79A' : col === 'inProgress' ? accent : '#CBD5E1';
  const statusLabel = (col: Column) =>
    col === 'done' ? 'Done' : col === 'inProgress' ? 'In Progress' : 'To Do';

  /* ─── MOBILE LAYOUT ─── */
  if (isMobile) {
    const openTaskSheet = (task: TaskCard) => {
      setMobileSheetTask(task);
      // Initialize chat step if entering in-progress
      if (getColumn(task.id) === 'inProgress' && chatStep[task.id] === undefined) {
        setChatStep(prev => ({ ...prev, [task.id]: 0 }));
      }
    };

    const doneCount = doneTasks.length;
    const totalCount = project.tasks.length;
    const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

    return (
      <div className="widget-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Compact header */}
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(26,26,46,0.06)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, flexShrink: 0,
            background: `linear-gradient(135deg, ${accent}, #0EA5E9)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
            Project Orchestrator
          </h3>
        </div>

        {/* Project selector tabs */}
        <div style={{
          padding: '0.5rem 1rem', borderBottom: '1px solid rgba(26,26,46,0.06)',
          background: 'rgba(26,26,46,0.015)', display: 'flex', gap: 6,
          overflowX: 'auto' as const, WebkitOverflowScrolling: 'touch' as const,
        }}>
          {(Object.keys(projects) as Array<'game' | 'magazine' | 'app'>).map(key => (
            <button
              key={key}
              onClick={() => handleProjectChange(key)}
              style={{
                padding: '0.4rem 0.85rem', borderRadius: 8, border: '1px solid',
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                background: activeProject === key ? accent : 'transparent',
                color: activeProject === key ? '#FAF8F5' : '#6B7280',
                borderColor: activeProject === key ? accent : 'rgba(26,26,46,0.1)',
                whiteSpace: 'nowrap' as const, flexShrink: 0,
                minHeight: 36,
              }}
            >
              {projects[key].label}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0.5rem 1rem' }}>
          {project.tasks.map(task => {
            const col = getColumn(task.id);
            const depsReady = task.dependencies.every(d => completedIds.has(d));
            const blocked = col === 'todo' && task.dependencies.length > 0 && !depsReady;
            return (
              <div
                key={task.id}
                onClick={() => openTaskSheet(task)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '0.65rem 0.5rem',
                  borderBottom: '1px solid rgba(26,26,46,0.04)',
                  opacity: blocked ? 0.5 : 1,
                  cursor: 'pointer',
                }}
              >
                {/* Status dot */}
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  background: statusColor(col),
                  border: col === 'todo' ? '2px solid #CBD5E1' : 'none',
                  boxSizing: 'border-box' as const,
                }} />
                {/* Task name */}
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600,
                  color: col === 'done' ? '#16C79A' : '#1A1A2E',
                  flex: 1, lineHeight: 1.3,
                  textDecoration: col === 'done' ? 'line-through' : 'none',
                }}>
                  {task.name}
                </span>
                {/* Status label */}
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600,
                  letterSpacing: '0.05em', textTransform: 'uppercase' as const,
                  color: statusColor(col), flexShrink: 0,
                }}>
                  {blocked ? 'Blocked' : statusLabel(col)}
                </span>
                {/* Chevron */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            );
          })}
        </div>

        {/* Progress bar at bottom */}
        <div style={{
          padding: '0.6rem 1rem', borderTop: '1px solid rgba(26,26,46,0.06)',
          background: `linear-gradient(135deg, rgba(15,52,96,0.04), rgba(14,165,233,0.04))`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#6B7280' }}>
              Progress
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: accent }}>
              {doneCount}/{totalCount} tasks ({progressPct}%)
            </span>
          </div>
          <div style={{
            height: 6, borderRadius: 3, background: 'rgba(26,26,46,0.06)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 3, transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              width: `${progressPct}%`,
              background: progressPct === 100 ? '#16C79A' : `linear-gradient(90deg, ${accent}, #0EA5E9)`,
            }} />
          </div>
        </div>

        {/* Bottom Sheet for task details */}
        <BottomSheet
          isOpen={mobileSheetTask !== null}
          onClose={() => setMobileSheetTask(null)}
          title={mobileSheetTask?.name}
        >
          {mobileSheetTask && (() => {
            const task = mobileSheetTask;
            const col = getColumn(task.id);
            const depsReady = task.dependencies.every(d => completedIds.has(d));
            const blocked = col === 'todo' && task.dependencies.length > 0 && !depsReady;
            const depNames = task.dependencies.map(depId => {
              const dep = project.tasks.find(t => t.id === depId);
              return dep ? dep.name : depId;
            });

            return (
              <div>
                {/* Status badge */}
                <div style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: 100, marginBottom: 10,
                  background: col === 'done' ? 'rgba(22,199,154,0.1)' : col === 'inProgress' ? `rgba(15,52,96,0.08)` : 'rgba(26,26,46,0.06)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                  color: statusColor(col),
                }}>
                  {blocked ? 'Blocked' : statusLabel(col)}
                </div>

                {/* Description */}
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#1A1A2E', lineHeight: 1.6, margin: '0 0 12px' }}>
                  {task.description}
                </p>

                {/* AI interactions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280' }}>AI interactions:</span>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: i < task.aiInteractions ? accent : 'rgba(26,26,46,0.08)',
                      }} />
                    ))}
                  </div>
                </div>

                {/* Dependencies */}
                {depNames.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280', display: 'block', marginBottom: 4 }}>Dependencies:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4 }}>
                      {depNames.map((name, i) => {
                        const depId = task.dependencies[i];
                        const done = completedIds.has(depId);
                        return (
                          <span key={depId} style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 500,
                            padding: '2px 8px', borderRadius: 4,
                            background: done ? 'rgba(22,199,154,0.1)' : 'rgba(233,69,96,0.08)',
                            color: done ? '#16C79A' : '#E94560',
                          }}>
                            {done ? '\u2713' : '\u2192'} {name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Simulated chat (in progress or done) */}
                {(col === 'inProgress' || col === 'done') && (
                  <div style={{
                    margin: '12px 0', borderRadius: 10, overflow: 'hidden',
                    border: `1px solid ${accent}20`, background: '#FEFDFB',
                  }}>
                    <div style={{
                      padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(26,26,46,0.06)',
                      fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                      color: accent, letterSpacing: '0.05em',
                    }}>
                      SIMULATED CHAT
                    </div>
                    <div style={{ padding: '0.5rem 0.75rem' }}>
                      {task.simulatedChat.slice(0, (chatStep[task.id] || 0) + 1).map((msg, i) => (
                        <div key={i} style={{ marginBottom: 8, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
                            flexShrink: 0, padding: '1px 4px', borderRadius: 3, marginTop: 2,
                            background: msg.role === 'user' ? 'rgba(15,52,96,0.08)' : 'rgba(22,199,154,0.08)',
                            color: msg.role === 'user' ? accent : '#16C79A',
                          }}>
                            {msg.role === 'user' ? 'YOU' : 'AI'}
                          </span>
                          <p style={{
                            fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#1A1A2E',
                            margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' as const,
                          }}>
                            {msg.text}
                          </p>
                        </div>
                      ))}
                    </div>
                    {col === 'inProgress' && (chatStep[task.id] || 0) < task.simulatedChat.length - 1 && (
                      <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid rgba(26,26,46,0.04)' }}>
                        <button onClick={() => advanceChat(task.id, task.simulatedChat.length)} style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                          padding: '6px 12px', borderRadius: 4, border: 'none',
                          background: accent, color: '#FAF8F5', cursor: 'pointer',
                          minHeight: 36,
                        }}>
                          Next message
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Output (done) */}
                {col === 'done' && (
                  <div style={{
                    marginTop: 8, padding: '0.5rem 0.75rem', borderRadius: 6,
                    background: 'rgba(22,199,154,0.06)', border: '1px solid rgba(22,199,154,0.1)',
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                      color: '#16C79A', marginBottom: 4,
                    }}>OUTPUT</p>
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#1A1A2E',
                      margin: 0, lineHeight: 1.6, opacity: 0.8,
                    }}>
                      {task.output}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  {col === 'todo' && (
                    <button
                      onClick={() => { moveForward(task); if (!blocked && canMoveForward(task)) { /* keep sheet open for in-progress */ } }}
                      disabled={blocked}
                      style={{
                        flex: 1, padding: '0.6rem', borderRadius: 8, border: 'none',
                        fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700,
                        cursor: blocked ? 'not-allowed' : 'pointer',
                        background: blocked ? 'rgba(107,114,128,0.1)' : accent,
                        color: blocked ? '#6B7280' : '#FAF8F5',
                        minHeight: 44,
                      }}
                    >
                      {blocked ? 'Blocked' : 'Start Task'}
                    </button>
                  )}
                  {col === 'inProgress' && (
                    <button
                      onClick={() => { moveForward(task); setMobileSheetTask(null); }}
                      style={{
                        flex: 1, padding: '0.6rem', borderRadius: 8, border: 'none',
                        fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700,
                        cursor: 'pointer', background: '#16C79A', color: '#FAF8F5',
                        minHeight: 44,
                      }}
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </BottomSheet>
      </div>
    );
  }

  /* ─── DESKTOP LAYOUT (unchanged) ─── */
  return (
    <div className="widget-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: `linear-gradient(135deg, ${accent}, #0EA5E9)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
              Project Orchestrator
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
              Break it down. Move tasks through the pipeline. Watch dependencies come alive.
            </p>
          </div>
        </div>
      </div>

      {/* Project selector tabs */}
      <div style={{
        padding: '0.75rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)',
        background: 'rgba(26,26,46,0.015)', display: 'flex', gap: 6,
        overflowX: 'auto' as const, WebkitOverflowScrolling: 'touch' as const,
      }}>
        {(Object.keys(projects) as Array<'game' | 'magazine' | 'app'>).map(key => (
          <button
            key={key}
            onClick={() => handleProjectChange(key)}
            style={{
              padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid',
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
              background: activeProject === key ? accent : 'transparent',
              color: activeProject === key ? '#FAF8F5' : '#6B7280',
              borderColor: activeProject === key ? accent : 'rgba(26,26,46,0.1)',
              whiteSpace: 'nowrap' as const, flexShrink: 0,
              minHeight: 44,
            }}
          >
            {projects[key].label}
          </button>
        ))}
      </div>

      {/* Project description */}
      <div style={{ padding: '0.75rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontStyle: 'italic', color: '#6B7280', margin: 0 }}>
          {project.description}
        </p>
      </div>

      {/* Kanban columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        flex: 1, minHeight: 0,
      }}>
        {/* To Do */}
        <div style={{ borderRight: '1px solid rgba(26,26,46,0.06)', padding: '1rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            color: '#6B7280', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#CBD5E1', display: 'inline-block' }} />
            To Do
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700 }}>{todoTasks.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todoTasks.map(task => {
              const depsReady = task.dependencies.every(d => completedIds.has(d));
              const blocked = task.dependencies.length > 0 && !depsReady;
              return (
                <TaskCardUI
                  key={task.id}
                  task={task}
                  accent={accent}
                  blocked={blocked}
                  completedIds={completedIds}
                  allTasks={project.tasks}
                  onMove={() => moveForward(task)}
                  moveLabel={blocked ? 'Blocked' : 'Start'}
                  isExpanded={false}
                />
              );
            })}
          </div>
        </div>

        {/* In Progress */}
        <div style={{ borderRight: '1px solid rgba(26,26,46,0.06)', padding: '1rem', background: 'rgba(15,52,96,0.02)' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            color: accent, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, display: 'inline-block' }} />
            In Progress
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700 }}>{inProgressTasks.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {inProgressTasks.map(task => (
              <div key={task.id}>
                <TaskCardUI
                  task={task}
                  accent={accent}
                  blocked={false}
                  completedIds={completedIds}
                  allTasks={project.tasks}
                  onMove={() => moveForward(task)}
                  moveLabel="Complete"
                  isExpanded={expandedTask === task.id}
                  onToggleExpand={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                />
                {expandedTask === task.id && (
                  <MiniChat
                    task={task}
                    step={chatStep[task.id] || 0}
                    onAdvance={() => advanceChat(task.id, task.simulatedChat.length)}
                    accent={accent}
                  />
                )}
              </div>
            ))}
            {inProgressTasks.length === 0 && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#6B7280', fontStyle: 'italic', textAlign: 'center' as const, padding: '2rem 0' }}>
                Move a task here to start working on it
              </p>
            )}
          </div>
        </div>

        {/* Done */}
        <div style={{ padding: '1rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            color: '#16C79A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16C79A', display: 'inline-block' }} />
            Done
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700 }}>{doneTasks.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {doneTasks.map(task => (
              <DoneCardUI key={task.id} task={task} accent={accent} />
            ))}
          </div>
        </div>
      </div>

      {/* Insight bar */}
      <div style={{
        padding: '1rem 2rem', borderTop: '1px solid rgba(26,26,46,0.06)',
        background: `linear-gradient(135deg, rgba(15,52,96,0.04), rgba(14,165,233,0.04))`,
      }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontStyle: 'italic', color: '#1A1A2E', margin: 0 }}>
          <span style={{ fontWeight: 600, color: accent, fontStyle: 'normal' }}>Key insight: </span>
          Complex projects are orchestration problems, not prompt problems. Break the work into pieces, manage dependencies, and let each conversation focus on one thing.
        </p>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function TaskCardUI({
  task, accent, blocked, completedIds, allTasks, onMove, moveLabel, isExpanded, onToggleExpand,
}: {
  task: TaskCard; accent: string; blocked: boolean;
  completedIds: Set<string>; allTasks: TaskCard[];
  onMove: () => void; moveLabel: string;
  isExpanded: boolean; onToggleExpand?: () => void;
}) {
  const depNames = task.dependencies.map(depId => {
    const dep = allTasks.find(t => t.id === depId);
    return dep ? dep.name : depId;
  });

  return (
    <div style={{
      background: blocked ? 'rgba(107,114,128,0.04)' : '#FEFDFB',
      border: `1px solid ${blocked ? 'rgba(107,114,128,0.12)' : isExpanded ? accent : 'rgba(26,26,46,0.08)'}`,
      borderRadius: 10, padding: '0.75rem', transition: 'all 0.2s',
      opacity: blocked ? 0.6 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
        <p style={{
          fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 700,
          color: '#1A1A2E', margin: 0, lineHeight: 1.3, cursor: onToggleExpand ? 'pointer' : 'default',
        }} onClick={onToggleExpand}>
          {task.name}
        </p>
        {/* AI interaction dots */}
        <div style={{ display: 'flex', gap: 3, flexShrink: 0, paddingTop: 2 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i < task.aiInteractions ? accent : 'rgba(26,26,46,0.08)',
            }} />
          ))}
        </div>
      </div>

      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#6B7280',
        margin: '0 0 8px', lineHeight: 1.5,
      }}>
        {task.description}
      </p>

      {/* Dependencies */}
      {depNames.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4, marginBottom: 8 }}>
          {depNames.map((name, i) => {
            const depId = task.dependencies[i];
            const done = completedIds.has(depId);
            return (
              <span key={depId} style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 500,
                padding: '2px 6px', borderRadius: 4,
                background: done ? 'rgba(22,199,154,0.1)' : 'rgba(233,69,96,0.08)',
                color: done ? '#16C79A' : '#E94560',
              }}>
                {done ? '\u2713' : '\u2192'} {name}
              </span>
            );
          })}
        </div>
      )}

      <button
        onClick={onMove}
        disabled={blocked}
        style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
          padding: '6px 12px', borderRadius: 6, cursor: blocked ? 'not-allowed' : 'pointer',
          border: 'none', transition: 'all 0.2s',
          background: blocked ? 'rgba(107,114,128,0.1)' : accent,
          color: blocked ? '#6B7280' : '#FAF8F5',
          minHeight: 44, minWidth: 44,
        }}
      >
        {moveLabel}
      </button>
    </div>
  );
}

function DoneCardUI({ task, accent }: { task: TaskCard; accent: string }) {
  const [showOutput, setShowOutput] = useState(false);
  return (
    <div style={{
      background: 'rgba(22,199,154,0.04)', border: '1px solid rgba(22,199,154,0.15)',
      borderRadius: 10, padding: '0.75rem', transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <p style={{
          fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 700,
          color: '#16C79A', margin: 0, lineHeight: 1.3,
        }}>
          {'\u2713'} {task.name}
        </p>
      </div>
      <button
        onClick={() => setShowOutput(!showOutput)}
        style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 500,
          padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(22,199,154,0.2)',
          background: 'transparent', color: '#16C79A', cursor: 'pointer', marginTop: 6,
          minHeight: 44, minWidth: 44,
        }}
      >
        {showOutput ? 'Hide output' : 'View output'}
      </button>
      {showOutput && (
        <div style={{
          marginTop: 8, padding: '0.5rem 0.75rem', borderRadius: 6,
          background: 'rgba(22,199,154,0.06)', border: '1px solid rgba(22,199,154,0.1)',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#1A1A2E',
            margin: 0, lineHeight: 1.6, opacity: 0.8,
          }}>
            {task.output}
          </p>
        </div>
      )}
    </div>
  );
}

function MiniChat({
  task, step, onAdvance, accent,
}: {
  task: TaskCard; step: number; onAdvance: () => void; accent: string;
}) {
  const isMobile = useIsMobile();
  const visibleMessages = task.simulatedChat.slice(0, step + 1);
  const hasMore = step < task.simulatedChat.length - 1;

  return (
    <div style={{
      margin: '6px 0 0', borderRadius: 10, overflow: 'hidden',
      border: `1px solid ${accent}20`, background: '#FEFDFB',
    }}>
      <div style={{
        padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(26,26,46,0.06)',
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
        color: accent, letterSpacing: '0.05em',
      }}>
        SIMULATED CHAT
      </div>
      <div style={{ padding: '0.5rem 0.75rem', maxHeight: isMobile ? '25dvh' : '30dvh', overflowY: 'auto' as const }}>
        {visibleMessages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: 8, display: 'flex', gap: 6, alignItems: 'flex-start',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
              flexShrink: 0, padding: '1px 4px', borderRadius: 3, marginTop: 2,
              background: msg.role === 'user' ? 'rgba(15,52,96,0.08)' : 'rgba(22,199,154,0.08)',
              color: msg.role === 'user' ? accent : '#16C79A',
            }}>
              {msg.role === 'user' ? 'YOU' : 'AI'}
            </span>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#1A1A2E',
              margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' as const,
            }}>
              {msg.text}
            </p>
          </div>
        ))}
      </div>
      {hasMore && (
        <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid rgba(26,26,46,0.04)' }}>
          <button onClick={onAdvance} style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
            padding: '6px 12px', borderRadius: 4, border: 'none',
            background: accent, color: '#FAF8F5', cursor: 'pointer',
            minHeight: 44, minWidth: 44,
          }}>
            Next message
          </button>
        </div>
      )}
    </div>
  );
}
