const STORAGE_KEY = 'ttm_unlocked_tools';
const EVENT_NAME = 'ttm-tools-change';

export function getUnlockedTools(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isToolUnlocked(toolId: string): boolean {
  return getUnlockedTools().includes(toolId);
}

export function unlockTool(toolId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const tools = getUnlockedTools();
    if (!tools.includes(toolId)) {
      tools.push(toolId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
    }
  } catch {
    // localStorage unavailable
  }
}

export { EVENT_NAME as TOOLS_CHANGE_EVENT };
