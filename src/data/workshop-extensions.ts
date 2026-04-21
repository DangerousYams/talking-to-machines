// Metadata for the 13 Chrome-extension prompts students can build on Day 2.
// Actual prompt text lives at /public/workshop-day2/extensions/<file>.md

export type ExtensionAccent = 'amber' | 'navy' | 'teal' | 'purple' | 'red' | 'sky';

export interface WorkshopExtension {
  num: string;          // display number, zero-padded
  slug: string;         // also the .md filename stem
  title: string;
  tagline: string;      // one-line hook
  audience: string;     // "Good for..." line
  accent: ExtensionAccent;
}

export const extensions: WorkshopExtension[] = [
  {
    num: '01',
    slug: '01-tab-rescue',
    title: 'Tab Rescue',
    tagline: 'Escape your 40+ open tabs with a clean list you can save — then close the ones you don\'t need.',
    audience: 'Everyone. The warm-up build.',
    accent: 'amber',
  },
  {
    num: '02',
    slug: '02-jargon-hover',
    title: 'Jargon Hover',
    tagline: 'Hover over finance or business terms anywhere on the web and get a one-line, plain-English definition.',
    audience: 'Finance and consulting folks.',
    accent: 'navy',
  },
  {
    num: '03',
    slug: '03-focus-switch',
    title: 'Focus Switch',
    tagline: 'One click blocks your distracting sites for 25 minutes, with a Pomodoro countdown in your toolbar.',
    audience: 'Everyone.',
    accent: 'amber',
  },
  {
    num: '04',
    slug: '04-ticker-peek',
    title: 'Ticker Peek',
    tagline: 'Underlines Indian company names anywhere on the web. Hover for live price and the stats you care about.',
    audience: 'Equity analysts and mutual-fund researchers.',
    accent: 'navy',
  },
  {
    num: '05',
    slug: '05-report-reader',
    title: 'Report Reader',
    tagline: 'One click strips ads and sidebars from Indian finance news sites, leaving a clean reading view.',
    audience: 'Anyone who reads Indian finance news.',
    accent: 'navy',
  },
  {
    num: '06',
    slug: '06-earnings-highlighter',
    title: 'Earnings Week Highlighter',
    tagline: 'Adds a small calendar badge next to any Indian company name if it has earnings in the next 7 days.',
    audience: 'Equity analysts.',
    accent: 'navy',
  },
  {
    num: '07',
    slug: '07-meeting-prep-launcher',
    title: 'Meeting Prep Launcher',
    tagline: 'Highlight a name, click once — LinkedIn, Google News, and Wikipedia open in one fresh window.',
    audience: 'Bankers, consultants, and sales folks.',
    accent: 'teal',
  },
  {
    num: '08',
    slug: '08-screener-sidekick',
    title: 'Screener.in Sidekick',
    tagline: 'On any Screener.in company page, a floating panel for personal notes, peers, and your tracked list.',
    audience: 'Retail investors and PMS research.',
    accent: 'navy',
  },
  {
    num: '09',
    slug: '09-bloomberg-cheatsheet',
    title: 'Bloomberg Cheatsheet',
    tagline: 'Every new tab becomes a searchable cheat sheet of the Bloomberg Terminal commands you always forget.',
    audience: 'New Bloomberg terminal users.',
    accent: 'navy',
  },
  {
    num: '10',
    slug: '10-prompt-pocket',
    title: 'Prompt Pocket',
    tagline: 'Save your best AI prompts in folders and paste any of them into any text field with a right-click.',
    audience: 'Heavy AI users.',
    accent: 'purple',
  },
  {
    num: '11',
    slug: '11-reference-stash',
    title: 'Reference Stash',
    tagline: 'Right-click any image, save it to a project, then browse all your references as visual boards in your new tab.',
    audience: 'Designers, creatives, and architects.',
    accent: 'red',
  },
  {
    num: '12',
    slug: '12-decision-journal',
    title: 'Decision Journal',
    tagline: 'Your new tab asks one reflective question every morning. Answers save locally and review monthly.',
    audience: 'Senior leaders and executives.',
    accent: 'teal',
  },
  {
    num: '13',
    slug: '13-team-birthday-radar',
    title: 'Team Birthday Radar',
    tagline: 'Paste your reports\' birthdays once. Two days before each event, get a notification with a message you can tweak.',
    audience: 'People managers.',
    accent: 'teal',
  },
];
