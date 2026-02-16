import CardDeck from './CardDeck';
import HeroCard from './HeroCard';
import TextCard from './TextCard';
import AnimationCard from './AnimationCard';
import FlippableCard from './FlippableCard';
import ClosingCard from './ClosingCard';

// Lab animations
import AIConstellationMap from '../lab/AIConstellationMap';

// Ch4 widgets
import ToolWall from '../widgets/ch4/ToolWall';
import WorkflowBuilder from '../widgets/ch4/WorkflowBuilder';
import HeadToHead from '../widgets/ch4/HeadToHead';

// Back-content for flippable cards
import {
  ToolLandscapeBack,
  ChoosingToolsBack,
  PipelinesBack,
  toolLandscapeKeyFact,
  pipelinesKeyFact,
} from '../widgets/ch4/Ch4FlipCards';

const ACCENT = '#0EA5E9';

export default function Ch4CardDeck() {
  return (
    <CardDeck accentColor={ACCENT} chapterSlug="ch4">
      {/* Card 1: Hero */}
      <HeroCard
        chapterNumber={4}
        title="The AI Landscape"
        hook="A field guide to every AI tool you can actually use right now."
        accentColor={ACCENT}
      />

      {/* Card 2: Opening narrative */}
      <TextCard accentColor={ACCENT} chapterSlug="ch4" audioIndices={[1, 2]}>
        <p style={{ marginBottom: '1.25rem' }}>
          When most people say "AI," they mean ChatGPT. That's like saying "the internet" and meaning Google. It's not wrong — it's just a tiny slice of something enormous.
        </p>
        <p style={{ marginBottom: '1.25rem' }}>
          Right now there are hundreds of AI tools you can use today. Tools that generate photorealistic images, compose full songs, read every academic paper on your topic.
        </p>
        <p>
          This chapter is your field guide.
        </p>
      </TextCard>

      {/* Card 3: ToolWall widget → tool landscape explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<ToolWall />}
        textContent={<ToolLandscapeBack />}
        chapterSlug="ch4"
        audioIndices={[3, 4]}
        keyFact={toolLandscapeKeyFact}
      />

      {/* Card 4: AI constellation animation */}
      <AnimationCard caption="AI tools form constellations — clusters of capability across image, video, audio, research, and code">
        <AIConstellationMap />
      </AnimationCard>

      {/* Card 5: Choosing the right tool */}
      <TextCard accentColor={ACCENT} chapterSlug="ch4" audioIndices={[5, 6]}>
        <p style={{ marginBottom: '1.25rem' }}>
          The person who knows 10 AI tools at a surface level will consistently outperform someone who knows one tool deeply. Breadth of awareness beats depth of expertise — at first.
        </p>
        <p style={{ marginBottom: '1.25rem' }}>
          But awareness alone isn't enough. You need a framework for choosing. Every time you reach for an AI tool, ask yourself four questions:
        </p>
        <p>
          <strong>What is the output?</strong> Text, image, video, audio, or code. <strong>What is the quality bar?</strong> Quick draft or polished final. <strong>What is the budget?</strong> Free, freemium, or paid. <strong>What is the workflow?</strong> Standalone task or part of a pipeline.
        </p>
      </TextCard>

      {/* Card 6: HeadToHead widget → choosing tools explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<HeadToHead />}
        textContent={<ChoosingToolsBack />}
        chapterSlug="ch4"
        audioIndices={[7, 8]}
      />

      {/* Card 7: Pull quote */}
      <TextCard variant="pull-quote" accentColor={ACCENT} chapterSlug="ch4" audioIndices={[9]}>
        The most impressive AI-generated work you've seen online wasn't made with one tool. It was made with five, chained together by a human who understood what each one does best.
      </TextCard>

      {/* Card 8: WorkflowBuilder widget → pipelines explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<WorkflowBuilder />}
        textContent={<PipelinesBack />}
        chapterSlug="ch4"
        audioIndices={[10, 11]}
        keyFact={pipelinesKeyFact}
      />

      {/* Card 9: Closing */}
      <ClosingCard
        summaryQuote="You don't need to master every tool. You need to know the terrain well enough to pick the right one when it matters."
        nextChapterTitle="Give It Tools"
        nextChapterHref="/ch5-cards"
        accentColor={ACCENT}
      />
    </CardDeck>
  );
}
