import CardDeck from './CardDeck';
import HeroCard from './HeroCard';
import TextCard from './TextCard';
import AnimationCard from './AnimationCard';
import FlippableCard from './FlippableCard';
import ClosingCard from './ClosingCard';

// Lab animations
import HallucinationDetector from '../lab/HallucinationDetector';

// Ch9 widgets
import FactOrFabrication from '../widgets/ch9/FactOrFabrication';
import SycophancyTest from '../widgets/ch9/SycophancyTest';

// Back-content for flippable cards
import {
  HallucinationBack,
  SycophancyBack,
  hallucinationKeyFact,
  sycophancyKeyFact,
} from '../widgets/ch9/Ch9FlipCards';

const ACCENT = '#E94560';

export default function Ch9CardDeck() {
  return (
    <CardDeck accentColor={ACCENT} chapterSlug="ch9">
      {/* Card 1: Hero */}
      <HeroCard
        chapterNumber={9}
        title="When AI Gets It Wrong"
        hook="The verification habits that separate amateurs from pros."
        accentColor={ACCENT}
      />

      {/* Card 2: Opening narrative */}
      <TextCard accentColor={ACCENT} chapterSlug="ch9" audioIndices={[1, 2]}>
        <p style={{ marginBottom: '1.25rem' }}>
          Here's something uncomfortable: the AI that just helped you write a flawless essay can also, with equal confidence, tell you that Napoleon won the Battle of Waterloo. It won't hesitate. It won't stammer. It will state a completely fabricated "fact" in the same authoritative tone it uses for everything else.
        </p>
        <p>
          This is the paradox at the heart of working with AI: the same fluency that makes it useful makes it dangerous. AI doesn't know what's true. It knows what <em>sounds</em> true.
        </p>
      </TextCard>

      {/* Card 3: Hallucination explanation (text-first) → FactOrFabrication widget */}
      <FlippableCard
        defaultSide="text"
        accentColor={ACCENT}
        textContent={<HallucinationBack />}
        widgetContent={<FactOrFabrication />}
        chapterSlug="ch9"
        audioIndices={[3, 4]}
        keyFact={hallucinationKeyFact}
      />

      {/* Card 4: Hallucination detector animation */}
      <AnimationCard caption="AI text streams out, then a scanner reveals which statements are fabricated — they look identical to the real ones">
        <HallucinationDetector />
      </AnimationCard>

      {/* Card 5: Confidence vs accuracy */}
      <TextCard accentColor={ACCENT} chapterSlug="ch9" audioIndices={[5, 6]}>
        <p>
          There is no correlation between how confident AI sounds and how accurate it actually is. A wrong answer and a right answer look identical from the outside. That's what makes this so tricky — you can't tell from the tone.
        </p>
      </TextCard>

      {/* Card 6: SycophancyTest widget → sycophancy explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<SycophancyTest />}
        textContent={<SycophancyBack />}
        chapterSlug="ch9"
        audioIndices={[7, 8]}
        keyFact={sycophancyKeyFact}
      />

      {/* Card 7: Pull quote */}
      <TextCard variant="pull-quote" accentColor={ACCENT} chapterSlug="ch9" audioIndices={[9]}>
        The best AI users aren't the ones who trust AI the most. They're the ones who verify the fastest.
      </TextCard>

      {/* Card 8: Closing */}
      <ClosingCard
        summaryQuote="This isn't about doubting AI. It's about using it well. Trust, but verify — and build the habits that make verification automatic."
        nextChapterTitle="The Human Edge"
        nextChapterHref="/ch10-cards"
        accentColor={ACCENT}
      />
    </CardDeck>
  );
}
