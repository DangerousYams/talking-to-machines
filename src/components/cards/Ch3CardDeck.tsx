import CardDeck from './CardDeck';
import HeroCard from './HeroCard';
import TextCard from './TextCard';
import AnimationCard from './AnimationCard';
import FlippableCard from './FlippableCard';
import ClosingCard from './ClosingCard';

// Lab animations
import ContextWindowFill from '../lab/ContextWindowFill';
import TokenRain from '../lab/TokenRain';

// Ch3 widgets
import ContextWindowViz from '../widgets/ch3/ContextWindowViz';
import ForgettingExperiment from '../widgets/ch3/ForgettingExperiment';
import SystemPromptSandbox from '../widgets/ch3/SystemPromptSandbox';

// Back-content for flippable cards
import {
  ContextWindowBack,
  ForgettingBack,
  SystemPromptBack,
  contextWindowKeyFact,
  forgettingKeyFact,
} from '../widgets/ch3/Ch3FlipCards';

const ACCENT = '#7B61FF';

export default function Ch3CardDeck() {
  return (
    <CardDeck accentColor={ACCENT} chapterSlug="ch3">
      {/* Card 1: Hero */}
      <HeroCard
        chapterNumber={3}
        title="Context Engineering"
        hook="AI doesn't forget — it was never remembering in the first place."
        accentColor={ACCENT}
      />

      {/* Card 2: Opening narrative */}
      <TextCard accentColor={ACCENT} chapterSlug="ch3" audioIndices={[1, 2]}>
        <p style={{ marginBottom: '1.25rem' }}>
          Imagine you're having a conversation with a friend, except every few minutes someone erases the whiteboard you've both been writing on. You start fresh — same friend, same room, but no shared notes. That's what every AI conversation is like under the hood.
        </p>
        <p style={{ marginBottom: '1.25rem' }}>
          AI has no memory. Not in the way you think. It doesn't remember yesterday's conversation, and it doesn't even truly "remember" what you said five messages ago. Every time it responds, it re-reads the entire conversation from scratch.
        </p>
        <p>
          Understanding this window is one of the most important skills in working with AI.
        </p>
      </TextCard>

      {/* Card 3: Context window explanation (text-first) → ContextWindowViz widget */}
      <FlippableCard
        defaultSide="text"
        accentColor={ACCENT}
        textContent={<ContextWindowBack />}
        widgetContent={<ContextWindowViz />}
        chapterSlug="ch3"
        audioIndices={[3, 4]}
        keyFact={contextWindowKeyFact}
      />

      {/* Card 4: Context window fill animation */}
      <AnimationCard caption="Messages fill the context window like blocks in a glass — when it overflows, the oldest ones fall away">
        <ContextWindowFill />
      </AnimationCard>

      {/* Card 5: Tokens explanation */}
      <TextCard accentColor={ACCENT} chapterSlug="ch3" audioIndices={[5, 6]}>
        <p style={{ marginBottom: '1.25rem' }}>
          AI doesn't read words the way you do. It reads <strong>tokens</strong> — chunks that are about three-quarters of a word long. The word "hamburger" is two tokens. "I" is one. A comma is one. A newline is one.
        </p>
        <p style={{ marginBottom: '1.25rem' }}>
          The rough math: <strong>1 token {'\u2248'} 4 characters {'\u2248'} 0.75 words.</strong> A page of text is about 400 tokens. A full novel is around 100,000 tokens. A typical context window holds somewhere between 8,000 and 200,000 tokens — depending on the model.
        </p>
        <p>
          Why does this matter? Because the context window is measured in tokens, not words. Every character you send — your prompt, the examples, the system instructions, and all the previous messages — eats into that budget. When you run out, the oldest information vanishes.
        </p>
      </TextCard>

      {/* Card 6: ForgettingExperiment widget → forgetting strategies explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<ForgettingExperiment />}
        textContent={<ForgettingBack />}
        chapterSlug="ch3"
        audioIndices={[7, 8]}
        keyFact={forgettingKeyFact}
      />

      {/* Card 7: Pull quote */}
      <TextCard variant="pull-quote" accentColor={ACCENT} chapterSlug="ch3" audioIndices={[9]}>
        The AI only knows what you show it. Choose wisely.
      </TextCard>

      {/* Card 8: SystemPromptSandbox widget → system prompt explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<SystemPromptSandbox />}
        textContent={<SystemPromptBack />}
        chapterSlug="ch3"
        audioIndices={[10]}
      />

      {/* Card 9: Token rain animation */}
      <AnimationCard caption="Sentences break apart into tokens — the atomic units that AI actually reads">
        <TokenRain />
      </AnimationCard>

      {/* Card 10: Closing */}
      <ClosingCard
        summaryQuote="Context engineering is the new prompt engineering. Writing a good prompt is step one — deciding what information to put in front of the AI is where the real leverage is."
        nextChapterTitle="The AI Landscape"
        nextChapterHref="/ch4"
        accentColor={ACCENT}
      />
    </CardDeck>
  );
}
