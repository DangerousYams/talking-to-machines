import CardDeck from './CardDeck';
import HeroCard from './HeroCard';
import TextCard from './TextCard';
import AnimationCard from './AnimationCard';
import FlippableCard from './FlippableCard';
import ClosingCard from './ClosingCard';

// Lab animations
import MultiAgentHandoff from '../lab/MultiAgentHandoff';

// Ch6 widgets
import AgentBlueprint from '../widgets/ch6/AgentBlueprint';
import FailureModesLab from '../widgets/ch6/FailureModesLab';
import HandoffChain from '../widgets/ch6/HandoffChain';

// Back-content for flippable cards
import {
  AgentArchitectureBack,
  FailureModesBack,
  MultiAgentBack,
  agentArchitectureKeyFact,
  multiAgentKeyFact,
} from '../widgets/ch6/Ch6FlipCards';

const ACCENT = '#E94560';

export default function Ch6CardDeck() {
  return (
    <CardDeck accentColor={ACCENT} chapterSlug="ch6">
      {/* Card 1: Hero */}
      <HeroCard
        chapterNumber={6}
        title="Building Agents"
        hook="Design, wire, and deploy an AI agent from scratch."
        accentColor={ACCENT}
      />

      {/* Card 2: Opening narrative */}
      <TextCard accentColor={ACCENT} chapterSlug="ch6" audioIndices={[1, 2]}>
        <p style={{ marginBottom: '1.25rem' }}>
          A chatbot waits for you to speak. An agent doesn't. Give it a goal — "research Mars colonization and write a report" — and it breaks the work into steps, picks the right tools, executes them one by one, checks its own results, and keeps going until the job is done.
        </p>
        <p>
          That distinction — between responding to instructions and pursuing a goal — is the difference between a calculator and a coworker. Chatbots answer questions. Agents solve problems.
        </p>
      </TextCard>

      {/* Card 3: Agent architecture (text-first) -> AgentBlueprint widget */}
      <FlippableCard
        defaultSide="text"
        accentColor={ACCENT}
        textContent={<AgentArchitectureBack />}
        widgetContent={<AgentBlueprint />}
        chapterSlug="ch6"
        audioIndices={[3, 4]}
        keyFact={agentArchitectureKeyFact}
      />

      {/* Card 4: Failure modes narrative */}
      <TextCard accentColor={ACCENT} chapterSlug="ch6" audioIndices={[5, 6]}>
        <p style={{ marginBottom: '1.25rem' }}>
          Most agent failures aren't intelligence failures — they're architecture failures. An agent with great language skills but no evaluator is like a brilliant person who never checks their work.
        </p>
        <p>
          The three failure modes you'll see over and over: the <strong>infinite loop</strong> (agent keeps researching, never writes), the <strong>wrong tool</strong> (agent tries to "search" for a local file), and the <strong>hallucinated action</strong> (agent "calls" an API that doesn't exist).
        </p>
      </TextCard>

      {/* Card 5: FailureModesLab widget -> failure modes explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<FailureModesLab />}
        textContent={<FailureModesBack />}
        chapterSlug="ch6"
        audioIndices={[7, 8]}
      />

      {/* Card 6: Pull quote */}
      <TextCard variant="pull-quote" accentColor={ACCENT} chapterSlug="ch6" audioIndices={[9]}>
        A chatbot is a single turn. An agent is a whole conversation — with itself, its tools, and the world.
      </TextCard>

      {/* Card 7: HandoffChain widget -> multi-agent explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<HandoffChain />}
        textContent={<MultiAgentBack />}
        chapterSlug="ch6"
        audioIndices={[10, 11]}
        keyFact={multiAgentKeyFact}
      />

      {/* Card 8: Multi-agent handoff animation */}
      <AnimationCard caption="Three specialist agents — Researcher, Writer, Editor — pass work through a pipeline">
        <MultiAgentHandoff />
      </AnimationCard>

      {/* Card 9: Closing */}
      <ClosingCard
        summaryQuote="An agent is only as good as its architecture. The smartest AI in the world, deployed without guardrails, is just a fast way to make expensive mistakes."
        nextChapterTitle="Mastering Claude Code"
        nextChapterHref="/ch7-cards"
        accentColor={ACCENT}
      />
    </CardDeck>
  );
}
