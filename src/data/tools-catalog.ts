export interface Tool {
  name: string;
  category: ToolCategory;
  categories?: ToolCategory[];
  desc: string;
  pricing: 'free' | 'freemium' | 'paid';
  detail?: string;
  studentDeal?: string;
  zeroBudget?: boolean;
}

export type ToolCategory =
  | 'image-gen'
  | 'image-edit'
  | 'video'
  | 'music'
  | 'audio'
  | 'research'
  | 'browser'
  | 'coding'
  | 'aggregator'
  | 'other';

export const categoryLabels: Record<ToolCategory, string> = {
  'image-gen': 'Image Gen',
  'image-edit': 'Image Edit',
  'video': 'Video',
  'music': 'Music',
  'audio': 'Voice & Audio',
  'research': 'Research',
  'browser': 'Browsers & Agents',
  'coding': 'Coding',
  'aggregator': 'Aggregators',
  'other': 'Other',
};

export const categoryColors: Record<ToolCategory, string> = {
  'image-gen': '#E94560',
  'image-edit': '#F5A623',
  'video': '#7B61FF',
  'music': '#16C79A',
  'audio': '#0F3460',
  'research': '#0EA5E9',
  'browser': '#6B7280',
  'coding': '#E94560',
  'aggregator': '#F5A623',
  'other': '#7B61FF',
};

