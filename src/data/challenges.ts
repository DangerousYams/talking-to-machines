// ─── Challenge Types ───

export type ChallengeType =
  | 'snap-judgment'
  | 'taste-off'
  | 'speed-prompt'
  | 'odd-one-out'
  | 'detective';

export type ConceptArea =
  | 'prompt-craft'
  | 'context-engineering'
  | 'tool-landscape'
  | 'tool-use'
  | 'agent-design'
  | 'coding-with-ai'
  | 'critical-thinking'
  | 'human-judgment';

export const CONCEPT_AREA_LABELS: Record<ConceptArea, string> = {
  'prompt-craft': 'Prompt Craft',
  'context-engineering': 'Context Engineering',
  'tool-landscape': 'Tool Landscape',
  'tool-use': 'Tool Use',
  'agent-design': 'Agent Design',
  'coding-with-ai': 'Coding with AI',
  'critical-thinking': 'Critical Thinking',
  'human-judgment': 'Human Judgment',
};

export const CHALLENGE_TYPE_META: Record<ChallengeType, {
  label: string;
  color: string;
  usesAI: boolean;
  icon: string;
}> = {
  'snap-judgment': { label: 'Real or Fake?', color: '#E94560', usesAI: false, icon: '⚡' },
  'taste-off': { label: 'Taste Off', color: '#F5A623', usesAI: false, icon: '🎯' },
  'speed-prompt': { label: 'Speed Prompt', color: '#7B61FF', usesAI: true, icon: '⏱️' },
  'odd-one-out': { label: 'Odd One Out', color: '#0EA5E9', usesAI: false, icon: '🔍' },
  'detective': { label: 'Detective', color: '#16C79A', usesAI: false, icon: '🐛' },
};

// ─── Per-type payloads ───

export interface SnapJudgmentPayload {
  statement: string;
  isReal: boolean;
  source?: string;
  correction?: string;
  explanation: string;
}

export interface TasteOffPayload {
  domain: string;
  optionA: { label: string; content: string };
  optionB: { label: string; content: string };
  expertPick: 'A' | 'B';
  expertReasoning: string;
}

export interface SpeedPromptPayload {
  task: string;
  timeLimitSeconds: number;
  systemPrompt: string;
}

export interface OddOneOutPayload {
  items: [string, string, string, string];
  oddIndex: number;
  pattern: string;
  explanation: string;
}

export interface DetectivePayload {
  prompt: string;
  badOutput: string;
  options: { id: string; label: string }[];
  correctId: string;
  fixedPrompt: string;
  explanation: string;
}

export type ChallengePayload =
  | SnapJudgmentPayload
  | TasteOffPayload
  | SpeedPromptPayload
  | OddOneOutPayload
  | DetectivePayload;

// ─── Challenge definition ───

export interface Challenge {
  id: string;
  type: ChallengeType;
  conceptArea: ConceptArea;
  title: string;
  brief: string;
  difficulty: 1 | 2 | 3;
  chapterLink?: number;
  payload: ChallengePayload;
}

// ─── Standard challenge component props ───

export interface ChallengeComponentProps {
  challenge: Challenge;
  onSubmit: (submission: Record<string, unknown>) => void;
  isMobile: boolean;
  isActive: boolean;
}

// ─── Submission types ───

export interface ChallengeSubmission {
  challengeId: string;
  challengeType: ChallengeType;
  conceptArea: ConceptArea;
  submission: Record<string, unknown>;
  timeMs: number;
  usedAi: boolean;
}

export interface ComparisonData {
  percentile: number;
  totalSubmissions: number;
  distribution: Record<string, number>;
  insight: string;
}
