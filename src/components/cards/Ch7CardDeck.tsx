import CardDeck from './CardDeck';
import HeroCard from './HeroCard';
import TextCard from './TextCard';
import AnimationCard from './AnimationCard';
import FlippableCard from './FlippableCard';
import ClosingCard from './ClosingCard';

// Lab animations
import TerminalFlow from '../lab/TerminalFlow';
import DecompositionTree from '../lab/DecompositionTree';

// Ch7 widgets
import TerminalPlayground from '../widgets/ch7/TerminalPlayground';
import SkillBuilder from '../widgets/ch7/SkillBuilder';
import RefactorRace from '../widgets/ch7/RefactorRace';

// Back-content for flippable cards
import {
  ClaudeCodeBack,
  SkillsBack,
  SkillParadoxBack,
  claudeCodeKeyFact,
  skillsKeyFact,
} from '../widgets/ch7/Ch7FlipCards';

const ACCENT = '#7B61FF';

export default function Ch7CardDeck() {
  return (
    <CardDeck accentColor={ACCENT} chapterSlug="ch7">
      {/* Card 1: Hero */}
      <HeroCard
        chapterNumber={7}
        title="Mastering Claude Code"
        hook="Your AI pair programmer, from first command to custom Skills."
        accentColor={ACCENT}
      />

      {/* Card 2: Opening narrative */}
      <TextCard accentColor={ACCENT} chapterSlug="ch7" audioIndices={[1, 2]}>
        <p style={{ marginBottom: '1.25rem' }}>
          There's a moment every coder remembers. You open a terminal, type a natural-language request, and watch an AI read your files, understand your architecture, write code across multiple files, run it, hit an error, fix the error, and run it again — all without you touching a single line. That's Claude Code.
        </p>
        <p>
          It's not autocomplete. It's not a chatbot that writes snippets. Claude Code is an agentic coding tool — a command-line partner that can see your entire project.
        </p>
      </TextCard>

      {/* Card 3: Claude Code explanation (text-first) → TerminalPlayground widget */}
      <FlippableCard
        defaultSide="text"
        accentColor={ACCENT}
        textContent={<ClaudeCodeBack />}
        widgetContent={<TerminalPlayground />}
        chapterSlug="ch7"
        audioIndices={[3, 4]}
        keyFact={claudeCodeKeyFact}
      />

      {/* Card 4: Terminal flow animation */}
      <AnimationCard caption="A Claude Code session: specify, generate, verify, fix, verify — the core loop in action">
        <TerminalFlow />
      </AnimationCard>

      {/* Card 5: Skills explanation */}
      <TextCard accentColor={ACCENT} chapterSlug="ch7" audioIndices={[5, 6]}>
        <p style={{ marginBottom: '1.25rem' }}>
          Without skills, you explain the same steps every time. With skills, you explain once and the AI remembers forever.
        </p>
        <p>
          A skill has three parts: <strong>Trigger</strong> (when to activate), <strong>Steps</strong> (what to do), and <strong>Examples</strong> (what good output looks like).
        </p>
      </TextCard>

      {/* Card 6: SkillBuilder widget → skills explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<SkillBuilder />}
        textContent={<SkillsBack />}
        chapterSlug="ch7"
        audioIndices={[7, 8]}
        keyFact={skillsKeyFact}
      />

      {/* Card 7: Pull quote */}
      <TextCard variant="pull-quote" accentColor={ACCENT} chapterSlug="ch7" audioIndices={[9]}>
        If you can't read the code Claude generates, you can't verify it. If you can't verify it, you're shipping someone else's guesses into production.
      </TextCard>

      {/* Card 8: RefactorRace widget → skill paradox explanation */}
      <FlippableCard
        defaultSide="widget"
        accentColor={ACCENT}
        widgetContent={<RefactorRace />}
        textContent={<SkillParadoxBack />}
        chapterSlug="ch7"
        audioIndices={[10, 11]}
      />

      {/* Card 9: Decomposition tree animation */}
      <AnimationCard caption="Complex tasks decompose into a tree of focused subtasks — each one small enough for a single conversation">
        <DecompositionTree />
      </AnimationCard>

      {/* Card 10: Closing */}
      <ClosingCard
        summaryQuote="The best coders in the AI era won't be the fastest typists. They'll be the clearest thinkers."
        nextChapterTitle="Orchestrating Complexity"
        nextChapterHref="/ch8-cards"
        accentColor={ACCENT}
      />
    </CardDeck>
  );
}
