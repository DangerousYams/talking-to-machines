const STORAGE_KEY = 'ttm_persona';
const CHANGE_EVENT = 'ttm-persona-change';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PersonaSelections {
  profession: string;
  professionDetail?: string;
  aiExperience: 'beginner' | 'intermediate' | 'regular';
  goals: string[];
  challenge?: string;
}

export interface Persona {
  version: 1;
  selections: PersonaSelections;
  context: string;
  keywords: string[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export function getPersona(): Persona | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Persona;
  } catch {
    return null;
  }
}

export function savePersona(persona: Persona): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persona));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // localStorage full or unavailable
  }
}

export function clearPersona(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // noop
  }
}

export function hasPersona(): boolean {
  return getPersona() !== null;
}

// ---------------------------------------------------------------------------
// Context injection string (consumed by streamChat)
// ---------------------------------------------------------------------------

export function getPersonaContext(): string | null {
  const persona = getPersona();
  if (!persona?.context) return null;
  return `\n\n[USER CONTEXT] The student using this tool is: ${persona.context}\nTailor examples, scenarios, and language to their background.\nDon't mention this context explicitly unless asked.`;
}
