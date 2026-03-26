export interface Tool {
  name: string;
  category: ToolCategory;
  desc: string;
  pricing: 'free' | 'freemium' | 'paid';
  detail?: string;
  studentDeal?: string;
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
  'audio': 'Audio',
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
    name: 'Midjourney v7',
    category: 'image-gen',
    desc: 'Highest artistic quality of any image generator',
    pricing: 'paid',
    detail: 'Market leader for artistic image generation. Distinctive aesthetic with rich depth and coherence. Web + Discord. $10/mo Basic, $30/mo Standard (unlimited Relax mode).',
  },
  {
    name: 'GPT Image (ChatGPT)',
    category: 'image-gen',
    desc: 'OpenAI\'s native image gen, replacing DALL-E 3',
    pricing: 'freemium',
    detail: 'Built into ChatGPT — best prompt comprehension of any generator. Iterate on images conversationally. Free tier via ChatGPT, more with Plus ($20/mo).',
  },
  {
    name: 'Stable Diffusion 3.5',
    category: 'image-gen',
    desc: 'Open-source, runs locally for free',
    pricing: 'free',
    detail: 'The only fully open-source image generator. Run it on your own hardware, fine-tune on custom data, customize everything. Massive community of models and extensions.',
  },
  {
    name: 'Flux 2',
    category: 'image-gen',
    desc: 'Fast photorealism by Black Forest Labs',
    pricing: 'freemium',
    detail: 'By ex-Stability AI researchers. Leads in photorealism and speed (4.5s per image). Flux.1 Schnell is open-source and free. Pro models ~$0.01-0.03/image via API.',
  },
  {
    name: 'Ideogram v3',
    category: 'image-gen',
    desc: 'Best-in-class text rendering in images',
    pricing: 'freemium',
    detail: 'The go-to when you need legible text in generated images — logos, posters, signs. 90-95% text accuracy. Free: 10 slow credits/day. Plus: $15/mo.',
  },
  {
    name: 'Adobe Firefly 3',
    category: 'image-gen',
    desc: 'Commercially safe, trained on licensed content',
    pricing: 'freemium',
    detail: 'Integrated into the Adobe ecosystem. Legally safe for commercial use. Free: 25 credits/mo (watermarked). Standard: $9.99/mo.',
    studentDeal: 'Student/Teacher CC plans include unlimited standard gen features at discounted rate.',
  },
  {
    name: 'Photoroom',
    category: 'image-gen',
    desc: 'AI product photography and background removal',
    pricing: 'freemium',
    detail: '300M+ users. Instant background removal, virtual models, batch editing. Great for e-commerce and social media content. Free basic tier; paid for higher resolution.',
  },
  {
    name: 'Google Pomelli',
    category: 'image-gen',
    desc: 'Free AI marketing asset generator from Google Labs',
    pricing: 'free',
    detail: 'Creates on-brand marketing assets from your website. "Photoshoot" feature turns phone photos into studio-quality product shots. Completely free, no limits, 170+ countries.',
  },

  // ═══ IMAGE EDITING ═══
  {
    name: 'Photoshop AI',
    category: 'image-edit',
    desc: 'Generative Fill, Expand, Remove inside Photoshop',
    pricing: 'paid',
    detail: 'Industry standard. Select a region, describe what you want, and it fills seamlessly. Part of Creative Cloud ($22.99/mo).',
    studentDeal: 'Student/Teacher CC plans at significant discount with unlimited standard AI features.',
  },
  {
    name: 'Runway Inpainting',
    category: 'image-edit',
    desc: 'Mask and replace regions of any image',
    pricing: 'freemium',
    detail: 'Brush over any part of an image and describe what should replace it. Web-based, no install needed. Free tier available; Standard $12/mo.',
  },
  {
    name: 'Magnific',
    category: 'image-edit',
    desc: 'AI upscaling that adds real detail, up to 10K',
    pricing: 'paid',
    detail: 'Goes beyond simple upscaling — hallucinates plausible new detail into low-res images. New Precision V2 mode for zero-hallucination faithful upscaling.',
  },
  {
    name: 'Clipdrop',
    category: 'image-edit',
    desc: 'Background removal, relighting, cleanup',
    pricing: 'freemium',
    detail: 'Swiss army knife for quick image edits. Now owned by Jasper.ai. Free basic features; Pro ~$8-9/mo.',
  },

  // ═══ VIDEO ═══
  {
    name: 'Runway Gen-4.5',
    category: 'video',
    desc: '#1 video benchmark, professional filmmaking tools',
    pricing: 'paid',
    detail: 'Top-rated video model (1,247 Elo). Motion brushes, scene consistency, cinematic quality. Standard $12/mo (625 credits), Pro $28/mo, Unlimited $76/mo.',
  },
  {
    name: 'Kling 2.6',
    category: 'video',
    desc: 'Strong human motion, up to 2-minute videos',
    pricing: 'freemium',
    detail: 'By Kuaishou. Simultaneous audio-visual generation. Impressive realism for human subjects. 66 free credits/day (1-2 short videos). Standard $6.99/mo.',
  },
  {
    name: 'Google Veo 3.1',
    category: 'video',
    desc: 'Native 4K with character consistency',
    pricing: 'paid',
    detail: 'Vertical video, character consistency across shots. Integrated into Google ecosystem. AI Pro $19.99/mo (~90 videos), Ultra $249.99/mo.',
    studentDeal: 'Students with .edu email get 12 months of Google AI Pro free.',
  },
  {
    name: 'Pika 2.5',
    category: 'video',
    desc: 'Quick creative clips with fun effects',
    pricing: 'freemium',
    detail: 'Fast 42s renders. Creative effects like Pikaswaps (face/object swaps) and Pikaffects. Great for social media. Free: 80 credits (watermarked, 480p). From ~$8/mo.',
  },
  {
    name: 'Luma Ray3',
    category: 'video',
    desc: 'First HDR video generation, start/end frame control',
    pricing: 'freemium',
    detail: 'Professional quality with HDR support (industry first). Character consistency and precise start/end frame control. From $7.99/mo. Free tier via Dream Machine.',
  },
  {
    name: 'Seedance 2.0',
    category: 'video',
    desc: 'Multi-modal: generates video WITH synchronized audio',
    pricing: 'freemium',
    detail: 'Accepts images, videos, audio, and text as inputs. Generates video with matched audio — a leap beyond video-only tools. 41.4s for 5-sec 1080p. Free tier available.',
  },
  {
    name: 'Hailuo 2.3',
    category: 'video',
    desc: 'Industry-leading human motion and cinematic VFX',
    pricing: 'freemium',
    detail: 'By MiniMax. Expressive characters, cinematic VFX, strong anime/illustration support. Free tier available.',
  },

  // ═══ MUSIC ═══
  {
    name: 'Suno v5',
    category: 'music',
    desc: 'Full song generation with vocals and instruments',
    pricing: 'freemium',
    detail: '2M paid subscribers, $300M ARR. Licensed deals with major labels. Free: 50 credits/day (10 songs, non-commercial). Pro: $10/mo. Premier: $30/mo.',
  },
  {
    name: 'Stable Audio 2.5',
    category: 'music',
    desc: 'Sound effects, ambient audio, and music clips',
    pricing: 'freemium',
    detail: 'Quick sound effects and ambient audio generation. Under 2 second inference on GPU. Audio inpainting. Commercially safe. Available via API and platforms.',
  },

  // ═══ AUDIO ═══
  {
    name: 'ElevenLabs v3',
    category: 'audio',
    desc: 'Voice cloning, text-to-speech, AI dubbing',
    pricing: 'freemium',
    detail: '$11B valuation. Voice cloning, TTS, dubbing, sound effects, Conversational AI, ElevenReader app. Free: 10,000 chars/mo + 3 custom voices. Starter: $5/mo.',
    studentDeal: 'Free access via ElevenLabs for Students program + $1,500 in credits via AI Student Pack.',
  },

  // ═══ RESEARCH ═══
  {
    name: 'Perplexity',
    category: 'research',
    desc: 'AI search engine with inline citations',
    pricing: 'freemium',
    detail: 'Market leader in AI-powered search. Academic focus mode for peer-reviewed sources. Free tier (limited). Pro: $20/mo.',
    studentDeal: 'Education Pro: $10/mo (50% off). Schools with 500+ signups can get a free year.',
  },
  {
    name: 'Elicit',
    category: 'research',
    desc: 'Structured literature review from academic papers',
    pricing: 'freemium',
    detail: 'Best for structured literature reviews. Reads papers, extracts data across multiple sources, builds evidence tables. Free tier + paid plans.',
  },
  {
    name: 'Consensus',
    category: 'research',
    desc: 'Search 200M+ academic papers for evidence',
    pricing: 'freemium',
    detail: '"Consensus Meter" shows the weight of scientific evidence on any topic. Best for quick evidence-based questions. Free tier + paid plans.',
  },
  {
    name: 'Claude Research',
    category: 'research',
    desc: 'Deep research with comprehensive cited reports',
    pricing: 'paid',
    detail: 'Reads dozens of web sources, produces comprehensive reports with citations. Part of Claude Pro ($20/mo) or Max.',
  },
  {
    name: 'NotebookLM',
    category: 'research',
    desc: 'Upload docs, ask questions, generate audio podcasts',
    pricing: 'free',
    detail: 'By Google. Upload your own documents and get AI analysis grounded only in those sources — no hallucination risk. Can generate podcast-style audio summaries. Completely free.',
  },

  // ═══ BROWSERS & AGENTS ═══
  {
    name: 'Dia',
    category: 'browser',
    desc: 'AI-first browser that chats with your tabs',
    pricing: 'free',
    detail: 'Successor to Arc (which stopped development in 2025). Summarizes content, integrates with Slack, Notion, Gmail, Calendar. Mac available; Windows in testing. Free.',
  },
  {
    name: 'ChatGPT Agent',
    category: 'browser',
    desc: 'Browser automation + deep research in ChatGPT',
    pricing: 'paid',
    detail: 'Replaced OpenAI\'s Operator. Combines autonomous web browsing with deep research using its own virtual computer. Part of ChatGPT Plus ($20/mo).',
  },
  {
    name: 'Claude Computer Use',
    category: 'browser',
    desc: 'Claude opens apps, navigates browsers on your Mac',
    pricing: 'paid',
    detail: 'Launched March 23, 2026. Claude can open applications, navigate browsers, fill spreadsheets directly on your computer. macOS only (for now). Part of Claude Pro ($20/mo).',
  },

  // ═══ CODING ═══
  {
    name: 'Claude Code',
    category: 'coding',
    desc: 'Terminal-based AI agent that reads, writes, and runs code',
    pricing: 'paid',
    detail: 'Reads your full codebase, edits files, runs commands, debugs errors. Went from zero to #1 in 8 months. Requires Claude Pro ($20/mo) or Max ($100-200/mo).',
  },
  {
    name: 'Cursor',
    category: 'coding',
    desc: 'AI-native code editor, 1M+ users',
    pricing: 'freemium',
    detail: 'VS Code fork with multi-file editing, Background Agents, and full codebase awareness. Most popular AI coding tool. Free tier (limited). Pro: $20/mo.',
    studentDeal: '1 year of Cursor Pro FREE for verified students (.edu + SheerID).',
  },
  {
    name: 'Windsurf',
    category: 'coding',
    desc: 'AI editor with autonomous "Cascade" mode',
    pricing: 'freemium',
    detail: 'VS Code-based IDE acquired by Cognition (makers of Devin). Fast, good for beginners. Free: 25 prompts/mo + unlimited autocomplete. Pro: $15-20/mo.',
  },
  {
    name: 'GitHub Copilot',
    category: 'coding',
    desc: 'Industry standard, 77K+ organizations',
    pricing: 'freemium',
    detail: '400+ Fortune 500 companies, 3B+ lines of accepted code/month. Agent Mode added. Free tier available. Pro: $10/mo.',
    studentDeal: 'FREE for verified students via GitHub Education pack.',
  },
  {
    name: 'Replit Agent 4',
    category: 'coding',
    desc: 'Builds full apps from prompts with parallel agents',
    pricing: 'freemium',
    detail: 'Launched March 2026. Infinite canvas, parallel multi-agent execution. 10x faster than Agent 3. $9B valuation. Free tier works well for learning.',
  },
  {
    name: 'Google Antigravity',
    category: 'coding',
    desc: 'Free AI IDE with 5 parallel autonomous agents',
    pricing: 'free',
    detail: 'VS Code fork powered by Gemini 3.1 Pro. Also supports Claude models. 5 parallel agents. Free for individuals during public preview.',
  },
  {
    name: 'OpenAI Codex',
    category: 'coding',
    desc: 'Open-source CLI coding agent',
    pricing: 'paid',
    detail: 'Rust-based CLI agent with GPT-5-Codex optimized for coding. New Codex App on Windows. Part of ChatGPT Plus/Pro/Business/Edu.',
  },
  {
    name: 'Amazon Kiro',
    category: 'coding',
    desc: 'Spec-driven development — requirements before code',
    pricing: 'freemium',
    detail: 'Writes requirements specs before generating code. Python + JavaScript. Free: 50 interactions/mo. Pro: $19/mo.',
    studentDeal: 'Free 1-year access for college students.',
  },

  // ═══ AGGREGATORS ═══
  {
    name: 'Krea AI',
    category: 'aggregator',
    desc: 'Access Flux, Veo, Runway, Luma, Kling + more in one place',
    pricing: 'freemium',
    detail: '30M+ users. Aggregates image gen, video, 3D, upscaling, and LoRA fine-tuning from many top models. Used by Nike, Samsung, Lego. Free tier (generous). Basic: $9/mo.',
  },
  {
    name: 'Poe',
    category: 'aggregator',
    desc: 'Chat with GPT-4o, Claude, Gemini, Llama and more',
    pricing: 'freemium',
    detail: 'By Quora. One subscription gives you access to all major chat models plus image gen. Create and share custom bots. Free tier + $19.99/mo.',
  },
  {
    name: 'Replicate',
    category: 'aggregator',
    desc: 'Run any open-source AI model via API',
    pricing: 'freemium',
    detail: 'Run thousands of open-source models (Flux, Stable Diffusion, Whisper, etc.) without managing infrastructure. Pay per second of compute. Free credits to start.',
  },
  {
    name: 'HuggingFace',
    category: 'aggregator',
    desc: 'The GitHub of AI — models, datasets, and Spaces',
    pricing: 'free',
    detail: 'Hosts 500K+ models, 100K+ datasets, and free "Spaces" to run demos. The open-source AI community hub. Free for most use; Pro for compute.',
  },

  {
    name: 'OpenRouter',
    category: 'aggregator',
    desc: 'One API key for 100+ LLMs from every provider',
    pricing: 'freemium',
    detail: 'Unified API that routes to OpenAI, Anthropic, Google, Meta, Mistral, and open-source models through a single endpoint. Pay-per-use at pass-through pricing (often cheaper than direct).',
  },
  {
    name: 'Together AI',
    category: 'aggregator',
    desc: 'Cheapest way to run open-source AI models fast',
    pricing: 'freemium',
    detail: 'Cloud platform optimized for open-source models (Llama, Mistral, Flux, etc.) at high speed. API + playground. Competitive per-token pricing — often the cheapest option for open models.',
  },

  // ═══ OTHER ═══
  {
    name: 'Google Stitch',
    category: 'other',
    desc: 'AI UI design — generates interfaces from text or sketches',
    pricing: 'free',
    detail: 'Generate high-fidelity web/mobile interfaces from text, sketches, or voice. Integrates with Claude Code and Cursor via MCP. 350 free generations/month via Google Labs.',
  },
  {
    name: 'Google Project Genie',
    category: 'other',
    desc: 'Creates interactive 3D worlds from text or images',
    pricing: 'paid',
    detail: 'AI world model — generates explorable 3D environments. Powered by Genie 3 (30K hours of gameplay training). 20-24 FPS, 720p. Requires Google AI Ultra ($249.99/mo). US only, 18+.',
  },
  {
    name: 'Meta Llama 4',
    category: 'other',
    desc: 'Open-source agentic AI model by Meta',
    pricing: 'free',
    detail: 'Fully open-source and free to use. Agentic capabilities — can plan, reason, and use tools. Run locally or via cloud providers.',
  },
  {
    name: 'FutureTools.io',
    category: 'other',
    desc: 'AI tool discovery — 4,000+ tools cataloged',
    pricing: 'free',
    detail: 'By Matt Wolfe. The most comprehensive AI tool directory with 4,000+ tools across 29 categories. 230K+ subscribers. Free to browse and search.',
  },
];
