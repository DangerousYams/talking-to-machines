/* ── Shared option data for the Cultivated AI hello survey ──
   HelloSurvey renders these as choices. CultivatedDashboard reads the same
   lists so stored ids always render as the label the person actually saw. */

export interface SurveyOption {
  id: string;
  label: string;
}

export interface WorldOption extends SurveyOption {
  icon: string;
}

export interface ColoredOption extends SurveyOption {
  color: string;
}

/** A chore is tagged with the worlds it belongs to, so step 5 can lead with
    the ones the person actually does. */
export interface ChoreOption extends ColoredOption {
  worlds: string[];
}

export const WORLDS: readonly WorldOption[] = [
  { id: 'kitchen', label: 'Kitchen & production', icon: '🥐' },
  { id: 'ops', label: 'Operations & supply', icon: '📦' },
  { id: 'quickcom', label: 'Marketplace', icon: '🛵' },
  { id: 'marketing', label: 'Marketing & content', icon: '📣' },
  { id: 'sales', label: 'Trade', icon: '📈' },
  { id: 'finance', label: 'Finance & accounts', icon: '🧾' },
  { id: 'people', label: 'People & admin', icon: '🤝' },
  { id: 'design', label: 'Design & creative', icon: '🎨' },
  { id: 'tech', label: 'MIS', icon: '💻' },
  { id: 'legal', label: 'Legal', icon: '⚖️' },
  { id: 'leadership', label: 'Founding & leadership', icon: '🧭' },
];

export const FREQUENCIES: readonly SurveyOption[] = [
  { id: 'daily', label: 'Pretty much every day' },
  { id: 'weekly', label: 'A few times a week' },
  { id: 'sometimes', label: 'Once in a while' },
  { id: 'tried', label: 'Tried it once or twice' },
  { id: 'never', label: "Never, and that's fine" },
];

export const AI_TOOLS: readonly SurveyOption[] = [
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'claude', label: 'Claude' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'perplexity', label: 'Perplexity' },
  { id: 'copilot', label: 'Copilot / Cursor' },
  { id: 'midjourney', label: 'Midjourney / DALL-E' },
  { id: 'canva', label: 'Canva AI' },
  { id: 'notebooklm', label: 'NotebookLM' },
  { id: 'none', label: 'None yet' },
];

/** Order matters: the dashboard laptop table renders these top to bottom. */
export const LAPTOP_CHECKS: readonly ColoredOption[] = [
  { id: 'google', label: 'A Google account I can sign in with', color: '#16C79A' },
  { id: 'chrome', label: 'Chrome installed', color: '#0EA5E9' },
  { id: 'claude-login', label: 'A Claude login', color: '#7B61FF' },
  { id: 'chatgpt-login', label: 'A ChatGPT login', color: '#7B61FF' },
  { id: 'unsure', label: "Not sure, I'll check", color: '#F5A623' },
  { id: 'none', label: 'None of these yet', color: '#E94560' },
];

/** Accent colors cycle by canonical index, so a chore keeps the same color
    whether it lands in the matched group or the rest. */
const CHORE_COLORS = ['#16C79A', '#0EA5E9', '#7B61FF', '#E94560', '#F5A623'];

const CHORES: { id: string; label: string; worlds: string[] }[] = [
  { id: 'reports', label: 'The weekly sales report', worlds: ['sales', 'finance', 'leadership', 'ops', 'tech'] },
  { id: 'customer', label: 'Answering the same customer questions', worlds: ['quickcom', 'marketing', 'sales'] },
  { id: 'listings', label: 'Updating product listings', worlds: ['quickcom', 'marketing', 'ops'] },
  { id: 'captions', label: 'Writing captions & posts', worlds: ['marketing', 'design'] },
  { id: 'sheets', label: 'Keeping spreadsheets updated', worlds: ['ops', 'finance', 'sales', 'quickcom', 'tech', 'people'] },
  { id: 'invoices', label: 'Invoices & paperwork', worlds: ['finance', 'ops', 'people', 'legal'] },
  { id: 'rosters', label: 'Rosters & reminders', worlds: ['people', 'kitchen', 'ops'] },
  { id: 'competitors', label: 'Checking competitor prices', worlds: ['sales', 'marketing', 'quickcom', 'leadership'] },
  { id: 'minutes', label: 'Meeting notes & follow-ups', worlds: ['leadership', 'people', 'sales', 'marketing', 'ops', 'tech', 'legal'] },
  { id: 'vendors', label: 'Chasing vendors & orders', worlds: ['ops', 'kitchen', 'finance'] },
  { id: 'recipes', label: 'Writing down recipes & SOPs', worlds: ['kitchen', 'ops'] },
  { id: 'creatives', label: 'Resizing creatives for every platform', worlds: ['design', 'marketing'] },
];

export const HANDOVER_CHORES: readonly ChoreOption[] = CHORES.map((chore, i) => ({
  ...chore,
  color: CHORE_COLORS[i % CHORE_COLORS.length],
}));

export const WORRIES: readonly ColoredOption[] = [
  { id: 'madeup', label: 'It makes things up', color: '#E94560' },
  { id: 'job', label: 'What it means for my job', color: '#E94560' },
  { id: 'privacy', label: 'Where our data goes', color: '#E94560' },
  { id: 'voice', label: 'Everything it writes sounds the same', color: '#E94560' },
  { id: 'fast', label: 'It moves too fast to keep up', color: '#E94560' },
  { id: 'cheating', label: 'Using it feels like cheating', color: '#E94560' },
  { id: 'notclick', label: "I tried it and it didn't click", color: '#E94560' },
  { id: 'excited', label: 'Nothing much. Honestly, excited', color: '#E94560' },
];

/** Human label for a stored id. Unknown ids fall back to the id itself so an
    old or hand-edited row never blanks out or throws. */
export function labelFor(options: readonly SurveyOption[], id: string): string {
  const match = options.find(o => o.id === id);
  return match ? match.label : id;
}

/** Accent color for a stored id, with a caller-supplied fallback. */
export function colorFor(options: readonly ColoredOption[], id: string, fallback = '#6B7280'): string {
  const match = options.find(o => o.id === id);
  return match ? match.color : fallback;
}

/** Splits the chores into the ones this person's worlds touch and the rest,
    both in canonical order. */
export function splitChoresByWorlds(selectedWorlds: string[]) {
  const matched = HANDOVER_CHORES.filter(c => c.worlds.some(w => selectedWorlds.includes(w)));
  const rest = HANDOVER_CHORES.filter(c => !c.worlds.some(w => selectedWorlds.includes(w)));
  return { matched, rest };
}
