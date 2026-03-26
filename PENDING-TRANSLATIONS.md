# Pending Translations & Audio Updates

Content added in English that needs to be translated (19 languages) and added to "Read to me" audio.

## Ch3: Context Engineering — "Strategies for Managing Context" section

**File:** `src/pages/ch3.astro`

**New content (between widget and ForYouCard):**

- Section heading: "Strategies for Managing Context"
- Intro paragraph: "Now that you understand the window, here's how to manage it like a pro..."
- Strategy 1: "Summarize as you go" — Every 5-10 messages, ask the AI to write a brief recap...
- Strategy 2: "Front-load what matters" — Put the most critical information at the beginning...
- Strategy 3: "Start fresh strategically" — Don't be afraid to start a new conversation...
- Strategy 4: "Be explicit about what to remember" — "Important: the user is vegetarian..."
- Strategy 5: "Use structured formats" — Bulleted lists, headers, and clear labels...

## Ch3: Context Engineering — Bonus Content section

**File:** `src/pages/ch3.astro`

**New content (bonus section before break):**

- BonusContent UI strings: "Want more?", "Bonus Exercises", "Two hands-on experiments to go deeper with context engineering.", "Bonus", "Go Deeper"
- Forgetting Experiment intro: heading + description paragraph
- System Prompt Sandbox intro: heading + description paragraph

Note: The widgets themselves (ForgettingExperiment, SystemPromptSandbox) were in the original chapter — their internal text may already be translated.

## BonusContent component (reusable)

**File:** `src/components/ui/BonusContent.tsx`

- "Want more?" (Caveat label)
- "Bonus Exercises" (heading)
- "Bonus" / "Go Deeper" (open state header)

Subtitle text is passed per-chapter in the .astro file, not in the component.

## ForYouCard (ch2-ch11)

No translation needed — content is AI-generated per-user at runtime.

## BreakReveal celebration

**File:** `src/components/breaks/BreakReveal.tsx`

- "New tool unlocked!" (Caveat handwriting text) — needs translation for localized chapters

## SharePrompt URL update

No translation needed — just a URL change (talkingtomachines.xyz).
