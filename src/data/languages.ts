export interface Language {
  code: string;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  tier: 1 | 2 | 3;
}

export const languages: Language[] = [
  // Tier 1 — Global high-impact
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', tier: 1 },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', tier: 1 },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr', tier: 1 },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr', tier: 1 },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', tier: 1 },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', tier: 1 },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr', tier: 1 },

  // Tier 2 — Indian regional
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr', tier: 2 },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr', tier: 2 },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr', tier: 2 },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr', tier: 2 },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr', tier: 2 },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr', tier: 2 },

  // Tier 3 — Global tech hubs
  { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr', tier: 3 },
  { code: 'ko', name: 'Korean', nativeName: '한국어', dir: 'ltr', tier: 3 },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr', tier: 3 },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', dir: 'ltr', tier: 3 },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr', tier: 3 },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', dir: 'ltr', tier: 3 },
];

export const defaultLocale = 'en';

export function getLanguage(code: string): Language | undefined {
  return languages.find(l => l.code === code);
}

export function getDir(code: string): 'ltr' | 'rtl' {
  return languages.find(l => l.code === code)?.dir ?? 'ltr';
}
