// ─── Challenge Types ───

export type ChallengeType =
  | 'prompt-forge'
  | 'reverse-engineer'
  | 'taste-curator'
  | 'trust-call'
  | 'first-principles'
  | 'context-surgeon'
  | 'debug-detective'
  | 'tool-chain'
  | 'agent-architect';

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
  'prompt-forge': { label: 'Prompt Forge', color: '#E94560', usesAI: true, icon: '🔨' },
  'reverse-engineer': { label: 'Reverse Engineer', color: '#7B61FF', usesAI: false, icon: '🔍' },
  'taste-curator': { label: 'Taste Curator', color: '#F5A623', usesAI: false, icon: '🎨' },
  'trust-call': { label: 'Trust Call', color: '#0EA5E9', usesAI: false, icon: '⚖️' },
  'first-principles': { label: 'First Principles', color: '#16C79A', usesAI: false, icon: '🧠' },
  'context-surgeon': { label: 'Context Surgeon', color: '#7B61FF', usesAI: true, icon: '✂️' },
  'debug-detective': { label: 'Debug Detective', color: '#E94560', usesAI: false, icon: '🐛' },
  'tool-chain': { label: 'Tool Chain', color: '#0EA5E9', usesAI: false, icon: '🔗' },
  'agent-architect': { label: 'Agent Architect', color: '#F5A623', usesAI: false, icon: '🏗️' },
};

// ─── Per-type payloads ───

export interface PromptForgePayload {
  task: string;
  hint?: string;
  exampleGood?: string;
  systemPrompt: string;
  evaluationCriteria: string[];
}

export interface ReverseEngineerPayload {
  output: string;
  outputType: 'text' | 'code' | 'email' | 'poem' | 'analysis';
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TasteCuratorPayload {
  domain: string;
  brief: string;
  variants: { id: string; label: string; content: string }[];
  expertTopPick: string;
  expertReasoning: string;
}

export interface TrustCallPayload {
  scenario: string;
  context: string;
  options: { id: string; label: string; risk: 'low' | 'medium' | 'high' }[];
  bestChoice: string;
  explanation: string;
}

export interface FirstPrinciplesPayload {
  question: string;
  domain: string;
  aiAnswer: string;
  aiIsCorrect: boolean;
  correctAnswer: string;
  reasoning: string;
}

export interface ContextSurgeonPayload {
  task: string;
  documents: { id: string; label: string; tokens: number; content: string; relevance: 'high' | 'medium' | 'low' }[];
  budgetTokens: number;
  optimalIds: string[];
  systemPrompt: string;
}

export interface DebugDetectivePayload {
  prompt: string;
  badOutput: string;
  bugs: { region: string; bugType: 'ambiguous' | 'contradictory' | 'missing-context' | 'too-many-tasks' | 'leading' }[];
  fixedPrompt: string;
  explanation: string;
}

export interface ToolChainPayload {
  goal: string;
  availableTools: { id: string; name: string; category: string; description: string }[];
  optimalChain: string[];
  explanation: string;
}

export interface AgentArchitectPayload {
  goal: string;
  constraints: string[];
  steps: { id: string; label: string; tool: string; instruction: string }[];
  failureMode?: string;
  guardRail?: string;
}

export type ChallengePayload =
  | PromptForgePayload
  | ReverseEngineerPayload
  | TasteCuratorPayload
  | TrustCallPayload
  | FirstPrinciplesPayload
  | ContextSurgeonPayload
  | DebugDetectivePayload
  | ToolChainPayload
  | AgentArchitectPayload;

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
