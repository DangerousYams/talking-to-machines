import CardDeck from './CardDeck';
import HeroCard from './HeroCard';
import TextCard from './TextCard';
import FlippableCard from './FlippableCard';
import ClosingCard from './ClosingCard';

// Ch11 widgets
import ProjectPlanner from '../widgets/ch11/ProjectPlanner';
import ShowcaseGallery from '../widgets/ch11/ShowcaseGallery';

// Back-content for flippable cards
import {
  ProjectPlanningBack,
  ShippingBack,
  projectPlanningKeyFact,
} from '../widgets/ch11/Ch11FlipCards';

const ACCENT = '#16C79A';

export default function Ch11CardDeck() {
  return (
    <CardDeck accentColor={ACCENT} chapterSlug="ch11">
      {/* Card 1: Hero */}
      <HeroCard
        chapterNumber={11}
        title="Build Something Real"
        hook="Your capstone project."
        accentColor={ACCENT}
      />

      {/* Card 2: Opening narrative */}
      <TextCard accentColor={ACCENT} chapterSlug="ch11" audioIndices={[1, 2]}>
        <p style={{ marginBottom: '1.25rem' }}>
          You've made it to the final chapter. Over the last ten chapters, you went from "help me with my essay" to building agents, debugging hallucinations, and thinking about the future of work. You've learned more about AI than most adults know.
        </p>
        <p>
          But here's the uncomfortable truth: <strong>none of it matters until you build something.</strong> Reading about AI is like reading about swimming. You can study buoyancy, watch Olympic races, memorize every stroke. But until you get in the water, you don't know any of it.
        </p>
      </TextCard>

      {/* Card 3: Recap + transition to building */}
      <TextCard accentColor={ACCENT} chapterSlug="ch11" audioIndices={[3, 4]}>
        <p style={{ marginBottom: '1.25rem' }}>
          This chapter is about jumping in. Not with a toy exercise or a follow-along tutorial. A real project. Something you choose, something you care about, something you can show to someone and say: <em>"I built this."</em>
        </p>
        <p>
          Think about what you've learned: the five building blocks of prompts, advanced techniques like few-shot and chain-of-thought, context engineering, the full AI tools landscape, giving AI tools, building agents, mastering Claude Code, orchestrating complex projects, verifying AI output, and the irreplaceable human edge. That's not a list of chapters. That's a toolkit. <strong>Now use it.</strong>
        </p>
      </TextCard>

      {/* Card 4: ProjectPlanner widget → planning explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<ProjectPlanner />}
        textContent={<ProjectPlanningBack />}
        chapterSlug="ch11"
        audioIndices={[5, 6]}
        keyFact={projectPlanningKeyFact}
      />

      {/* Card 5: The 3-Week Sprint */}
      <TextCard accentColor={ACCENT} chapterSlug="ch11" audioIndices={[7, 8]}>
        <p style={{ marginBottom: '1.25rem' }}>
          <strong>The 3-Week Sprint:</strong> Week 1 is <em>Ideate & Scope</em> — choose your track, define what "done" looks like, and break the project into pieces. Week 2 is <em>Build</em> — heads down, making the thing, using every technique from this curriculum. Week 3 is <em>Polish & Present</em> — fix the rough edges, write up what you learned, and share it.
        </p>
        <p>
          The best projects don't start with a prompt. They start with a plan on paper. What are you building? Who is it for? What does "done" look like? Answer those first. Then open the AI.
        </p>
      </TextCard>

      {/* Card 6: ShowcaseGallery widget → shipping explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<ShowcaseGallery />}
        textContent={<ShippingBack />}
        chapterSlug="ch11"
        audioIndices={[9, 10]}
      />

      {/* Card 7: Pull quote */}
      <TextCard variant="pull-quote" accentColor={ACCENT} chapterSlug="ch11" audioIndices={[11]}>
        AI is the most powerful tool your generation has ever had access to. But tools don't build things. People with tools build things.
      </TextCard>

      {/* Card 8: Closing */}
      <ClosingCard
        summaryQuote="The people who will shape the next decade aren't waiting for permission. They're building. Right now. And now you have everything you need to be one of them."
        nextChapterTitle="Back to Home"
        nextChapterHref="/"
        accentColor={ACCENT}
      />
    </CardDeck>
  );
}
