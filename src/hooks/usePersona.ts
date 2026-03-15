import { useState, useEffect, useCallback } from 'react';
import { getPersona, savePersona, clearPersona, type Persona } from '../lib/persona';

interface UsePersonaReturn {
  persona: Persona | null;
  hasPersona: boolean;
  save: (persona: Persona) => void;
  clear: () => void;
}

export function usePersona(): UsePersonaReturn {
  const [persona, setPersona] = useState<Persona | null>(() => getPersona());

  const refresh = useCallback(() => {
    setPersona(getPersona());
  }, []);

  useEffect(() => {
    const onPersonaChange = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'ttm_persona') refresh();
    };

    window.addEventListener('ttm-persona-change', onPersonaChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('ttm-persona-change', onPersonaChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  const save = useCallback((p: Persona) => {
    savePersona(p);
    setPersona(p);
  }, []);

  const clear = useCallback(() => {
    clearPersona();
    setPersona(null);
  }, []);

  return { persona, hasPersona: persona !== null, save, clear };
}
