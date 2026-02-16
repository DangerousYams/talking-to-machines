import CardDeck from './CardDeck';
import HeroCard from './HeroCard';
import TextCard from './TextCard';
import AnimationCard from './AnimationCard';
import FlippableCard from './FlippableCard';
import ClosingCard from './ClosingCard';

// Lab animations
import HumanAISpectrum from '../lab/HumanAISpectrum';

// Ch10 widgets
import SkillsSpectrum from '../widgets/ch10/SkillsSpectrum';
import JobTransformer from '../widgets/ch10/JobTransformer';
import TasteTest from '../widgets/ch10/TasteTest';
import FirstPrinciplesLab from '../widgets/ch10/FirstPrinciplesLab';

// Back-content for flippable cards
import {
  SpectrumBack,
  JobShiftBack,
  TasteBack,
  FirstPrinciplesBack,
  spectrumKeyFact,
  jobShiftKeyFact,
} from '../widgets/ch10/Ch10FlipCards';

const ACCENT = '#16C79A';

export default function Ch10CardDeck() {
  return (
    <CardDeck accentColor={ACCENT} chapterSlug="ch10">
      {/* Card 1: Hero */}
      <HeroCard
        chapterNumber={10}
        title="The Human Edge"
        hook="What AI can't replace — and what it makes 10x easier."
        accentColor={ACCENT}
      />

      {/* Card 2: Opening narrative */}
      <TextCard accentColor={ACCENT} chapterSlug="ch10" audioIndices={[1, 2]}>
        <p style={{ marginBottom: '1.25rem' }}>
          Every time a new AI capability drops, the same headline appears: "Will AI replace [insert job]?" It's the wrong question. The right one is: "What does this make possible that wasn't possible before?"
        </p>
        <p>
          AI doesn't replace humans. It replaces <em>tasks.</em> And when you zoom in on any job, you find a mix: some tasks AI handles brilliantly, some it assists with, and some that remain stubbornly, beautifully human.
        </p>
      </TextCard>

      {/* Card 3: SkillsSpectrum widget → spectrum explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<SkillsSpectrum />}
        textContent={<SpectrumBack />}
        chapterSlug="ch10"
        audioIndices={[3, 4]}
        keyFact={spectrumKeyFact}
      />

      {/* Card 4: Human-AI spectrum animation */}
      <AnimationCard caption="Skills slide along a spectrum — the most interesting zone is the middle, where humans and AI collaborate">
        <HumanAISpectrum />
      </AnimationCard>

      {/* Card 5: Taste and first principles narrative */}
      <TextCard accentColor={ACCENT} chapterSlug="ch10" audioIndices={[5, 6]}>
        <p style={{ marginBottom: '1.25rem' }}>
          In a world where generating options is nearly free, the ability to choose the right one becomes the most valuable skill you can have. That ability has a name: <strong>taste.</strong>
        </p>
        <p>
          AI remixes what exists. First principles thinking reasons from ground truth. Your knowledge is your BS detector.
        </p>
      </TextCard>

      {/* Card 6: JobTransformer widget → job shift explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<JobTransformer />}
        textContent={<JobShiftBack />}
        chapterSlug="ch10"
        audioIndices={[7, 8]}
        keyFact={jobShiftKeyFact}
      />

      {/* Card 7: Pull quote */}
      <TextCard variant="pull-quote" accentColor={ACCENT} chapterSlug="ch10" audioIndices={[9]}>
        It's not "humans vs. AI." It's humans with AI vs. humans without AI.
      </TextCard>

      {/* Card 8: TasteTest widget → taste explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<TasteTest />}
        textContent={<TasteBack />}
        chapterSlug="ch10"
        audioIndices={[10, 11]}
      />

      {/* Card 9: FirstPrinciplesLab widget → first principles explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<FirstPrinciplesLab />}
        textContent={<FirstPrinciplesBack />}
        chapterSlug="ch10"
        audioIndices={[12, 13]}
      />

      {/* Card 10: Closing */}
      <ClosingCard
        summaryQuote="AI doesn't diminish your value. It clarifies it. The things only you can do become sharper, more visible, more important."
        nextChapterTitle="Build Something Real"
        nextChapterHref="/ch11"
        accentColor={ACCENT}
      />
    </CardDeck>
  );
}
