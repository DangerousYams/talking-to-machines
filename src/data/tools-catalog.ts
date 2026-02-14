export interface Tool {
  name: string;
  category: ToolCategory;
  desc: string;
  pricing: 'free' | 'freemium' | 'paid';
  detail?: string;
}

export type ToolCategory =
  | 'image-gen'
  | 'image-edit'
  | 'video'
  | 'music'
  | 'audio'
  | 'research'
  | 'browser'
  | 'coding';

export const categoryLabels: Record<ToolCategory, string> = {
  'image-gen': 'Image Gen',
  'image-edit': 'Image Edit',
  'video': 'Video',
  'music': 'Music',
  'audio': 'Audio',
  'research': 'Research',
  'browser': 'Browsers',
  'coding': 'Coding',
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
};

export const toolsCatalog: Tool[] = [
  // Image Synthesis
  {
    name: 'Midjourney',
    category: 'image-gen',
    desc: 'Artistic image generation via Discord and web',
    pricing: 'paid',
    detail: 'Known for stunning, artistic outputs with a distinctive style. Excels at concept art, illustrations, and photorealistic scenes. Accessed through Discord or the web app.',
  },
  {
    name: 'DALL-E 3',
    category: 'image-gen',
    desc: 'OpenAI\'s text-to-image, integrated in ChatGPT',
    pricing: 'freemium',
    detail: 'Tightly integrated into ChatGPT, making it easy to iterate on images conversationally. Strong at following complex, detailed prompts and rendering text in images.',
  },
  {
    name: 'Stable Diffusion',
    category: 'image-gen',
    desc: 'Open-source, runs locally or in cloud',
    pricing: 'free',
    detail: 'The open-source powerhouse. Run it on your own hardware for free, fine-tune it on custom data, and customize every parameter. Huge community of models and extensions.',
  },
  {
    name: 'Flux',
    category: 'image-gen',
    desc: 'Fast, high-quality open model by Black Forest Labs',
    pricing: 'freemium',
    detail: 'Created by former Stability AI researchers. Known for speed and quality, with multiple model sizes to balance performance and resource requirements.',
  },
  {
    name: 'Ideogram',
    category: 'image-gen',
    desc: 'Strongest at text rendering in images',
    pricing: 'freemium',
    detail: 'The go-to choice when you need legible text in generated images -- logos, posters, signs. Other models often garble text, but Ideogram handles it reliably.',
  },

  // Image Editing
  {
    name: 'Photoshop AI',
    category: 'image-edit',
    desc: 'Generative fill, expand, remove inside Photoshop',
    pricing: 'paid',
    detail: 'Adobe integrated generative AI directly into Photoshop. Select a region, describe what you want, and it fills seamlessly. Works within your existing creative workflow.',
  },
  {
    name: 'Runway Inpainting',
    category: 'image-edit',
    desc: 'Mask and replace regions of any image',
    pricing: 'freemium',
    detail: 'Brush over any part of an image and describe what should replace it. Web-based, no software install needed. Part of the larger Runway creative AI suite.',
  },
  {
    name: 'Magnific',
    category: 'image-edit',
    desc: 'AI upscaling that adds real detail',
    pricing: 'paid',
    detail: 'Goes beyond simple upscaling -- it hallucinates plausible new detail into low-resolution images. Photographers and designers use it to rescue and enhance images.',
  },
  {
    name: 'Clipdrop',
    category: 'image-edit',
    desc: 'Remove backgrounds, relight, cleanup',
    pricing: 'freemium',
    detail: 'A Swiss army knife for quick image edits: background removal, relighting, object cleanup, and style transfer. Fast and accessible for everyday tasks.',
  },

  // Video Synthesis
  {
    name: 'Sora',
    category: 'video',
    desc: 'OpenAI\'s text and image-to-video model',
    pricing: 'paid',
    detail: 'Generates high-quality video clips from text descriptions or still images. Known for impressive physics simulation and cinematic quality, though access is limited.',
  },
  {
    name: 'Runway Gen-3',
    category: 'video',
    desc: 'Professional video generation and editing',
    pricing: 'paid',
    detail: 'The most established AI video platform. Text-to-video, image-to-video, and video-to-video transformations. Used by filmmakers and content creators professionally.',
  },
  {
    name: 'Kling',
    category: 'video',
    desc: 'High-quality video gen with strong motion',
    pricing: 'freemium',
    detail: 'Developed by Kuaishou. Particularly strong at generating natural human motion and complex physical interactions between objects.',
  },
  {
    name: 'Veo',
    category: 'video',
    desc: 'Google DeepMind\'s video generation',
    pricing: 'paid',
    detail: 'Google\'s entry into AI video. Strong understanding of physics and real-world dynamics. Integrated into Google\'s creative tools ecosystem.',
  },
  {
    name: 'Pika',
    category: 'video',
    desc: 'Quick video clips from text or images',
    pricing: 'freemium',
    detail: 'Optimized for fast, short video clips. Great for social media content, animated stickers, and quick visual experiments. Lower barrier to entry than pro tools.',
  },

  // Music
  {
    name: 'Suno',
    category: 'music',
    desc: 'Full song generation from text prompts',
    pricing: 'freemium',
    detail: 'Describe a song in natural language and get a full track with vocals, instruments, and structure. Supports genres from pop to metal to jazz. Surprisingly catchy results.',
  },
  {
    name: 'Udio',
    category: 'music',
    desc: 'Music generation with high audio fidelity',
    pricing: 'freemium',
    detail: 'Competes directly with Suno with a focus on audio quality and production value. Particularly strong at capturing genre-specific production styles.',
  },

  // Audio
  {
    name: 'ElevenLabs',
    category: 'audio',
    desc: 'Voice cloning and text-to-speech',
    pricing: 'freemium',
    detail: 'Industry-leading voice synthesis. Clone any voice from a short sample, or choose from a library of natural-sounding voices. Used for audiobooks, dubbing, and accessibility.',
  },
  {
    name: 'Play.ht',
    category: 'audio',
    desc: 'Natural-sounding AI voices',
    pricing: 'freemium',
    detail: 'Text-to-speech platform with a large library of voices across languages. Popular for podcast production, e-learning content, and automated customer service.',
  },
  {
    name: 'Stable Audio',
    category: 'audio',
    desc: 'Sound effects and ambient audio generation',
    pricing: 'freemium',
    detail: 'Generate sound effects, ambient soundscapes, and short musical clips from text descriptions. Great for game developers, filmmakers, and content creators.',
  },

  // Research Agents
  {
    name: 'Perplexity',
    category: 'research',
    desc: 'AI search engine with cited sources',
    pricing: 'freemium',
    detail: 'Searches the web in real-time and synthesizes answers with inline citations. Think of it as Google meets Wikipedia meets a research assistant. Great for fact-checking.',
  },
  {
    name: 'Elicit',
    category: 'research',
    desc: 'Research assistant that reads academic papers',
    pricing: 'freemium',
    detail: 'Designed for academic research. Searches millions of papers, extracts key findings, and helps you synthesize literature reviews. A grad student\'s best friend.',
  },
  {
    name: 'Consensus',
    category: 'research',
    desc: 'Search engine for scientific consensus',
    pricing: 'freemium',
    detail: 'Asks a question, gets answers backed by peer-reviewed research. Shows you what the scientific community actually agrees on, with links to the underlying papers.',
  },
  {
    name: 'Claude Research',
    category: 'research',
    desc: 'Deep research with comprehensive reports',
    pricing: 'paid',
    detail: 'Anthropic\'s deep research feature. Give it a complex question and it researches for minutes, reading dozens of sources to produce a comprehensive, cited report.',
  },
  {
    name: 'NotebookLM',
    category: 'research',
    desc: 'Google\'s document analysis and podcast generation',
    pricing: 'free',
    detail: 'Upload documents and NotebookLM becomes an expert on them. Ask questions, get summaries, and even generate podcast-style audio discussions of your sources.',
  },

  // AI Browsers
  {
    name: 'Arc',
    category: 'browser',
    desc: 'Browser with built-in AI summaries and actions',
    pricing: 'free',
    detail: 'A reimagined web browser with AI built into the browsing experience. Summarizes pages, answers questions about content, and helps you organize information.',
  },
  {
    name: 'Operator',
    category: 'browser',
    desc: 'OpenAI\'s autonomous web browsing agent',
    pricing: 'paid',
    detail: 'An AI agent that can navigate websites, fill out forms, and complete tasks on your behalf. Like having a virtual assistant that can use any website.',
  },
  {
    name: 'Claude Computer Use',
    category: 'browser',
    desc: 'Claude controls your screen and browser',
    pricing: 'paid',
    detail: 'Claude can see your screen and control your mouse and keyboard. Navigate websites, use applications, and complete multi-step tasks across any software.',
  },

  // Coding Tools
  {
    name: 'Claude Code',
    category: 'coding',
    desc: 'Agentic CLI that reads, writes, and runs your code',
    pricing: 'paid',
    detail: 'A command-line AI agent that understands your entire codebase. It reads files, writes code, runs tests, fixes errors, and iterates -- all from your terminal.',
  },
  {
    name: 'Cursor',
    category: 'coding',
    desc: 'AI-native code editor with full codebase context',
    pricing: 'freemium',
    detail: 'A VS Code fork rebuilt around AI. It indexes your entire codebase for context, suggests multi-line edits, and can refactor across files. The IDE reimagined.',
  },
  {
    name: 'Windsurf',
    category: 'coding',
    desc: 'AI editor with autonomous coding flows',
    pricing: 'freemium',
    detail: 'Another AI-first code editor that emphasizes autonomous multi-step coding. Can plan and execute complex changes across multiple files with minimal guidance.',
  },
  {
    name: 'GitHub Copilot',
    category: 'coding',
    desc: 'Inline code suggestions in VS Code',
    pricing: 'freemium',
    detail: 'The original AI coding assistant. Provides real-time code completions as you type, integrated directly into VS Code and other editors. Free for students.',
  },
  {
    name: 'Replit Agent',
    category: 'coding',
    desc: 'AI that builds and deploys full apps from prompts',
    pricing: 'freemium',
    detail: 'Describe an app and Replit Agent builds it end-to-end: sets up the project, writes the code, configures the database, and deploys it live. Zero to production in minutes.',
  },
];
