import CardDeck from './CardDeck';
import HeroCard from './HeroCard';
import TextCard from './TextCard';
import AnimationCard from './AnimationCard';
import FlippableCard from './FlippableCard';
import ClosingCard from './ClosingCard';

// Lab animations
import SocraticTree from '../lab/SocraticTree';
import ChainOfThoughtSteps from '../lab/ChainOfThoughtSteps';

// Ch2 widgets
import PromptLaboratory from '../widgets/ch2/PromptLaboratory';
import FlipTheScript from '../widgets/ch2/FlipTheScript';
import DebugThePrompt from '../widgets/ch2/DebugThePrompt';

// Back-content for flippable cards
import {
  SocraticFlipBack,
  TechniqueMixBack,
  PromptBugsBack,
  socraticKeyFact,
  techniqueMixKeyFact,
} from '../widgets/ch2/Ch2FlipCards';

const ACCENT = '#0F3460';

export default function Ch2CardDeck() {
  return (
    <CardDeck accentColor={ACCENT} chapterSlug="ch2">
      {/* Card 1: Hero */}
      <HeroCard
        chapterNumber={2}
        title="The Art of Asking"
        hook="The best prompt is a question that makes the AI ask you questions."
        accentColor={ACCENT}
      />

      {/* Card 2: Opening narrative */}
      <TextCard accentColor={ACCENT} chapterSlug="ch2" audioIndices={[0, 1]}>
        <p style={{ marginBottom: '1.25rem' }}>
          In the last chapter, you learned the five building blocks of a good prompt. Role, task, format, constraints, examples. That's the vocabulary. This chapter is about <em>technique</em>.
        </p>
        <p style={{ marginBottom: '1.25rem' }}>
          The difference between someone who types a prompt and someone who <em>crafts</em> one is the same as the difference between someone who knows English words and someone who can write a compelling essay. Same tools, completely different results.
        </p>
        <p>
          Here's the secret: you don't need to be an expert on the topic. You need to be an expert at <strong>asking.</strong>
        </p>
      </TextCard>

      {/* Card 3: Socratic flip explanation (text-first) → FlipTheScript widget */}
      <FlippableCard
        defaultSide="text"
        accentColor={ACCENT}
        textContent={<SocraticFlipBack />}
        widgetContent={<FlipTheScript />}
        chapterSlug="ch2"
        audioIndices={[2, 3]}
        keyFact={socraticKeyFact}
      />

      {/* Card 4: Socratic tree animation */}
      <AnimationCard caption="A question splits into clarifying branches, each one making the final answer richer">
        <SocraticTree />
      </AnimationCard>

      {/* Card 5: Few-shot prompting explanation */}
      <TextCard accentColor={ACCENT} chapterSlug="ch2" audioIndices={[4, 5]}>
        <p style={{ marginBottom: '1.25rem' }}>
          Imagine explaining a style to a friend. You could spend five minutes describing it — "I want something casual but not sloppy, with a bit of humor but not cheesy, and keep it under 200 words." Or you could just <strong>show them an example.</strong>
        </p>
        <p style={{ marginBottom: '1.25rem' }}>
          That's <strong>few-shot prompting.</strong> Instead of describing what you want, you show the AI examples of what "good" looks like. The AI picks up on the pattern — tone, structure, length, style — without you having to spell out every detail.
        </p>
        <p>
          One example is a "one-shot" prompt. Two or three is "few-shot." Zero is "zero-shot" — you're just describing what you want and hoping the AI gets it. Sometimes zero-shot works fine. But when it doesn't? Examples are magic.
        </p>
      </TextCard>

      {/* Card 6: PromptLaboratory widget → technique mix explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<PromptLaboratory />}
        textContent={<TechniqueMixBack />}
        chapterSlug="ch2"
        audioIndices={[6, 7]}
        keyFact={techniqueMixKeyFact}
      />

      {/* Card 7: Pull quote */}
      <TextCard variant="pull-quote" accentColor={ACCENT} chapterSlug="ch2" audioIndices={[8]}>
        The difference between a good prompt and a great one isn't vocabulary. It's empathy — understanding what the AI needs to know to help you.
      </TextCard>

      {/* Card 8: DebugThePrompt widget → prompt bugs explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<DebugThePrompt />}
        textContent={<PromptBugsBack />}
        chapterSlug="ch2"
        audioIndices={[9]}
      />

      {/* Card 9: Chain-of-thought animation */}
      <AnimationCard caption="Asking for step-by-step reasoning gives the AI 'scratch paper' to think with">
        <ChainOfThoughtSteps />
      </AnimationCard>

      {/* Card 10: Closing */}
      <ClosingCard
        summaryQuote="You don't need to be an expert on the topic to get expert-level output. You need to be an expert at asking — and asking is a skill you can learn."
        nextChapterTitle="Context Engineering"
        nextChapterHref="/ch3-cards"
        accentColor={ACCENT}
      />
    </CardDeck>
  );
}
