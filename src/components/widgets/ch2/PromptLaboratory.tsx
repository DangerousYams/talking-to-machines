import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { useStreamingResponse } from '../../../hooks/useStreamingResponse';

type TemplateKey = 'creative' | 'code' | 'research' | 'debate';
type Mode = 'guided' | 'freeform';

interface Block {
  id: string;
  label: string;
  icon: string;
  color: string;
  content: Record<TemplateKey, string>;
}

const blocks: Block[] = [
  {
    id: 'role',
    label: 'System Role',
    icon: 'R',
    color: '#E94560',
    content: {
      creative: 'You are an award-winning poet known for vivid sensory imagery and unexpected metaphors.',
      code: 'You are a senior software engineer who writes clean, well-commented code and explains your reasoning.',
      research: 'You are a research analyst who synthesizes complex topics into clear, evidence-based summaries.',
      debate: 'You are a debate coach who builds strong arguments from multiple perspectives.',
    },
  },
  {
    id: 'context',
    label: 'Context',
    icon: 'Cx',
    color: '#0EA5E9',
    content: {
      creative: 'I\'m a high school student working on a poetry portfolio for my creative writing class. The theme is "transitions."',
      code: 'I\'m building a personal project — a weather dashboard app using React. I\'m comfortable with JavaScript but new to TypeScript.',
      research: 'I\'m writing a 5-page paper for my AP Environmental Science class. My teacher values nuance over simple pro/con arguments.',
      debate: 'I\'m preparing for a Model UN conference. I\'ve been assigned to represent Brazil on the topic of deforestation policy.',
    },
  },
  {
    id: 'examples',
    label: 'Examples (few-shot)',
    icon: 'Ex',
    color: '#F5A623',
    content: {
      creative: 'Here\'s the style I\'m going for:\n"October stripped the trees / and left their bones / whispering to a wind / that had already moved on."\nI like this mix of personification and melancholy.',
      code: 'Here\'s the pattern I want:\n```\nfunction getWeather(city: string): Promise<Weather> {\n  // Validate input\n  // Fetch from API\n  // Transform response\n  // Handle errors\n}\n```\nI want each function to follow this commented-skeleton pattern.',
      research: 'Here\'s the level of nuance I\'m aiming for:\n"While deforestation rates in the Amazon fell 33% between 2004 and 2012 due to satellite monitoring, enforcement lapses after 2019 suggest that policy alone — without institutional will — cannot sustain progress."',
      debate: 'Here\'s how I want to frame arguments:\nClaim: "Brazil\'s sovereignty over the Amazon must be balanced with its role as a global carbon sink."\nEvidence: [specific data point]\nImplication: [why this matters for the debate resolution]',
    },
  },
  {
    id: 'task',
    label: 'Task',
    icon: 'T',
    color: '#0F3460',
    content: {
      creative: 'Write a poem about autumn — specifically the moment when the season shifts and you can feel it in the air for the first time.',
      code: 'Write a React component called WeatherCard that displays the current temperature, conditions, and a 5-day forecast. Include TypeScript types.',
      research: 'Write a 500-word analysis of how satellite-based deforestation monitoring has changed conservation outcomes in the Amazon rainforest.',
      debate: 'Write an opening statement (2 minutes) for Brazil\'s position on balancing economic development with rainforest preservation.',
    },
  },
  {
    id: 'format',
    label: 'Format',
    icon: 'F',
    color: '#7B61FF',
    content: {
      creative: 'Free verse, 12–20 lines. No rhyming. Use line breaks intentionally — each break should create a pause or shift.',
      code: 'A single .tsx file with: TypeScript interface at the top, component function, and brief JSDoc comments. Use Tailwind CSS for styling.',
      research: 'Structure: Opening hook → Background (2 paragraphs) → Analysis of effectiveness → Limitations → Conclusion. Use topic sentences.',
      debate: 'Structure: Greeting → Position statement → 3 key arguments with evidence → Call to action. Keep sentences punchy for oral delivery.',
    },
  },
  {
    id: 'constraints',
    label: 'Constraints',
    icon: 'Cn',
    color: '#16C79A',
    content: {
      creative: 'Avoid clichés like "golden leaves" or "crisp air." No abstract nouns in the first 4 lines — ground it in physical sensory detail.',
      code: 'No class components. No any types. Handle loading and error states. Don\'t use external libraries beyond React and Tailwind.',
      research: 'Cite at least 3 specific data points. Don\'t use "both sides" framing — take a nuanced position. Avoid passive voice.',
      debate: 'Don\'t concede Brazil\'s right to develop. Don\'t use emotional appeals without data. Stay in character as Brazil\'s representative.',
    },
  },
  {
    id: 'cot',
    label: 'Chain-of-Thought',
    icon: '→',
    color: '#9333EA',
    content: {
      creative: 'Before writing, think through: What specific sensory details mark the shift from summer to autumn? What emotions does that transition evoke? What metaphor captures it freshly?',
      code: 'Think step by step: First, define the data types. Then, plan the component structure. Then, implement each section. Finally, add error handling.',
      research: 'Reason through this step by step: First, establish what deforestation monitoring looked like before satellites. Then, analyze the key turning points. Then, evaluate current effectiveness.',
      debate: 'Think through your argument structure first: What is Brazil\'s strongest position? What counterarguments will you face? How do you preempt them?',
    },
  },
];