export const toolsCatalog: Tool[] = [
  // ═══ IMAGE GENERATION ═══
  {
    name: 'Midjourney v8',
    category: 'image-gen',
    desc: 'The gold standard for artistic, cinematic image quality',
    pricing: 'paid',
    detail: 'Unmatched aesthetic coherence. 5x faster than v7, native 2K, dramatically better text rendering. The personalization system (style references, moodboards) is unrivaled for developing a consistent visual identity. $10/mo Basic, $30/mo Standard.',
  },
  {
    name: 'Nano Banana 2',
    category: 'image-gen',
    categories: ['image-gen', 'image-edit'],
    desc: 'Google\'s powerhouse — fastest gen, best text, seamless editing',
    pricing: 'freemium',
    detail: 'The only image generator that pulls from live web knowledge, renders accurate multi-language text, and handles generation + editing in a single conversational flow. Highlight an area, type what you want changed, and it preserves the rest. Free tier in the Gemini app. Full access on Google AI Pro ($20/mo).',
    studentDeal: 'Included in Google Workspace for Education and Google One Student plans.',
    zeroBudget: true,
  },

  // ═══ IMAGE EDITING ═══
  {
    name: 'Photoroom',
    category: 'image-edit',
    desc: 'Instant studio-quality product photography from phone photos',
    pricing: 'freemium',
    detail: 'Purpose-built for e-commerce. Background removal, product staging, virtual models, batch editing. 100M+ product images processed monthly. Free plan (250 exports/mo with watermark). Pro from $7.50/mo.',
    studentDeal: '50% off via GitHub Student Developer Pack.',
  },

  // ═══ VIDEO ═══
  {
    name: 'Seedance 2.0',
    category: 'video',
    desc: 'Best motion consistency and cinematic storytelling',
    pricing: 'freemium',
    detail: 'Leads both text-to-video and image-to-video benchmarks. Multi-modal: feed in images, video, and audio as references. Native audio generation in one pass. Director-level camera and lighting control. Free credits available via Dreamina.',
  },
  {
    name: 'Luma Ray3',
    category: 'video',
    desc: 'Most cinematic — first HDR video gen, start/end frame control',
    pricing: 'freemium',
    detail: 'World\'s first reasoning video model — plans scenes, evaluates its own output, iterates. Native HDR (16-bit EXR). Draft Mode for 20x faster iteration at 1/5 cost, then master to 4K. Free tier via Dream Machine.',
    zeroBudget: true,
  },
  {
    name: 'Hailuo / MiniMax',
    category: 'video',
    desc: 'Best human motion and facial expressions, most affordable',
    pricing: 'freemium',
    detail: 'Industry-leading realistic human movement and emotional micro-expressions. The fastest and most cost-effective option for volume creators. "Fast" variant optimized for batch production. Free tier available.',
  },

  {
    name: 'Kling 2.6',
    category: 'video',
    desc: 'Longest AI videos (2 min), generous free tier, very affordable',
    pricing: 'freemium',
    detail: 'By Kuaishou. The only generator that does up to 2-minute videos with consistent quality. Strong human motion and lip-sync. 66 free credits/day (1-2 short videos). Standard just $6.99/mo — the best value in video gen.',
    zeroBudget: true,
  },

  // ═══ MUSIC ═══
  {
    name: 'Suno',
    category: 'music',
    desc: 'Full songs with vocals, instruments, and structure from a prompt',
    pricing: 'freemium',
    detail: 'Nothing else produces complete, listenable songs from text. Studio workspace with timeline editing, stem separation, MIDI export. 2M+ paid subscribers. Free: 50 credits/day (10 songs, non-commercial). Pro: $10/mo.',
    zeroBudget: true,
  },

  // ═══ VOICE & AUDIO ═══
  {
    name: 'ElevenLabs',
    category: 'audio',
    desc: 'Most realistic voice cloning and text-to-speech, period',
    pricing: 'freemium',
    detail: 'Nobody is close on voice quality. v3 produces speech with genuine emotional weight — sarcasm, whispering, laughter. 10,000+ voice library, 70+ languages, clone from a short sample. Free: 10,000 chars/mo. Starter: $5/mo.',
    studentDeal: 'Free access via ElevenLabs for Students + $1,500 in credits via AI Student Pack.',
    zeroBudget: true,
  },

  // ═══ RESEARCH ═══
  {
    name: 'Perplexity',
    category: 'research',
    desc: 'AI search engine — answers with cited sources in real time',
    pricing: 'freemium',
    detail: 'The fastest path from question to verified answer. Searches the live web, reads results, writes a summary with footnotes. Academic mode for peer-reviewed sources. Free tier (limited). Pro: $20/mo.',
    studentDeal: 'Education Pro: $5-10/mo (50-75% off). Free Pro via AI Student Pack.',
    zeroBudget: true,
  },
  {
    name: 'NotebookLM',
    category: 'research',
    desc: 'Upload your docs, get AI grounded only in your sources',
    pricing: 'free',
    detail: 'By Google. Upload documents, get AI that only answers from YOUR sources — zero hallucination risk. Audio Overview generates podcast-style summaries from your materials. Completely free.',
    zeroBudget: true,
  },

  // ═══ BROWSERS & AGENTS ═══
  {
    name: 'Dia',
    category: 'browser',
    desc: 'AI-first browser — your URL bar is now an assistant',
    pricing: 'free',
    detail: 'Successor to Arc. AI sees your open tabs, synthesizes across sources, saves reusable "Skills." The browser IS the AI interface. Integrates with Slack, Notion, Gmail, Calendar. Free.',
    zeroBudget: true,
  },
  {
    name: 'Claude Computer Use',
    category: 'browser',
    desc: 'Claude controls your desktop — opens apps, navigates, types',
    pricing: 'paid',
    detail: 'Launched March 2026. Claude can open applications, navigate browsers, fill spreadsheets directly on your Mac. The most transparent and safety-conscious computer agent. Part of Claude Pro ($20/mo).',
  },

  // ═══ CODING ═══
  {
    name: 'Cursor',
    category: 'coding',
    desc: 'Best AI code editor — codebase-wide reasoning in a visual IDE',
    pricing: 'freemium',
    detail: 'VS Code fork with multi-file Composer mode, fastest autocomplete in the industry, full project indexing. 1M+ users. The best daily driver for developers. Free tier (limited). Pro: $20/mo.',
    studentDeal: 'Free Pro for 6-12 months for verified students.',
    zeroBudget: true,
  },
  {
    name: 'Claude Code',
    category: 'coding',
    desc: 'Terminal AI agent — reads, writes, runs, and debugs your code',
    pricing: 'paid',
    detail: 'The only coding tool that operates as a true shell agent — runs tests, reads error logs, searches docs, creates PRs, iterates until things work. #1 most used and most loved coding tool (46% developer preference). Requires Claude Pro ($20/mo).',
  },

  // ═══ AGGREGATORS ═══
  {
    name: 'Krea AI',
    category: 'aggregator',
    desc: 'Creative cockpit — image, video, 3D, upscaling from top models',
    pricing: 'freemium',
    detail: 'Bundles Flux, Veo, Kling, Hailuo, Runway, Seedance, and its own models. Real-time generation (sub-200ms). LoRA fine-tuning. 30M+ users. Used by Nike, Samsung, Lego. Free: 100 compute units/day. Pro: $35/mo.',
  },
  {
    name: 'Poe',
    category: 'aggregator',
    desc: 'Easiest way to test every major LLM in one interface',
    pricing: 'freemium',
    detail: 'By Quora. Switch between Claude, GPT, Gemini, Llama, and dozens more. Create and share custom bots. The best way for beginners to compare models without API keys. Free tier + $19.99/mo.',
    zeroBudget: true,
  },
  {
    name: 'OpenRouter',
    category: 'aggregator',
    desc: 'One API key for 100+ models from every provider',
    pricing: 'freemium',
    detail: 'Unified API that routes to OpenAI, Anthropic, Google, Meta, Mistral, and open-source models. Pass-through pricing (often cheaper than direct). Automatic fallback routing. Best for developers who want flexibility.',
  },

  // ═══ OTHER ═══
  {
    name: 'Google Stitch',
    category: 'other',
    desc: 'Prompt-to-prototype — generates real UI from text or sketches',
    pricing: 'free',
    detail: 'AI UI design tool from Google Labs. Text, sketches, or voice → high-fidelity interactive prototypes → exported HTML/CSS. Integrates with Claude Code and Cursor via MCP. 350 free generations/month.',
    zeroBudget: true,
  },
  {
    name: 'Google Pomelli',
    category: 'other',
    desc: 'AI marketing agency in a box — campaigns from your website URL',
    pricing: 'free',
    detail: 'Scans your website, builds a brand profile, generates complete marketing campaigns for Instagram, Facebook, LinkedIn, Google Ads, email. Photoshoot feature turns phone photos into studio product shots. Free during beta.',
    zeroBudget: true,
  },
  {
    name: 'Descript',
    category: 'other',
    desc: 'Edit audio and video by editing text — like a doc, not a timeline',
    pricing: 'freemium',
    detail: 'Transcribes your media, then lets you edit by editing the transcript. Delete a sentence of text, the audio/video cut happens automatically. AI voice cloning for fixing flubs. The bridge between writing and production.',
  },
];
