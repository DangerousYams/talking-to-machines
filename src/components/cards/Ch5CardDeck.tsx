import CardDeck from './CardDeck';
import HeroCard from './HeroCard';
import TextCard from './TextCard';
import AnimationCard from './AnimationCard';
import FlippableCard from './FlippableCard';
import ClosingCard from './ClosingCard';

// Lab animations
import AgentLoopCycle from '../lab/AgentLoopCycle';

// Ch5 widgets
import ToolCatalog from '../widgets/ch5/ToolCatalog';
import TrustThermometer from '../widgets/ch5/TrustThermometer';

// Back-content for flippable cards
import {
  AgentLoopBack,
  TrustBack,
  agentLoopKeyFact,
  trustKeyFact,
} from '../widgets/ch5/Ch5FlipCards';

const ACCENT = '#F5A623';

export default function Ch5CardDeck() {
  return (
    <CardDeck accentColor={ACCENT} chapterSlug="ch5">
      {/* Card 1: Hero */}
      <HeroCard
        chapterNumber={5}
        title="Give It Tools"
        hook="The leap from 'answer questions' to 'take actions.'"
        accentColor={ACCENT}
      />

      {/* Card 2: Opening narrative */}
      <TextCard accentColor={ACCENT} chapterSlug="ch5" audioIndices={[1, 2]}>
        <p style={{ marginBottom: '1.25rem' }}>
          Up until now, every AI interaction follows the same pattern. You type something. The AI types something back. Text in, text out. A really sophisticated autocomplete. But that's not the ceiling. It's just the floor.
        </p>
        <p>
          What if the AI could <em>do</em> things? Not just tell you about the weather, but check the forecast. Not just suggest code, but run it. That's tool use. And it changes everything.
        </p>
      </TextCard>

      {/* Card 3: Agent loop explanation (text-first) → ToolCatalog widget */}
      <FlippableCard
        defaultSide="text"
        accentColor={ACCENT}
        textContent={<AgentLoopBack />}
        widgetContent={<ToolCatalog />}
        chapterSlug="ch5"
        audioIndices={[3, 4]}
        keyFact={agentLoopKeyFact}
      />

      {/* Card 4: Agent loop cycle animation */}
      <AnimationCard caption="The agent loop: Observe, Think, Act, Evaluate — spinning until the goal is met">
        <AgentLoopCycle />
      </AnimationCard>

      {/* Card 5: Tool use changes everything */}
      <TextCard accentColor={ACCENT} chapterSlug="ch5" audioIndices={[5, 6]}>
        <p>
          The AI isn't executing a script. It's making a judgment call every time: "Is this a situation where I should use a tool, or can I handle it myself?" That decision — when to act and when to just respond — is what makes tool-using AI fundamentally different.
        </p>
      </TextCard>

      {/* Card 6: TrustThermometer widget → autonomy explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<TrustThermometer />}
        textContent={<TrustBack />}
        chapterSlug="ch5"
        audioIndices={[7, 8]}
        keyFact={trustKeyFact}
      />

      {/* Card 7: Pull quote */}
      <TextCard variant="pull-quote" accentColor={ACCENT} chapterSlug="ch5" audioIndices={[9]}>
        An AI with tools isn't just smarter. It's a different kind of thing entirely — one that can act, not just advise.
      </TextCard>

      {/* Card 8: Closing */}
      <ClosingCard
        summaryQuote="Tools are the building blocks. Now it's time to wire them together into something that can pursue goals on its own. It's time to build agents."
        nextChapterTitle="Building Agents"
        nextChapterHref="/ch6"
        accentColor={ACCENT}
      />
    </CardDeck>
  );
}