const fallbackResponses: Record<TemplateKey, Record<number, string>> = {
  creative: {
    0: "Here's a poem about autumn:\n\nAutumn is a beautiful time of year.\nThe leaves change colors, red and gold.\nThe air gets cooler day by day.\nPumpkins and apples fill the stores.\nSweaters come out of storage bins.\nThe days grow shorter, nights grow long.\nNature prepares for winter's rest.\n\nThis captures the essence of the fall season and its many changes.",
    1: "The first cold morning catches you mid-stride —\nnot the cold of winter, but the cold\nthat remembers warmth and wonders\nhow long it gets to stay.\n\nThe maples haven't turned yet.\nBut something underneath the bark\nis already letting go,\nthe way a hand uncurls in sleep\nwithout deciding to.\n\nYou zip your jacket for the first time\nsince April. The metal teeth\nsound like a small admission.\n\nSummer didn't end.\nIt just stopped looking back.",
    2: "The first cold morning catches you mid-stride —\nnot the cold of winter, but the cold\nthat remembers warmth and wonders\nhow long it gets to stay.\n\nThe maples haven't turned yet.\nBut something underneath the bark\nis already letting go,\nthe way a hand uncurls in sleep\nwithout deciding to.\n\nYou walk past the garden hose,\nstill coiled like a question\nnobody bothered to answer.\nA sparrow tugs at something\nin the gutter — a seed, a thread,\nsome currency of the in-between.\n\nYou zip your jacket for the first time\nsince April. The metal teeth\nsound like a small admission.\n\nSummer didn't end.\nIt just stopped looking back.",
    3: "The first cold morning catches you mid-stride —\nnot the cold of winter, but the cold\nthat remembers warmth and wonders\nhow long it gets to stay.\n\nThe maples haven't turned yet.\nBut something underneath the bark\nis already letting go,\nthe way a hand uncurls in sleep\nwithout deciding to.\n\nYou walk past the garden hose,\nstill coiled like a question\nnobody bothered to answer.\nA sparrow tugs at something\nin the gutter — a seed, a thread,\nsome currency of the in-between.\n\nYou zip your jacket for the first time\nsince April. The metal teeth\nsound like a small admission.\n\nSummer didn't end.\nIt just stopped looking back.",
  },
  code: {
    0: "Here's a weather card component:\n\n```tsx\nfunction WeatherCard() {\n  return (\n    <div>\n      <h2>Weather</h2>\n      <p>Temperature: 72°F</p>\n      <p>Conditions: Sunny</p>\n      <p>Forecast: Nice all week</p>\n    </div>\n  );\n}\n```\n\nThis gives you a basic weather display!",
    1: "```tsx\ninterface Weather {\n  temp: number;\n  condition: string;\n  forecast: { day: string; high: number; low: number; icon: string }[];\n}\n\ninterface WeatherCardProps {\n  city: string;\n}\n\nexport default function WeatherCard({ city }: WeatherCardProps) {\n  const [weather, setWeather] = useState<Weather | null>(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<string | null>(null);\n\n  useEffect(() => {\n    fetchWeather(city)\n      .then(setWeather)\n      .catch((e) => setError(e.message))\n      .finally(() => setLoading(false));\n  }, [city]);\n\n  if (loading) return <div className=\"animate-pulse\">Loading...</div>;\n  if (error) return <div className=\"text-red-500\">{error}</div>;\n  if (!weather) return null;\n\n  return (\n    <div className=\"rounded-xl bg-white shadow-lg p-6\">\n      <h2 className=\"text-2xl font-bold\">{city}</h2>\n      <p className=\"text-5xl font-light\">{weather.temp}°F</p>\n      <p className=\"text-gray-500\">{weather.condition}</p>\n      <div className=\"grid grid-cols-5 gap-2 mt-4\">\n        {weather.forecast.map((day) => (\n          <div key={day.day} className=\"text-center text-sm\">\n            <p className=\"font-medium\">{day.day}</p>\n            <p>{day.icon}</p>\n            <p>{day.high}° / {day.low}°</p>\n          </div>\n        ))}\n      </div>\n    </div>\n  );\n}\n```",
    2: "```tsx\n/** Weather data shape returned by the API */\ninterface Weather {\n  temp: number;\n  condition: string;\n  humidity: number;\n  windSpeed: number;\n  forecast: ForecastDay[];\n}\n\ninterface ForecastDay {\n  day: string;\n  high: number;\n  low: number;\n  condition: string;\n  icon: string;\n}\n\ninterface WeatherCardProps {\n  city: string;\n}\n\n/** Displays current weather and 5-day forecast for a given city */\nexport default function WeatherCard({ city }: WeatherCardProps) {\n  const [weather, setWeather] = useState<Weather | null>(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<string | null>(null);\n\n  useEffect(() => {\n    // Reset state when city changes\n    setLoading(true);\n    setError(null);\n\n    fetchWeather(city)\n      .then(setWeather)\n      .catch((err: Error) => setError(err.message))\n      .finally(() => setLoading(false));\n  }, [city]);\n\n  if (loading) {\n    return (\n      <div className=\"rounded-xl bg-white shadow-lg p-6 animate-pulse\">\n        <div className=\"h-8 bg-gray-200 rounded w-1/3 mb-4\" />\n        <div className=\"h-12 bg-gray-200 rounded w-1/4 mb-2\" />\n        <div className=\"h-4 bg-gray-200 rounded w-1/2\" />\n      </div>\n    );\n  }\n\n  if (error) {\n    return (\n      <div className=\"rounded-xl border-2 border-red-200 bg-red-50 p-6\">\n        <p className=\"text-red-600 font-medium\">Failed to load weather</p>\n        <p className=\"text-red-400 text-sm mt-1\">{error}</p>\n      </div>\n    );\n  }\n\n  if (!weather) return null;\n\n  return (\n    <div className=\"rounded-xl bg-white shadow-lg p-6\">\n      {/* Current conditions */}\n      <h2 className=\"text-2xl font-bold text-gray-900\">{city}</h2>\n      <div className=\"flex items-baseline gap-2 mt-2\">\n        <span className=\"text-5xl font-light\">{weather.temp}°</span>\n        <span className=\"text-gray-500 text-lg\">{weather.condition}</span>\n      </div>\n      <div className=\"flex gap-4 mt-2 text-sm text-gray-400\">\n        <span>Humidity: {weather.humidity}%</span>\n        <span>Wind: {weather.windSpeed} mph</span>\n      </div>\n\n      {/* 5-day forecast */}\n      <div className=\"grid grid-cols-5 gap-2 mt-6 pt-4 border-t\">\n        {weather.forecast.map((day) => (\n          <div key={day.day} className=\"text-center\">\n            <p className=\"text-xs font-medium text-gray-500\">{day.day}</p>\n            <p className=\"text-xl my-1\">{day.icon}</p>\n            <p className=\"text-sm\">\n              <span className=\"font-medium\">{day.high}°</span>\n              <span className=\"text-gray-400\"> {day.low}°</span>\n            </p>\n          </div>\n        ))}\n      </div>\n    </div>\n  );\n}\n```\n\nClean TypeScript types, proper loading/error states, and Tailwind styling throughout.",
    3: "```tsx\n/** Weather data shape returned by the API */\ninterface Weather {\n  temp: number;\n  condition: string;\n  humidity: number;\n  windSpeed: number;\n  forecast: ForecastDay[];\n}\n\ninterface ForecastDay {\n  day: string;\n  high: number;\n  low: number;\n  condition: string;\n  icon: string;\n}\n\ninterface WeatherCardProps {\n  city: string;\n}\n\n/** Displays current weather and 5-day forecast for a given city */\nexport default function WeatherCard({ city }: WeatherCardProps) {\n  const [weather, setWeather] = useState<Weather | null>(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<string | null>(null);\n\n  useEffect(() => {\n    setLoading(true);\n    setError(null);\n    fetchWeather(city)\n      .then(setWeather)\n      .catch((err: Error) => setError(err.message))\n      .finally(() => setLoading(false));\n  }, [city]);\n\n  if (loading) return <WeatherSkeleton />;\n  if (error) return <WeatherError message={error} />;\n  if (!weather) return null;\n\n  return (\n    <div className=\"rounded-xl bg-white shadow-lg p-6\">\n      <h2 className=\"text-2xl font-bold text-gray-900\">{city}</h2>\n      <div className=\"flex items-baseline gap-2 mt-2\">\n        <span className=\"text-5xl font-light\">{weather.temp}°</span>\n        <span className=\"text-gray-500 text-lg\">{weather.condition}</span>\n      </div>\n      <div className=\"flex gap-4 mt-2 text-sm text-gray-400\">\n        <span>Humidity: {weather.humidity}%</span>\n        <span>Wind: {weather.windSpeed} mph</span>\n      </div>\n      <div className=\"grid grid-cols-5 gap-2 mt-6 pt-4 border-t\">\n        {weather.forecast.map((day) => (\n          <ForecastDayCard key={day.day} {...day} />\n        ))}\n      </div>\n    </div>\n  );\n}\n```\n\nStep-by-step reasoning applied: Types first, then component structure, then implementation, then error handling. Each piece is isolated and testable.",
  },
  research: {
    0: "Satellite monitoring has been very helpful for tracking deforestation in the Amazon. It lets scientists see where trees are being cut down. Brazil uses a system called DETER to monitor the forest. This has helped reduce deforestation in some areas.\n\nHowever, there are still challenges. Illegal logging continues in many regions. Climate change also threatens the rainforest. More work needs to be done to protect this important ecosystem.",
    1: "When Brazil launched its DETER satellite monitoring system in 2004, it fundamentally changed the equation of rainforest conservation. For the first time, enforcement agencies could detect deforestation events in near-real-time rather than discovering clearcuts months after the fact.\n\nThe numbers tell a striking story. Between 2004 and 2012, annual deforestation in the Brazilian Amazon dropped from 27,772 km\u00b2 to 4,571 km\u00b2 \u2014 an 83% reduction. Satellite data didn\u2019t just measure the problem; it created accountability.\n\nBut technology alone proved insufficient. After 2019, when enforcement budgets were cut and political will shifted, deforestation surged 75% despite the same monitoring infrastructure being in place. The satellites could see everything. The question was whether anyone was watching.\n\nThis reveals a crucial nuance: satellite monitoring is a necessary but not sufficient condition for conservation. The data must be paired with institutional will, funding for enforcement, and legal frameworks that impose meaningful consequences.\n\nThe most promising development is the integration of AI-powered analysis with satellite imagery, which can now detect selective logging \u2014 individual trees removed from the canopy \u2014 that older systems missed entirely. Whether this technological leap will matter depends on the same human factors that have always determined the Amazon\u2019s fate.",
    2: "When Brazil launched its DETER satellite monitoring system in 2004, it fundamentally changed the equation of rainforest conservation. For the first time, enforcement agencies could detect deforestation events in near-real-time rather than discovering clearcuts months after the fact.\n\nThe numbers tell a striking story. Between 2004 and 2012, annual deforestation in the Brazilian Amazon dropped from 27,772 km\u00b2 to 4,571 km\u00b2 \u2014 an 83% reduction that coincided directly with the deployment of satellite alerts to enforcement teams on the ground. This wasn\u2019t correlation masquerading as causation: Assuncao et al. (2015) demonstrated that municipalities receiving real-time satellite alerts showed 36% greater deforestation reductions than comparable areas without them.\n\nBut technology alone proved insufficient. After 2019, deforestation surged 75% despite the same monitoring infrastructure being in place. INPE data showed that 99% of deforestation detected by satellites went unpunished during this period. The satellites could see everything. The question was whether anyone was watching.\n\nThis reveals a crucial nuance: satellite monitoring is a necessary but not sufficient condition for conservation. The data must be paired with institutional will, funding, and legal frameworks that impose meaningful consequences.\n\nThe most promising development is the integration of AI-powered analysis with satellite imagery, which can detect selective logging that older systems missed. Whether this technological leap matters depends on the same human factors that have always determined the Amazon\u2019s fate.",
    3: "When Brazil launched its DETER satellite monitoring system in 2004, it fundamentally changed the equation of rainforest conservation. For the first time, enforcement agencies could detect deforestation events in near-real-time rather than discovering clearcuts months after the fact.\n\nThe numbers tell a striking story. Between 2004 and 2012, annual deforestation in the Brazilian Amazon dropped from 27,772 km\u00b2 to 4,571 km\u00b2 \u2014 an 83% reduction that coincided directly with the deployment of satellite alerts to enforcement teams on the ground. This wasn\u2019t correlation masquerading as causation: Assuncao et al. (2015) demonstrated that municipalities receiving real-time satellite alerts showed 36% greater deforestation reductions than comparable areas without them.\n\nBut technology alone proved insufficient. After 2019, deforestation surged 75% despite the same monitoring infrastructure being in place. INPE data showed that 99% of deforestation detected by satellites went unpunished during this period. The satellites could see everything. The question was whether anyone was watching.\n\nThis reveals a crucial nuance: satellite monitoring is a necessary but not sufficient condition for conservation. The data must be paired with institutional will, enforcement funding, and legal frameworks with teeth.\n\nThe most promising current development is the integration of AI analysis with satellite imagery, capable of detecting selective logging \u2014 individual trees removed from the canopy \u2014 that older systems missed entirely. Whether this technological leap matters depends on the same human factors that have always determined the Amazon\u2019s fate. The lesson of the last two decades is not that monitoring works or doesn\u2019t \u2014 it\u2019s that data without accountability is just a more detailed record of loss.",
  },
  debate: {
    0: "Ladies and gentlemen, Brazil believes the Amazon is important. We need to protect the rainforest while also developing our economy. Deforestation is a complex issue with many factors. Brazil is committed to finding solutions that work for everyone. Thank you.",
    1: "Distinguished delegates,\n\nBrazil stands before this assembly not as a defendant, but as the steward of the world\u2019s largest tropical rainforest \u2014 a responsibility we did not choose but do not shirk.\n\nLet us be clear about three things.\n\nFirst, Brazil has demonstrated that development and conservation can coexist. Between 2004 and 2012, we reduced deforestation by 83% while our agricultural GDP grew 67%. The notion that we must choose between trees and prosperity is not just wrong \u2014 it\u2019s an argument wealthy nations use to keep developing countries dependent.\n\nSecond, the Amazon is sovereign Brazilian territory. However, we recognize that its role as a carbon sink gives the international community a legitimate interest. Brazil proposes a framework where that interest translates into funding \u2014 not lectures. The REDD+ mechanism valued standing forest at $5 per ton of carbon. The current market price is $50. Pay us the difference, and watch deforestation plummet.\n\nThird, 60% of the Amazon remains pristine because of Brazilian law and Brazilian enforcement. No other nation has preserved a comparable share of its natural heritage while lifting 30 million people out of poverty in the same period.\n\nBrazil calls on this body to match its rhetoric with resources. We will protect the Amazon. We ask only that the world invest in that protection proportionally to the benefit it receives.\n\nThank you.",
    2: "Distinguished delegates,\n\nBrazil stands before this assembly not as a defendant, but as the steward of the world\u2019s largest tropical rainforest \u2014 a responsibility we did not choose but do not shirk.\n\nLet us be clear about three things.\n\nFirst, Brazil has demonstrated that development and conservation can coexist. Between 2004 and 2012, we reduced deforestation by 83% while our agricultural GDP grew 67%. The claim that developing nations must choose between forests and prosperity is not just incorrect \u2014 it\u2019s an argument wealthy nations deploy to maintain economic dependency.\n\nSecond, the Amazon is sovereign Brazilian territory. However, we recognize that its role as a global carbon sink gives the international community a legitimate interest. Brazil proposes converting that interest into investment: the REDD+ mechanism values standing forest at $5 per ton of CO\u2082. The current carbon market price is $50. Close that gap, and watch deforestation plummet.\n\nThird, 60% of the Amazon remains pristine because of Brazilian law and Brazilian enforcement. No other nation has preserved a comparable share of its natural heritage while simultaneously lifting 30 million citizens out of poverty.\n\nBrazil calls on this body to match rhetoric with resources. We will protect the Amazon. The world must invest in that protection proportionally to the benefit it receives.\n\nThank you.",
    3: "Distinguished delegates,\n\nBrazil stands before this assembly not as a defendant, but as the steward of the world\u2019s largest tropical rainforest \u2014 a responsibility we did not choose but do not shirk.\n\nThree points.\n\nFirst: development and conservation are not enemies. Between 2004 and 2012, Brazil cut deforestation by 83% while growing agricultural GDP by 67%. The notion that we must choose between trees and prosperity is an argument wealthy nations use to keep developing countries dependent. Our track record proves otherwise.\n\nSecond: the Amazon is sovereign territory, but its role as a carbon sink gives the world a legitimate stake. We propose a simple framework. REDD+ values standing forest at $5 per ton of CO\u2082. The market price is $50. Close the gap, and watch deforestation plummet. This is not charity \u2014 it is payment for an ecosystem service the entire planet depends on.\n\nThird: 60% of the Amazon remains pristine today. Brazilian law, Brazilian enforcement, Brazilian political will. No other nation has preserved a comparable share of its natural heritage while lifting 30 million people from poverty in a single generation.\n\nBrazil does not ask for patience. We ask for partnership. Match your rhetoric with resources, and we will match your investment with results.\n\nThank you.",
  },
};

