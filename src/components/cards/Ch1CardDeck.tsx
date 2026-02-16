import CardDeck from './CardDeck';
import HeroCard from './HeroCard';
import TextCard from './TextCard';
import AnimationCard from './AnimationCard';
import FlippableCard from './FlippableCard';
import ClosingCard from './ClosingCard';

// Lab animations
import PromptMorphAnimation from '../lab/PromptMorphAnimation';
import BuildingBlocksAssembly from '../lab/BuildingBlocksAssembly';

// Ch1 widgets
import PromptMakeover from '../widgets/ch1/PromptMakeover';
import IterationLoop from '../widgets/ch1/IterationLoop';
import GuessThePrompt from '../widgets/ch1/GuessThePrompt';
import PromptRoast from '../widgets/ch1/PromptRoast';

// Back-content for flippable cards
import {
  BuildingBlocksBack,
  IterationBack,
  SpectrumBack,
  VaguePromptBack,
  buildingBlocksKeyFact,
  iterationKeyFact,
} from '../widgets/ch1/Ch1FlipCards';

const ACCENT = '#E94560';

export default function Ch1CardDeck() {
  return (
    <CardDeck accentColor={ACCENT} chapterSlug="ch1">
      {/* Card 1: Hero */}
      <HeroCard
        chapterNumber={1}
        title="You Already Speak AI"
        hook="One-shot prompts are parlor tricks. Iteration is the real pipeline."
        accentColor={ACCENT}
      />

      {/* Card 2: Opening narrative */}
      <TextCard accentColor={ACCENT} chapterSlug="ch1" audioIndices={[1, 2]}>
        <p style={{ marginBottom: '1.25rem' }}>
          You've been talking to AI for a while now. Maybe you've asked ChatGPT to help with homework, or used an image generator to make something weird. You've typed words into a box and gotten words back.
        </p>
        <p>
          But here's the thing: <strong>most people are terrible at this.</strong> Not because they're unintelligent — because nobody taught them how it actually works. The gap between what AI <em>can</em> do and what most people <em>get</em> from it is enormous. And that gap? It's a communication problem.
        </p>
      </TextCard>

      {/* Card 3: Building blocks explanation (text-first) → PromptMakeover widget */}
      <FlippableCard
        defaultSide="text"
        accentColor={ACCENT}
        textContent={<BuildingBlocksBack />}
        widgetContent={<PromptMakeover />}
        chapterSlug="ch1"
        audioIndices={[3, 4]}
        keyFact={buildingBlocksKeyFact}
      />

      {/* Card 5: Building blocks assembly animation */}
      <AnimationCard caption="The five building blocks assembling into a complete prompt">
        <BuildingBlocksAssembly />
      </AnimationCard>

      {/* Card 6: IterationLoop widget → iteration explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<IterationLoop />}
        textContent={<IterationBack />}
        chapterSlug="ch1"
        audioIndices={[5, 6]}
        keyFact={iterationKeyFact}
      />

      {/* Card 7: Pull quote */}
      <TextCard variant="pull-quote" accentColor={ACCENT} chapterSlug="ch1" audioIndices={[7]}>
        One-shot prompts are parlor tricks. The people who get incredible results from AI? They iterate. They refine. They treat it as a conversation, not a coin toss.
      </TextCard>

      {/* Card 8: Prompt morph animation */}
      <AnimationCard caption="Watch a vague prompt transform into a structured one">
        <PromptMorphAnimation />
      </AnimationCard>

      {/* Card 9: GuessThePrompt widget → prompt spectrum explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<GuessThePrompt />}
        textContent={<SpectrumBack />}
        chapterSlug="ch1"
        audioIndices={[8]}
      />

      {/* Card 9: PromptRoast widget → vague prompt explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<PromptRoast />}
        textContent={<VaguePromptBack />}
        chapterSlug="ch1"
        audioIndices={[9]}
      />

      {/* Card 10: Closing */}
      <ClosingCard
        summaryQuote="You don't need to memorize magic prompts. You need to develop an instinct for how specific to be — and know how to slide toward precision when the first response isn't good enough."
        nextChapterTitle="The Art of Asking"
        nextChapterHref="/ch2-cards"
        accentColor={ACCENT}
      />
    </CardDeck>
  );
}
