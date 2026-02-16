import CardDeck from './CardDeck';
import HeroCard from './HeroCard';
import TextCard from './TextCard';
import AnimationCard from './AnimationCard';
import FlippableCard from './FlippableCard';
import ClosingCard from './ClosingCard';

// Lab animations
import DecompositionTree from '../lab/DecompositionTree';

// Ch8 widgets
import ProjectOrchestrator from '../widgets/ch8/ProjectOrchestrator';
import ContextPacking from '../widgets/ch8/ContextPacking';

// Back-content for flippable cards
import {
  DecompositionBack,
  ContextPackingBack,
  decompositionKeyFact,
  contextPackingKeyFact,
} from '../widgets/ch8/Ch8FlipCards';

const ACCENT = '#0F3460';

export default function Ch8CardDeck() {
  return (
    <CardDeck accentColor={ACCENT} chapterSlug="ch8">
      {/* Card 1: Hero */}
      <HeroCard
        chapterNumber={8}
        title="Orchestrating Complexity"
        hook="Managing AI across projects bigger than any context window."
        accentColor={ACCENT}
      />

      {/* Card 2: Opening narrative */}
      <TextCard accentColor={ACCENT} chapterSlug="ch8" audioIndices={[1, 2]}>
        <p style={{ marginBottom: '1.25rem' }}>
          Here is the moment every ambitious beginner hits: you ask AI to build something real — a full game, a website with a backend, a research paper with citations — and the whole thing falls apart. Not because the AI isn't smart enough. Because the project is too big for a single conversation.
        </p>
        <p style={{ marginBottom: '1.25rem' }}>
          You paste in a wall of requirements, the AI gives you a confident-sounding response, and twenty minutes later you realize it forgot half of what you asked for.
        </p>
        <p>
          This isn't an AI problem. It's an <strong>orchestration problem.</strong>
        </p>
      </TextCard>

      {/* Card 3: Decomposition (text-first) -> ProjectOrchestrator widget */}
      <FlippableCard
        defaultSide="text"
        accentColor={ACCENT}
        textContent={<DecompositionBack />}
        widgetContent={<ProjectOrchestrator />}
        chapterSlug="ch8"
        audioIndices={[3, 4]}
        keyFact={decompositionKeyFact}
      />

      {/* Card 4: Handoff pattern narrative */}
      <TextCard accentColor={ACCENT} chapterSlug="ch8" audioIndices={[5, 6]}>
        <p style={{ marginBottom: '1.25rem' }}>
          The quality of your handoff artifact determines the quality of everything built downstream. Garbage in, garbage out — across conversations.
        </p>
        <p>
          <strong>The Handoff Pattern:</strong> Output from conversation 1 becomes input to conversation 2. The artifact — notes, draft, spec — is the critical interface.
        </p>
      </TextCard>

      {/* Card 5: ContextPacking widget -> context packing explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<ContextPacking />}
        textContent={<ContextPackingBack />}
        chapterSlug="ch8"
        audioIndices={[7, 8]}
        keyFact={contextPackingKeyFact}
      />

      {/* Card 6: Pull quote */}
      <TextCard variant="pull-quote" accentColor={ACCENT} chapterSlug="ch8" audioIndices={[9]}>
        The best AI users aren't the best prompters. They're the best project managers.
      </TextCard>

      {/* Card 7: Decomposition tree animation */}
      <AnimationCard caption="A complex task decomposes into focused, single-responsibility subtasks">
        <DecompositionTree />
      </AnimationCard>

      {/* Card 8: Closing */}
      <ClosingCard
        summaryQuote="The solution isn't a better prompt. It's a better process. Decompose, hand off, pack context wisely, and track what works."
        nextChapterTitle="When AI Gets It Wrong"
        nextChapterHref="/ch9-cards"
        accentColor={ACCENT}
      />
    </CardDeck>
  );
}