const systemPrompts: Record<TemplateKey, string> = {
  creative: 'You are a skilled creative writing assistant. Help with poetry and prose. Keep responses focused and artful.',
  code: 'You are an expert software engineer. Write clean, well-typed code with clear explanations. Use TypeScript and React best practices.',
  research: 'You are a research analyst. Provide evidence-based, nuanced analysis with specific data points.',
  debate: 'You are a debate coach. Help construct compelling arguments with evidence and rhetorical structure.',
};

const templateLabels: { key: TemplateKey; label: string; icon: string }[] = [
  { key: 'creative', label: 'Creative Writing', icon: '\u2726' },
  { key: 'code', label: 'Code Generation', icon: '\u27e8/\u27e9' },
  { key: 'research', label: 'Research', icon: '\u25c8' },
  { key: 'debate', label: 'Debate Prep', icon: '\u26a1' },
];

export default function PromptLaboratory() {
  const [template, setTemplate] = useState<TemplateKey>('creative');
  const [activeBlocks, setActiveBlocks] = useState<Set<string>>(new Set(['task']));
  const [mode, setMode] = useState<Mode>('guided');
  const [freeformText, setFreeformText] = useState('');
  const [fallbackTyping, setFallbackTyping] = useState(false);
  const [displayedFallback, setDisplayedFallback] = useState('');
  const responseRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const activeCount = activeBlocks.size;
  const qualityLevel = Math.min(3, Math.max(0, activeCount <= 1 ? 0 : activeCount <= 3 ? 1 : activeCount <= 5 ? 2 : 3));

  // Live AI
  const { response: liveResponse, isStreaming, error: liveError, sendMessages, abort } =
    useStreamingResponse({ systemPrompt: systemPrompts[template], maxTokens: 1024 });

  const buildPromptText = () => {
    const parts: string[] = [];
    blocks.forEach((b) => {
      if (activeBlocks.has(b.id)) {
        parts.push(b.content[template]);
      }
    });
    return parts.join('\n\n');
  };

  // Send freeform prompt to live AI
  const handleSendFreeform = () => {
    const text = freeformText.trim();
    if (!text || isStreaming) return;
    sendMessages([{ role: 'user', content: text }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSendFreeform();
    }
  };

  // Fallback typewriter
  const fallbackText = fallbackResponses[template][qualityLevel] || fallbackResponses[template][0];
  useEffect(() => {
    if (mode !== 'guided') return;
    setFallbackTyping(true);
    setDisplayedFallback('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < fallbackText.length) {
        setDisplayedFallback(fallbackText.slice(0, i + 1));
        i++;
      } else {
        setFallbackTyping(false);
        clearInterval(interval);
      }
    }, 6);
    return () => clearInterval(interval);
  }, [activeCount, template, mode]);

  const displayedResponse = mode === 'guided' ? displayedFallback : liveResponse;
  const isTyping = mode === 'guided' ? fallbackTyping : isStreaming;

  const toggleBlock = (id: string) => {
    setActiveBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // When switching to freeform, seed textarea with current blocks
  const handleModeSwitch = (newMode: Mode) => {
    if (newMode === 'freeform' && mode === 'guided') {
      setFreeformText(buildPromptText());
      abort();
    }
    setMode(newMode);
  };

  const qualityPercent = Math.min(100, Math.round((activeCount / blocks.length) * 100));
  const qualityLabel = qualityPercent >= 80 ? 'Expert' : qualityPercent >= 50 ? 'Strong' : qualityPercent >= 25 ? 'Basic' : 'Minimal';
  const qualityColor = qualityPercent >= 80 ? '#16C79A' : qualityPercent >= 50 ? '#0EA5E9' : qualityPercent >= 25 ? '#F5A623' : '#6B7280';

  return (
    <div className="widget-container" style={{ display: 'flex', flexDirection: 'column' as const, height: '100%' }}>
      {/* Header */}
      <div style={{ padding: isMobile ? '1rem 1rem 0' : '1.5rem 2rem 0', borderBottom: '1px solid rgba(26,26,46,0.06)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #0F3460, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>Prompt Laboratory</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>Toggle technique blocks to build a sophisticated prompt</p>
          </div>
          {/* Mode toggle */}
          <div style={{ display: 'flex', borderRadius: 100, border: '1px solid rgba(26,26,46,0.1)', overflow: 'hidden', flexShrink: 0 }}>
            <button
              onClick={() => handleModeSwitch('guided')}
              style={{
                padding: '5px 10px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                letterSpacing: '0.04em', transition: 'all 0.25s',
                background: mode === 'guided' ? '#1A1A2E' : 'transparent',
                color: mode === 'guided' ? '#FAF8F5' : '#6B7280',
              }}
            >
              GUIDED
            </button>
            <button
              onClick={() => handleModeSwitch('freeform')}
              style={{
                padding: '5px 10px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                letterSpacing: '0.04em', transition: 'all 0.25s',
                background: mode === 'freeform' ? '#16C79A' : 'transparent',
                color: mode === 'freeform' ? '#FFFFFF' : '#6B7280',
              }}
            >
              LIVE AI
            </button>
          </div>
        </div>

        {/* Template tabs */}
        <div style={{ display: 'flex', gap: 2, overflowX: isMobile ? 'auto' as const : 'visible' as const, WebkitOverflowScrolling: 'touch' as any }}>
          {templateLabels.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTemplate(t.key); setActiveBlocks(new Set(['task'])); abort(); if (mode === 'freeform') setFreeformText(''); }}
              style={{
                padding: isMobile ? '0.5rem 0.65rem' : '0.5rem 1rem', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: template === t.key ? 700 : 500,
                background: template === t.key ? 'rgba(15,52,96,0.06)' : 'transparent',
                color: template === t.key ? '#0F3460' : '#6B7280',
                borderRadius: '8px 8px 0 0', transition: 'all 0.25s',
                letterSpacing: '0.02em', whiteSpace: 'nowrap' as const, flexShrink: 0,
                minHeight: 44,
              }}
            >
              <span style={{ marginRight: isMobile ? 4 : 6 }}>{t.icon}</span>{isMobile ? t.label.split(' ')[0] : t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', flex: 1, minHeight: 0 }}>
        {/* Left: Block toggles or freeform editor */}
        <div style={{ padding: isMobile ? '1rem' : '1.5rem 2rem', borderRight: isMobile ? 'none' : '1px solid rgba(26,26,46,0.06)', borderBottom: isMobile ? '1px solid rgba(26,26,46,0.06)' : 'none', display: 'flex', flexDirection: 'column' as const, gap: '1rem' }}>

          {mode === 'guided' ? (
            <>
              {/* Quality meter */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280' }}>Sophistication</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: qualityColor }}>{qualityLabel}</span>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: 'rgba(26,26,46,0.06)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2, transition: 'all 0.5s ease',
                    width: `${qualityPercent}%`,
                    background: `linear-gradient(90deg, ${qualityColor}, ${qualityColor}80)`,
                  }} />
                </div>
              </div>

              {/* Block toggles */}
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                {blocks.map((block) => {
                  const isActive = activeBlocks.has(block.id);
                  return (
                    <button
                      key={block.id}
                      onClick={() => toggleBlock(block.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: isMobile ? '10px 12px' : '8px 12px',
                        borderRadius: 8, border: '1px solid', cursor: 'pointer', transition: 'all 0.25s',
                        background: isActive ? `${block.color}08` : 'transparent',
                        borderColor: isActive ? `${block.color}30` : 'rgba(26,26,46,0.06)',
                        textAlign: 'left' as const, minHeight: 44,
                      }}
                    >
                      <div style={{
                        width: 36, height: 20, borderRadius: 10, position: 'relative' as const, flexShrink: 0,
                        background: isActive ? block.color : 'rgba(26,26,46,0.12)', transition: 'background 0.3s',
                      }}>
                        <div style={{
                          position: 'absolute' as const, top: 2, left: isActive ? 18 : 2,
                          width: 16, height: 16, borderRadius: '50%', background: 'white',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.3s ease',
                        }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{
                          fontFamily: 'var(--font-heading)', fontSize: '0.78rem', fontWeight: 600,
                          color: isActive ? block.color : '#6B7280', transition: 'color 0.25s',
                          display: 'block', lineHeight: 1.3,
                        }}>
                          {block.label}
                        </span>
                        {isActive && (
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280',
                            display: 'block', marginTop: 2, lineHeight: 1.4,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                          }}>
                            {block.content[template].slice(0, 60)}...
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer: count */}
              <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', letterSpacing: '0.05em' }}>
                  {activeCount} of {blocks.length} techniques active
                </span>
              </div>
            </>
          ) : (
            /* Freeform mode: editable textarea */
            <>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280' }}>Your Prompt</span>
              </div>
              <textarea
                value={freeformText}
                onChange={(e) => setFreeformText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your prompt here — or switch to Guided mode to build one with technique blocks, then come back to edit and send it..."
                style={{
                  width: '100%', flex: 1, minHeight: 0, padding: '1rem 1.25rem',
                  fontFamily: 'var(--font-mono)', fontSize: isMobile ? '0.8rem' : '0.82rem', lineHeight: 1.7,
                  background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.08)', borderRadius: 10,
                  resize: 'vertical' as const, outline: 'none', color: '#1A1A2E',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#0EA5E940'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={handleSendFreeform}
                  disabled={!freeformText.trim() || isStreaming}
                  style={{
                    padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                    letterSpacing: '0.04em', transition: 'all 0.25s',
                    background: !freeformText.trim() || isStreaming ? 'rgba(26,26,46,0.08)' : '#0F3460',
                    color: !freeformText.trim() || isStreaming ? '#6B7280' : '#FAF8F5',
                    minHeight: 44,
                  }}
                >
                  {isStreaming ? 'Running...' : 'Send to Claude \u2192'}
                </button>
                {liveError && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#E94560' }}>
                    {liveError}
                  </span>
                )}
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', marginTop: -4, lineHeight: 1.5 }}>
                {isMobile ? 'Tap Send' : 'Cmd+Enter to send'} &middot; Try building in Guided mode first, then editing here
              </p>
            </>
          )}
        </div>

        {/* Right: AI Response */}
        <div style={{ padding: isMobile ? '1rem' : '1.5rem 2rem', background: 'rgba(26,26,46,0.015)', display: 'flex', flexDirection: 'column' as const }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1rem' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: isTyping ? '#16C79A' : '#6B7280', transition: 'background 0.3s' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280' }}>
              {isTyping ? 'Generating...' : 'AI Response'}
            </span>
            {mode === 'freeform' && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#16C79A', marginLeft: 'auto', background: 'rgba(22,199,154,0.08)', padding: '2px 8px', borderRadius: 100 }}>
                LIVE
              </span>
            )}
          </div>
          <div ref={responseRef} style={{
            fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.82rem' : '0.85rem', lineHeight: 1.75,
            color: '#1A1A2E', whiteSpace: 'pre-wrap' as const, flex: 1, overflowY: 'auto' as const, maxHeight: isMobile ? '35dvh' : '40dvh',
          }}>
            {mode === 'freeform' && !liveResponse && !isStreaming ? (
              <p style={{ color: '#6B7280', fontStyle: 'italic', margin: 0 }}>Write a prompt and hit send to see a real AI response...</p>
            ) : (
              displayedResponse.split('\n').map((line, i) => {
                if (line.startsWith('```')) return null;
                if (line.startsWith('**') && line.includes('**')) {
                  const parts = line.split('**');
                  return (
                    <p key={i} style={{ margin: '0.5em 0' }}>
                      {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : <span key={j}>{p}</span>)}
                    </p>
                  );
                }
                return line ? <p key={i} style={{ margin: '0.4em 0' }}>{line}</p> : <br key={i} />;
              })
            )}
            {isTyping && <span style={{ display: 'inline-block', width: 2, height: '1em', background: '#0F3460', marginLeft: 2, animation: 'pulse 1s infinite' }} />}
          </div>
        </div>
      </div>

      {/* Footer insight */}
      <div style={{
        padding: isMobile ? '1rem' : '1rem 2rem', borderTop: '1px solid rgba(26,26,46,0.06)',
        background: 'linear-gradient(135deg, rgba(15,52,96,0.04), rgba(14,165,233,0.04))',
        flexShrink: 0,
      }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontStyle: 'italic', color: '#1A1A2E', margin: 0 }}>
          <span style={{ fontWeight: 600, color: '#0F3460', fontStyle: 'normal' }}>Try it: </span>
          {mode === 'freeform'
            ? 'Edit the prompt freely and send it to Claude. Try removing sections, rewriting in your own words, or asking something completely different.'
            : 'Toggle blocks on and off to see how each technique changes the AI\'s output. Start with just Task, then add techniques one at a time.'
          }
        </p>
      </div>
    </div>
  );
}
