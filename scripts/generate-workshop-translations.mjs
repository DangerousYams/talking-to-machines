#!/usr/bin/env node
/**
 * One-shot helper: generates src/pages/{locale}/workshop.astro for all
 * non-English locales from a shared template + per-language translation dicts.
 *
 * Run once: `node scripts/generate-workshop-translations.mjs`
 *
 * If you need to re-translate, edit the dicts below or delete this script.
 * The source of truth for locale-specific widget strings lives at
 * src/i18n/translations/{locale}/workshop.ts and is independent of this file.
 */

import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Template — every field below is interpolated into this astro shell.
const template = (L, t) => `---
export const prerender = true;
import InterludeLayout from '../../layouts/InterludeLayout.astro';
import FadeInBlock from '../../components/scroll/FadeInBlock';
import Divider from '../../components/ui/Divider';
import UltimatePromptBuilder from '../../components/widgets/workshop/UltimatePromptBuilder';
---

<InterludeLayout
  title=${JSON.stringify(t.title)}
  description=${JSON.stringify(t.description)}
  accent="#16C79A"
  slug="workshop"
  locale="${L}"
>

  <section class="max-w-[680px]" style="margin: 0 auto; padding: 3rem 1.5rem 2rem; text-align: center;">
    <FadeInBlock client:visible>
      <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 1.5rem;">
        {['#E94560', '#7B61FF', '#0F3460', '#16C79A'].map((c) => (
          <div style={\`width: 7px; height: 7px; border-radius: 50%; background: \${c}; opacity: 0.55;\`}></div>
        ))}
      </div>
    </FadeInBlock>

    <FadeInBlock client:visible delay={0.1}>
      <p style="font-family: 'Caveat', cursive; font-size: 1.3rem; font-weight: 600; color: #16C79A; margin: 0 0 0.25rem; transform: rotate(-2deg); display: inline-block;">
        ${t.betweenChapters}
      </p>
    </FadeInBlock>

    <FadeInBlock client:visible delay={0.15}>
      <h1 style="font-family: var(--font-heading); font-size: clamp(2.5rem, 8vw, 3.5rem); font-weight: 800; color: var(--color-deep); margin: 0 0 0.75rem; line-height: 1.08; letter-spacing: -0.03em;">
        ${t.title}
      </h1>
    </FadeInBlock>

    <FadeInBlock client:visible delay={0.2}>
      <p style="font-family: var(--font-body); font-size: 1.1rem; color: var(--color-subtle); margin: 0; line-height: 1.6; max-width: 440px; margin-left: auto; margin-right: auto; font-style: italic;">
        ${t.heroSubtitle}
      </p>
    </FadeInBlock>
  </section>

  <section class="max-w-[680px]" style="margin: 0 auto; padding: 2rem 1.5rem 1rem;">
    <FadeInBlock client:visible>
      <h2 style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 800; color: var(--color-deep); margin: 0 0 1.25rem; letter-spacing: -0.02em;">
        ${t.section1Heading}
      </h2>
    </FadeInBlock>

    <FadeInBlock client:visible delay={0.1}>
      <p style="font-family: var(--font-body); font-size: 1.05rem; line-height: 1.85; color: var(--color-deep); margin: 0 0 1.25rem;">
        ${t.section1Para1}
      </p>
    </FadeInBlock>

    <FadeInBlock client:visible delay={0.15}>
      <p style="font-family: var(--font-body); font-size: 1.05rem; line-height: 1.85; color: var(--color-deep); margin: 0 0 1.25rem;">
        ${t.section1Para2}
      </p>
    </FadeInBlock>

    <FadeInBlock client:visible delay={0.25}>
      <p style="font-family: var(--font-body); font-size: 1.2rem; line-height: 1.7; color: var(--color-deep); margin: 1.5rem 0 0; font-style: italic; text-align: center; padding: 1.5rem 0; border-top: 1px solid rgba(22,199,154,0.25); border-bottom: 1px solid rgba(22,199,154,0.25);">
        ${t.pullQuote1}
      </p>
    </FadeInBlock>
  </section>

  <div style="max-width: 680px; margin: 3rem auto; padding: 0 1.5rem;">
    <Divider accent="#16C79A" client:load />
  </div>

  <section class="max-w-[680px]" style="margin: 0 auto; padding: 1rem 1.5rem;">
    <FadeInBlock client:visible>
      <h2 style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 800; color: var(--color-deep); margin: 0 0 1.25rem; letter-spacing: -0.02em;">
        ${t.section2Heading}
      </h2>
    </FadeInBlock>

    <FadeInBlock client:visible delay={0.1}>
      <p style="font-family: var(--font-body); font-size: 1.05rem; line-height: 1.85; color: var(--color-deep); margin: 0 0 1.5rem;">
        ${t.section2Intro}
      </p>
    </FadeInBlock>

    <FadeInBlock client:visible delay={0.15}>
      <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
        <div style="display: flex; gap: 14px; align-items: flex-start;">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: #E94560; margin-top: 10px; flex-shrink: 0;"></span>
          <p style="font-family: var(--font-body); font-size: 1rem; line-height: 1.7; margin: 0; color: var(--color-deep);">
            ${t.bullet1Html} <span style="color: var(--color-subtle); font-style: italic; font-size: 0.88rem;">(${t.chLabel}1)</span>
          </p>
        </div>
        <div style="display: flex; gap: 14px; align-items: flex-start;">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: #0F3460; margin-top: 10px; flex-shrink: 0;"></span>
          <p style="font-family: var(--font-body); font-size: 1rem; line-height: 1.7; margin: 0; color: var(--color-deep);">
            ${t.bullet2Html} <span style="color: var(--color-subtle); font-style: italic; font-size: 0.88rem;">(${t.chLabel}2)</span>
          </p>
        </div>
        <div style="display: flex; gap: 14px; align-items: flex-start;">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: #7B61FF; margin-top: 10px; flex-shrink: 0;"></span>
          <p style="font-family: var(--font-body); font-size: 1rem; line-height: 1.7; margin: 0; color: var(--color-deep);">
            ${t.bullet3Html} <span style="color: var(--color-subtle); font-style: italic; font-size: 0.88rem;">(${t.chLabel}3)</span>
          </p>
        </div>
        <div style="display: flex; gap: 14px; align-items: flex-start;">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: #16C79A; margin-top: 10px; flex-shrink: 0;"></span>
          <p style="font-family: var(--font-body); font-size: 1rem; line-height: 1.7; margin: 0; color: var(--color-deep);">
            ${t.bullet4Html} <span style="color: var(--color-subtle); font-style: italic; font-size: 0.88rem;">(${t.moreInMoment})</span>
          </p>
        </div>
        <div style="display: flex; gap: 14px; align-items: flex-start;">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--color-subtle); margin-top: 10px; flex-shrink: 0;"></span>
          <p style="font-family: var(--font-body); font-size: 1rem; line-height: 1.7; margin: 0; color: var(--color-deep);">
            ${t.bullet5Html}
          </p>
        </div>
      </div>
    </FadeInBlock>

    <FadeInBlock client:visible delay={0.2}>
      <p style="font-family: var(--font-body); font-size: 1.05rem; line-height: 1.85; color: var(--color-deep); margin: 0;">
        ${t.section2Closing}
      </p>
    </FadeInBlock>
  </section>

  <div style="max-width: 680px; margin: 3rem auto; padding: 0 1.5rem;">
    <Divider accent="#16C79A" client:load />
  </div>

  <section class="max-w-[680px]" style="margin: 0 auto; padding: 1rem 1.5rem;">
    <FadeInBlock client:visible>
      <p style="font-family: 'Caveat', cursive; font-size: 1.15rem; font-weight: 600; color: #16C79A; margin: 0 0 0.25rem; transform: rotate(-1.5deg); display: inline-block;">
        ${t.oneMoreMove}
      </p>
    </FadeInBlock>

    <FadeInBlock client:visible delay={0.05}>
      <h2 style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 800; color: var(--color-deep); margin: 0 0 1.25rem; letter-spacing: -0.02em;">
        ${t.section3Heading}
      </h2>
    </FadeInBlock>

    <FadeInBlock client:visible delay={0.1}>
      <p style="font-family: var(--font-body); font-size: 1.05rem; line-height: 1.85; color: var(--color-deep); margin: 0 0 1.25rem;">
        ${t.section3Para1}
      </p>
    </FadeInBlock>

    <FadeInBlock client:visible delay={0.15}>
      <p style="font-family: var(--font-body); font-size: 1.05rem; line-height: 1.85; color: var(--color-deep); margin: 0 0 1.25rem;">
        ${t.section3Para2}
      </p>
    </FadeInBlock>

    <FadeInBlock client:visible delay={0.2}>
      <p style="font-family: var(--font-body); font-size: 1.05rem; line-height: 1.85; color: var(--color-deep); margin: 0 0 1.25rem;">
        ${t.section3Para3}
      </p>
    </FadeInBlock>

    <FadeInBlock client:visible delay={0.25}>
      <p style="font-family: var(--font-body); font-size: 1.05rem; line-height: 1.85; color: var(--color-deep); margin: 0 0 1rem;">
        ${t.section3Para4}
      </p>
    </FadeInBlock>

    <FadeInBlock client:visible delay={0.3}>
      <p style="font-family: var(--font-body); font-size: 1.1rem; line-height: 1.7; color: var(--color-deep); margin: 2rem 0 0; font-style: italic; text-align: center; padding: 1.5rem 0; border-top: 1px solid rgba(22,199,154,0.25); border-bottom: 1px solid rgba(22,199,154,0.25);">
        ${t.pullQuote2}
      </p>
    </FadeInBlock>
  </section>

  <div style="max-width: 680px; margin: 3.5rem auto 2rem; padding: 0 1.5rem;">
    <Divider accent="#16C79A" client:load />
  </div>

  <section class="max-w-[680px]" style="margin: 0 auto; padding: 1rem 1.5rem 2rem; text-align: center;">
    <FadeInBlock client:visible>
      <p style="font-family: 'Caveat', cursive; font-size: 1.2rem; font-weight: 600; color: #16C79A; margin: 0 0 0.25rem; transform: rotate(-1.5deg); display: inline-block;">
        ${t.yourTurn}
      </p>
    </FadeInBlock>

    <FadeInBlock client:visible delay={0.05}>
      <h2 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; color: var(--color-deep); margin: 0 0 1rem; letter-spacing: -0.02em;">
        ${t.widgetHeading}
      </h2>
    </FadeInBlock>

    <FadeInBlock client:visible delay={0.1}>
      <p style="font-family: var(--font-body); font-size: 1rem; line-height: 1.7; color: var(--color-subtle); margin: 0 auto; max-width: 520px;">
        ${t.widgetSubtitle}
      </p>
    </FadeInBlock>
  </section>

  <section style="margin: 1.5rem auto 3rem; min-height: 620px;">
    <UltimatePromptBuilder client:only="react" />
  </section>

  <section class="no-print" style="max-width: 720px; margin: 0 auto; padding: 1.5rem 1.5rem 4rem;">
    <FadeInBlock client:visible>
      <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
        <a
          href="/${L}/ch3"
          style="display: inline-flex; align-items: center; gap: 8px; padding: 11px 22px; border-radius: 100px; font-family: var(--font-mono); font-size: 0.78rem; font-weight: 600; letter-spacing: 0.04em; cursor: pointer; transition: all 0.3s; text-decoration: none; border: 1px solid rgba(26,26,46,0.12); background: transparent; color: var(--color-deep); min-height: 44px;"
        >
          &larr; ${t.chapterLabel} 3
        </a>

        <a
          href="/${L}/ch4"
          style="display: inline-flex; align-items: center; gap: 8px; padding: 11px 22px; border-radius: 100px; font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em; cursor: pointer; transition: all 0.3s; text-decoration: none; border: none; background: #16C79A; color: white; min-height: 44px;"
        >
          ${t.chapterLabel} 4 &rarr;
        </a>
      </div>
    </FadeInBlock>
  </section>

</InterludeLayout>
`;

// ─── Translation dictionaries ───
// Each locale provides the same set of keys. The template handles everything else.
const LOCALES = {
  hi: {
    title: 'The Workshop',
    description: "Prompting के बारे में तुमने जो सीखा है, सब एक conversation में। The synthesis।",
    betweenChapters: 'Chapters 3 और 4 के बीच',
    heroSubtitle: 'तुमने जो सीखा है, एक conversation दूर।',
    section1Heading: 'One-shotting बंद करो।',
    section1Para1: 'इस point तक तुम्हारे पास एक toolkit है: building blocks, Socratic method, context engineering, system prompts, tokens।',
    section1Para2: "Practice में, अच्छे results कभी-कभार ही single prompt से आते हैं। जो लोग AI से सबसे ज़्यादा निकालते हैं वो इसे एक collaborator की तरह treat करते हैं। तुम एक goal share करते हो, model एक swing लेता है, तुम push back करते हो, वो rewrite करता है, तुम context add करते हो, वो फिर try करता है। चार या पाँच rounds के बाद, answer land करना शुरू हो जाता है।",
    pullQuote1: 'Prompting एक conversation है।',
    section2Heading: 'हर technique एक move है।',
    section2Intro: "Conversation के अंदर, तुमने जो भी technique सीखी है वो एक move बन जाती है जो तुम कर सकते हो:",
    chLabel: 'Ch',
    bullet1Html: '<strong>पाँच building blocks</strong> से open करो: Role, Task, Format, Constraints, Examples।',
    bullet2Html: "जब तुम्हारा goal fuzzy हो, AI को building शुरू करने से पहले तुम्हारा interview करने दो। वो है <strong>Socratic move</strong>।",
    bullet3Html: 'जब stakes ज़्यादा हों, <strong>context को carefully pack करो</strong>, और उतना ही सोचो कि क्या leave out करना है जितना कि क्या keep in करना है।',
    bullet4Html: 'जब problem को reasoning चाहिए, model को <strong>step by step सोचने</strong> को कहो।',
    moreInMoment: 'इस पर थोड़ी देर में और',
    bullet5Html: "जब first draft सही न हो, <strong>iterate करो</strong>। कोई भी पहले try में nail नहीं करता, including professionals।",
    section2Closing: 'ये सारे moves वही काम करते हैं: वो तुम्हें एक ऐसी conversation set up करने में help करते हैं जिसमें AI actually useful हो सके।',
    oneMoreMove: 'एक और move',
    section3Heading: 'Chain of thought, थोड़े में।',
    section3Para1: "एक famous prompting trick है जिसे chain of thought कहते हैं। तुम अपने prompt में \"think step by step\" phrase add करते हो, और hard problems पर model की accuracy में noticeable jump आता है। Model smarter नहीं हुआ। बस उसके पास अब scratch paper है, और वो उसे use कर रहा है।",
    section3Para2: 'Trick इतनी अच्छी तरह work करी कि researchers ने इसे automate कर दिया। जिन reasoning models के बारे में तुमने probably सुना है (Claude के Extended Thinking, OpenAI के o-series, DeepSeek R1) वो basically chain of thought हैं जो सीधे model में built हैं। वो answer देने से पहले step by step सोचते हैं, बिना तुम्हें पूछे।',
    section3Para3: 'जो एक अच्छा question raise करता है। अगर model पहले से अपने आप reason कर रहा है, तो insan अभी भी table पर क्या लाता है?',
    section3Para4: 'Conversation। Chain of thought ने prove किया कि ज़्यादा thinking से बेहतर answers बनते हैं। वही rule एक level ऊपर भी holds करता है: ज़्यादा back-and-forth turns से और भी बेहतर बनते हैं। अपने आप reason करने वाला model useful है। तुम्हारे साथ reason करने वाला model usually वहाँ है जहाँ real quality आती है।',
    pullQuote2: 'नीचे का workshop उसी को practice करने की जगह है।',
    yourTurn: 'तुम्हारी बारी',
    widgetHeading: 'The Ultimate Prompt Builder।',
    widgetSubtitle: "बाईं तरफ एक recipe चुनो, जो moves use करना चाहते हो उन्हें on करो, और AI के साथ turn by turn work करो जब तक result से happy न हो जाओ।",
    chapterLabel: 'Chapter',
  },
  fr: {
    title: 'Le Workshop',
    description: "Tout ce que tu as appris sur le prompting, en une seule conversation. La synthèse.",
    betweenChapters: 'Entre les chapitres 3 et 4',
    heroSubtitle: "Tout ce que tu as appris, à une conversation de distance.",
    section1Heading: 'Arrête de tirer un seul coup.',
    section1Para1: "À ce stade, tu disposes d'une boîte à outils : les blocs de construction, la méthode socratique, l'ingénierie de contexte, les system prompts, les tokens.",
    section1Para2: "En pratique, les bons résultats ne viennent presque jamais d'un seul prompt. Les gens qui tirent le plus de l'IA la traitent comme un collaborateur. Tu partages un objectif, le modèle tente un coup, tu le pousses, il réécrit, tu ajoutes du contexte, il réessaie. Après quatre ou cinq rounds, la réponse commence à atterrir.",
    pullQuote1: 'Prompter, c\'est une conversation.',
    section2Heading: 'Chaque technique est un mouvement.',
    section2Intro: "À l'intérieur d'une conversation, chaque technique que tu as apprise devient un mouvement que tu peux faire :",
    chLabel: 'Ch',
    bullet1Html: 'Ouvre avec les <strong>cinq blocs de construction</strong> : Rôle, Tâche, Format, Contraintes, Exemples.',
    bullet2Html: "Quand ton objectif est flou, fais en sorte que l'IA t'interviewe avant de commencer à construire. C'est le <strong>mouvement socratique</strong>.",
    bullet3Html: "Quand les enjeux sont élevés, <strong>prépare le contexte</strong> avec soin, et réfléchis autant à ce qu'il faut laisser de côté qu'à ce qu'il faut garder.",
    bullet4Html: "Quand le problème demande du raisonnement, dis au modèle de <strong>penser étape par étape</strong>.",
    moreInMoment: 'on en reparle dans un instant',
    bullet5Html: "Quand le premier brouillon ne va pas, <strong>itère</strong>. Personne ne réussit du premier coup, même les professionnels.",
    section2Closing: "Tous ces mouvements font le même travail : ils t'aident à mettre en place une conversation dans laquelle l'IA peut réellement être utile.",
    oneMoreMove: 'Un mouvement de plus',
    section3Heading: 'Chain of thought, en bref.',
    section3Para1: "Il y a un fameux truc de prompting appelé chain of thought. Tu ajoutes la phrase « pense étape par étape » à ton prompt, et la précision du modèle sur les problèmes difficiles fait un bond notable. Le modèle n'est pas devenu plus intelligent. Il a simplement du brouillon maintenant, et il s'en sert.",
    section3Para2: "Le truc a si bien marché que les chercheurs l'ont automatisé. Les modèles de raisonnement dont tu as probablement entendu parler (Extended Thinking de Claude, la série o d'OpenAI, DeepSeek R1) sont en gros du chain of thought intégré directement dans le modèle. Ils pensent étape par étape avant de répondre, sans que tu aies à demander.",
    section3Para3: "Ce qui soulève une bonne question. Si le modèle raisonne déjà tout seul, qu'est-ce que l'humain apporte encore ?",
    section3Para4: "La conversation. Le chain of thought a prouvé que plus de réflexion donne de meilleures réponses. La même règle tient un cran au-dessus : plus de tours d'allers-retours donnent des réponses encore meilleures. Un modèle qui raisonne seul est utile. Un modèle qui raisonne avec toi est généralement là où vient la vraie qualité.",
    pullQuote2: 'Le workshop ci-dessous est un endroit pour pratiquer ça.',
    yourTurn: 'À toi',
    widgetHeading: 'Le Ultimate Prompt Builder.',
    widgetSubtitle: "Choisis une recette à gauche, active les mouvements que tu veux utiliser, et travaille avec l'IA tour par tour jusqu'à ce que tu sois content du résultat.",
    chapterLabel: 'Chapitre',
  },
  de: {
    title: 'Der Workshop',
    description: 'Alles, was du über Prompting gelernt hast, in einem einzigen Gespräch. Die Synthese.',
    betweenChapters: 'Zwischen Kapitel 3 und 4',
    heroSubtitle: 'Alles, was du gelernt hast, ein Gespräch entfernt.',
    section1Heading: 'Hör auf mit One-Shots.',
    section1Para1: 'An diesem Punkt hast du ein Toolkit: Bausteine, die sokratische Methode, Kontext-Engineering, System Prompts, Tokens.',
    section1Para2: 'In der Praxis kommen gute Ergebnisse fast nie aus einem einzigen Prompt. Die Leute, die am meisten aus KI herausholen, behandeln sie wie einen Kollaborateur. Du teilst ein Ziel, das Modell macht einen Versuch, du hakst nach, es schreibt um, du fügst Kontext hinzu, es versucht es erneut. Nach vier oder fünf Runden beginnt die Antwort zu sitzen.',
    pullQuote1: 'Prompting ist ein Gespräch.',
    section2Heading: 'Jede Technik ist ein Move.',
    section2Intro: 'In einem Gespräch wird jede Technik, die du gelernt hast, zu einem Move, den du machen kannst:',
    chLabel: 'Kap. ',
    bullet1Html: 'Öffne mit den <strong>fünf Bausteinen</strong>: Rolle, Aufgabe, Format, Einschränkungen, Beispiele.',
    bullet2Html: 'Wenn dein Ziel vage ist, lass die KI dich erst interviewen, bevor sie loslegt. Das ist der <strong>sokratische Move</strong>.',
    bullet3Html: 'Wenn viel auf dem Spiel steht, <strong>pack den Kontext</strong> sorgfältig und denk genauso hart darüber nach, was weg muss, wie darüber, was rein muss.',
    bullet4Html: 'Wenn das Problem Denkarbeit braucht, sag dem Modell, es soll <strong>Schritt für Schritt denken</strong>.',
    moreInMoment: 'gleich mehr dazu',
    bullet5Html: 'Wenn der erste Entwurf nicht passt, <strong>iteriere</strong>. Niemand trifft beim ersten Versuch, auch Profis nicht.',
    section2Closing: 'All diese Moves machen denselben Job: Sie helfen dir, ein Gespräch aufzusetzen, in dem die KI tatsächlich nützlich sein kann.',
    oneMoreMove: 'Ein weiterer Move',
    section3Heading: 'Chain of Thought, kurz gesagt.',
    section3Para1: 'Es gibt einen berühmten Prompting-Trick namens Chain of Thought. Du fügst die Phrase „denke Schritt für Schritt" zu deinem Prompt hinzu, und die Genauigkeit des Modells bei schwierigen Problemen macht einen spürbaren Sprung. Das Modell ist nicht schlauer geworden. Es hat jetzt einfach Schmierpapier und nutzt es.',
    section3Para2: 'Der Trick funktionierte so gut, dass Forscher ihn automatisierten. Die Reasoning-Modelle, von denen du wahrscheinlich gehört hast (Claudes Extended Thinking, OpenAIs o-Serie, DeepSeek R1), sind im Grunde Chain of Thought direkt ins Modell eingebaut. Sie denken Schritt für Schritt, bevor sie antworten, ohne dass du fragen musst.',
    section3Para3: 'Was eine gute Frage aufwirft. Wenn das Modell schon von selbst denkt, was bringt der Mensch dann noch ein?',
    section3Para4: 'Das Gespräch. Chain of Thought hat bewiesen, dass mehr Denken zu besseren Antworten führt. Dieselbe Regel gilt eine Ebene höher: mehr Hin und Her führt zu noch besseren. Ein Modell, das allein denkt, ist nützlich. Ein Modell, das mit dir denkt, ist meistens dort, wo die echte Qualität herkommt.',
    pullQuote2: 'Der Workshop unten ist ein Ort, das zu üben.',
    yourTurn: 'Du bist dran',
    widgetHeading: 'Der Ultimate Prompt Builder.',
    widgetSubtitle: 'Wähl links ein Rezept, schalte die Moves ein, die du nutzen willst, und arbeite mit der KI Runde für Runde, bis du mit dem Ergebnis zufrieden bist.',
    chapterLabel: 'Kapitel',
  },
  pt: {
    title: 'O Workshop',
    description: 'Tudo o que você aprendeu sobre prompting, em uma só conversa. A síntese.',
    betweenChapters: 'Entre os capítulos 3 e 4',
    heroSubtitle: 'Tudo o que você aprendeu, a uma conversa de distância.',
    section1Heading: 'Pare de dar um tiro só.',
    section1Para1: 'A essa altura você já tem um toolkit: blocos de construção, o método socrático, engenharia de contexto, system prompts, tokens.',
    section1Para2: 'Na prática, bons resultados quase nunca vêm de um único prompt. As pessoas que tiram mais da IA a tratam como colaboradora. Você compartilha um objetivo, o modelo dá uma tacada, você questiona, ele reescreve, você adiciona contexto, ele tenta de novo. Depois de quatro ou cinco rodadas, a resposta começa a encaixar.',
    pullQuote1: 'Prompting é uma conversa.',
    section2Heading: 'Cada técnica é um movimento.',
    section2Intro: 'Dentro de uma conversa, cada técnica que você aprendeu vira um movimento que você pode fazer:',
    chLabel: 'Cap. ',
    bullet1Html: 'Abra com os <strong>cinco blocos de construção</strong>: Papel, Tarefa, Formato, Restrições, Exemplos.',
    bullet2Html: 'Quando seu objetivo está vago, faça a IA te entrevistar antes de começar a construir. Esse é o <strong>movimento socrático</strong>.',
    bullet3Html: 'Quando as apostas são altas, <strong>empacote o contexto</strong> com cuidado, e pense tanto no que deixar de fora quanto no que incluir.',
    bullet4Html: 'Quando o problema precisa de raciocínio, diga ao modelo para <strong>pensar passo a passo</strong>.',
    moreInMoment: 'mais sobre isso daqui a pouco',
    bullet5Html: 'Quando o primeiro rascunho não está certo, <strong>itere</strong>. Ninguém acerta de primeira, nem os profissionais.',
    section2Closing: 'Todos esses movimentos fazem o mesmo trabalho: eles ajudam você a montar uma conversa em que a IA consiga ser realmente útil.',
    oneMoreMove: 'Mais um movimento',
    section3Heading: 'Chain of thought, resumidamente.',
    section3Para1: 'Existe um truque famoso de prompting chamado chain of thought. Você adiciona a frase "pense passo a passo" ao seu prompt, e a precisão do modelo em problemas difíceis dá um salto notável. O modelo não ficou mais esperto. Ele só tem um rascunho agora, e está usando.',
    section3Para2: 'O truque funcionou tão bem que os pesquisadores automatizaram. Os modelos de raciocínio dos quais você provavelmente ouviu falar (Extended Thinking do Claude, a série o da OpenAI, DeepSeek R1) são basicamente chain of thought embutido diretamente no modelo. Eles pensam passo a passo antes de responder, sem você precisar pedir.',
    section3Para3: 'O que levanta uma boa pergunta. Se o modelo já raciocina sozinho, o que o humano ainda traz para a mesa?',
    section3Para4: 'A conversa. Chain of thought provou que mais pensamento produz melhores respostas. A mesma regra vale um nível acima: mais turnos de troca produzem respostas ainda melhores. Um modelo raciocinando sozinho é útil. Um modelo raciocinando junto com você é geralmente de onde vem a qualidade de verdade.',
    pullQuote2: 'O workshop abaixo é um lugar para praticar isso.',
    yourTurn: 'Sua vez',
    widgetHeading: 'O Ultimate Prompt Builder.',
    widgetSubtitle: 'Escolha uma receita à esquerda, ative os movimentos que quiser usar, e trabalhe com a IA turno a turno até ficar feliz com o resultado.',
    chapterLabel: 'Capítulo',
  },
  ar: {
    title: 'الورشة',
    description: 'كل ما تعلمته عن الطلبات، في محادثة واحدة. التركيب.',
    betweenChapters: 'بين الفصلين 3 و 4',
    heroSubtitle: 'كل ما تعلمته، على بُعد محادثة واحدة.',
    section1Heading: 'توقف عن المحاولة الواحدة.',
    section1Para1: 'في هذه المرحلة لديك مجموعة أدوات: لبنات البناء، الطريقة السقراطية، هندسة السياق، system prompts، الـ tokens.',
    section1Para2: 'في الممارسة، النتائج الجيدة لا تأتي تقريباً من طلب واحد. الأشخاص الذين يحصلون على الأقصى من الذكاء الاصطناعي يعاملونه كمتعاون. تشارك هدفاً، النموذج يجرب، أنت تدفع، هو يعيد الكتابة، أنت تضيف سياقاً، هو يحاول مرة أخرى. بعد أربع أو خمس جولات، الإجابة تبدأ في الهبوط.',
    pullQuote1: 'الطلبات محادثة.',
    section2Heading: 'كل تقنية حركة.',
    section2Intro: 'داخل المحادثة، كل تقنية تعلمتها تصبح حركة يمكنك القيام بها:',
    chLabel: 'الفصل ',
    bullet1Html: 'ابدأ بـ <strong>لبنات البناء الخمس</strong>: الدور، المهمة، التنسيق، القيود، الأمثلة.',
    bullet2Html: 'حين يكون هدفك غامضاً، اجعل الذكاء الاصطناعي يقابلك قبل أن يبدأ في البناء. هذه هي <strong>الحركة السقراطية</strong>.',
    bullet3Html: 'حين تكون المخاطر عالية، <strong>حزّم السياق</strong> بعناية، وفكر بجدية فيما يجب تركه خارجاً كما تفكر فيما يجب تضمينه.',
    bullet4Html: 'حين تحتاج المشكلة إلى تفكير، اطلب من النموذج أن <strong>يفكر خطوة بخطوة</strong>.',
    moreInMoment: 'المزيد عن هذا بعد قليل',
    bullet5Html: 'حين لا تكون المسودة الأولى صحيحة، <strong>كرّر</strong>. لا أحد يصيبها من أول محاولة، بما في ذلك المحترفون.',
    section2Closing: 'كل هذه الحركات تقوم بالعمل نفسه: تساعدك على تهيئة محادثة يمكن للذكاء الاصطناعي أن يكون فيها مفيداً فعلاً.',
    oneMoreMove: 'حركة أخرى',
    section3Heading: 'سلسلة التفكير، باختصار.',
    section3Para1: 'هناك حيلة شهيرة في الطلبات تُسمى chain of thought. تضيف عبارة "فكر خطوة بخطوة" إلى طلبك، ودقة النموذج في المشكلات الصعبة تقفز بشكل ملحوظ. النموذج لم يصبح أذكى. لديه الآن ورقة مسودة فقط، وهو يستخدمها.',
    section3Para2: 'الحيلة نجحت جداً حتى أن الباحثين أتمتوها. نماذج التفكير التي ربما سمعت عنها (Extended Thinking من Claude، سلسلة o من OpenAI، DeepSeek R1) هي في الأساس chain of thought مدمجة مباشرة في النموذج. تفكر خطوة بخطوة قبل أن تجيب، دون أن تحتاج إلى الطلب.',
    section3Para3: 'مما يطرح سؤالاً جيداً. إذا كان النموذج يفكر بالفعل بمفرده، فماذا يجلب الإنسان إلى الطاولة؟',
    section3Para4: 'المحادثة. أثبت chain of thought أن المزيد من التفكير يعطي إجابات أفضل. القاعدة نفسها تسري على مستوى أعلى: المزيد من جولات الأخذ والرد تعطي إجابات أفضل. نموذج يفكر بمفرده مفيد. نموذج يفكر معك هو عادةً من حيث تأتي الجودة الحقيقية.',
    pullQuote2: 'الورشة أدناه مكان لممارسة ذلك.',
    yourTurn: 'دورك',
    widgetHeading: 'The Ultimate Prompt Builder.',
    widgetSubtitle: 'اختر وصفة على اليسار، فعّل الحركات التي تريد استخدامها، واعمل مع الذكاء الاصطناعي دوراً بدور حتى تكون سعيداً بالنتيجة.',
    chapterLabel: 'الفصل',
  },
  id: {
    title: 'The Workshop',
    description: 'Semua yang kamu pelajari tentang prompting, dalam satu percakapan. Sintesisnya.',
    betweenChapters: 'Antara Bab 3 dan 4',
    heroSubtitle: 'Semua yang kamu pelajari, sejauh satu percakapan.',
    section1Heading: 'Berhenti one-shot.',
    section1Para1: 'Sampai titik ini kamu sudah punya toolkit: building blocks, metode Socratic, context engineering, system prompts, tokens.',
    section1Para2: 'Dalam praktiknya, hasil bagus hampir tidak pernah datang dari satu prompt saja. Orang yang paling bisa memanfaatkan AI memperlakukannya seperti kolaborator. Kamu membagikan tujuan, model mencoba, kamu mendorong balik, dia menulis ulang, kamu menambah konteks, dia mencoba lagi. Setelah empat atau lima putaran, jawabannya mulai pas.',
    pullQuote1: 'Prompting itu percakapan.',
    section2Heading: 'Setiap teknik adalah gerakan.',
    section2Intro: 'Di dalam percakapan, setiap teknik yang kamu pelajari jadi gerakan yang bisa kamu lakukan:',
    chLabel: 'Bab ',
    bullet1Html: 'Mulai dengan <strong>lima building blocks</strong>: Peran, Tugas, Format, Batasan, Contoh.',
    bullet2Html: 'Saat tujuanmu kabur, minta AI mewawancarai kamu sebelum mulai membangun. Itu <strong>gerakan Socratic</strong>.',
    bullet3Html: 'Saat taruhannya tinggi, <strong>kemas konteks</strong> dengan hati-hati, dan pikirkan sama kerasnya apa yang harus ditinggalkan dan apa yang harus disertakan.',
    bullet4Html: 'Saat masalahnya butuh penalaran, minta model untuk <strong>berpikir langkah demi langkah</strong>.',
    moreInMoment: 'lebih banyak tentang ini sebentar lagi',
    bullet5Html: 'Saat draft pertama tidak pas, <strong>iterate</strong>. Tidak ada yang bisa langsung sempurna, termasuk profesional.',
    section2Closing: 'Semua gerakan ini melakukan pekerjaan yang sama: mereka membantu kamu menyiapkan percakapan di mana AI bisa benar-benar berguna.',
    oneMoreMove: 'Satu gerakan lagi',
    section3Heading: 'Chain of thought, singkatnya.',
    section3Para1: 'Ada trik prompting terkenal bernama chain of thought. Kamu menambahkan frasa "think step by step" ke prompt-mu, dan akurasi model pada soal sulit melonjak signifikan. Model tidak jadi lebih pintar. Dia cuma punya kertas corat-coret sekarang, dan dia menggunakannya.',
    section3Para2: 'Triknya bekerja sangat baik sehingga para peneliti mengotomatiskannya. Model reasoning yang mungkin kamu dengar (Extended Thinking Claude, seri o OpenAI, DeepSeek R1) pada dasarnya adalah chain of thought yang dibangun langsung ke dalam model. Mereka berpikir langkah demi langkah sebelum menjawab, tanpa kamu harus minta.',
    section3Para3: 'Yang memunculkan pertanyaan bagus. Kalau model sudah bernalar sendiri, apa yang masih dibawa manusia ke meja?',
    section3Para4: 'Percakapan. Chain of thought membuktikan bahwa lebih banyak pemikiran menghasilkan jawaban yang lebih baik. Aturan yang sama berlaku satu tingkat di atas: lebih banyak putaran bolak-balik menghasilkan jawaban yang lebih baik lagi. Model yang bernalar sendirian berguna. Model yang bernalar bersamamu biasanya tempat kualitas sejati berasal.',
    pullQuote2: 'Workshop di bawah adalah tempat untuk mempraktikkannya.',
    yourTurn: 'Giliranmu',
    widgetHeading: 'The Ultimate Prompt Builder.',
    widgetSubtitle: 'Pilih resep di kiri, aktifkan gerakan yang mau kamu pakai, dan kerjakan dengan AI giliran demi giliran sampai kamu puas dengan hasilnya.',
    chapterLabel: 'Bab',
  },
  bn: {
    title: 'The Workshop',
    description: 'Prompting সম্পর্কে তুমি যা শিখেছ, সব এক conversation-এ। The synthesis।',
    betweenChapters: 'Chapter 3 আর 4-এর মাঝে',
    heroSubtitle: 'তুমি যা শিখেছ, এক conversation দূরে।',
    section1Heading: 'One-shot করা বন্ধ করো।',
    section1Para1: 'এই point পর্যন্ত তোমার একটা toolkit আছে: building blocks, Socratic method, context engineering, system prompts, tokens।',
    section1Para2: "Practice-এ, ভালো results প্রায় কখনোই single prompt থেকে আসে না। যারা AI থেকে সবচেয়ে বেশি নেয় তারা একে collaborator-এর মতো treat করে। তুমি একটা goal share করো, model একটা swing নেয়, তুমি push back করো, সে rewrite করে, তুমি context add করো, সে আবার try করে। চার-পাঁচ rounds পরে, answer land করতে শুরু করে।",
    pullQuote1: 'Prompting একটা conversation।',
    section2Heading: 'প্রতিটা technique একটা move।',
    section2Intro: 'Conversation-এর ভেতরে, তুমি যা technique শিখেছ সব একটা move হয়ে যায় যা তুমি করতে পারো:',
    chLabel: 'Ch',
    bullet1Html: '<strong>পাঁচটা building blocks</strong> দিয়ে open করো: Role, Task, Format, Constraints, Examples।',
    bullet2Html: "যখন তোমার goal fuzzy, AI-কে build শুরু করার আগে তোমাকে interview করতে দাও। সেটা হলো <strong>Socratic move</strong>।",
    bullet3Html: 'যখন stakes high, <strong>context carefully pack করো</strong>, আর সমান কঠিন ভাবে চিন্তা করো কী leave out করতে হবে আর কী keep in করতে হবে।',
    bullet4Html: "যখন problem-এর reasoning দরকার, model-কে বলো <strong>step by step ভাবতে</strong>।",
    moreInMoment: 'এটা নিয়ে এক মুহূর্তে আরও',
    bullet5Html: "যখন first draft ঠিক না হয়, <strong>iterate করো</strong>। কেউ first try-তে nail করে না, professional-রা সহ।",
    section2Closing: 'এই সব moves একই কাজ করে: তারা তোমাকে একটা conversation set up করতে help করে যেখানে AI actually useful হতে পারে।',
    oneMoreMove: 'আরও একটা move',
    section3Heading: 'Chain of thought, সংক্ষেপে।',
    section3Para1: "একটা famous prompting trick আছে যাকে chain of thought বলে। তুমি তোমার prompt-এ \"think step by step\" phrase add করো, আর hard problems-এ model-এর accuracy noticeably jump করে। Model smart হয়ে যায়নি। এখন শুধু তার scratch paper আছে, আর সে সেটা use করছে।",
    section3Para2: "Trick এত ভালো কাজ করেছিল যে researchers এটা automate করেছিল। যে reasoning models-এর কথা তুমি probably শুনেছ (Claude-এর Extended Thinking, OpenAI-এর o-series, DeepSeek R1) সেগুলো basically chain of thought যেটা সরাসরি model-এ built। তারা answer দেওয়ার আগে step by step ভাবে, তোমাকে জিজ্ঞেস না করেই।",
    section3Para3: 'যা একটা ভালো প্রশ্ন তোলে। Model যদি নিজেই reason করে, তাহলে মানুষ এখনো table-এ কী নিয়ে আসে?',
    section3Para4: 'Conversation। Chain of thought prove করেছে যে বেশি thinking ভালো answers বানায়। একই rule এক level উপরেও holds করে: বেশি back-and-forth turns আরও ভালো answers বানায়। নিজে থেকে reason করা model useful। তোমার সাথে reason করা model usually সেখানে যেখান থেকে real quality আসে।',
    pullQuote2: 'নিচের workshop সেটা practice করার জায়গা।',
    yourTurn: 'তোমার turn',
    widgetHeading: 'The Ultimate Prompt Builder।',
    widgetSubtitle: "বাঁ দিকে একটা recipe বেছে নাও, যে moves use করতে চাও সেগুলো on করো, আর AI-এর সাথে turn by turn কাজ করো যতক্ষণ না result-এ happy হও।",
    chapterLabel: 'Chapter',
  },
  te: {
    title: 'The Workshop',
    description: 'Prompting గురించి నీవు నేర్చుకున్నదంతా ఒక conversation లో. The synthesis.',
    betweenChapters: 'Chapters 3 మరియు 4 మధ్య',
    heroSubtitle: 'నీవు నేర్చుకున్నదంతా, ఒక conversation దూరంలో.',
    section1Heading: 'One-shotting ఆపు.',
    section1Para1: 'ఈ point కి నీకు toolkit ఉంది: building blocks, Socratic method, context engineering, system prompts, tokens.',
    section1Para2: 'Practice లో, good results ఎప్పుడూ single prompt నుండి రావు. AI నుండి ఎక్కువ పొందే వారు దాన్ని collaborator గా treat చేస్తారు. నీవు goal share చేస్తావ్, model swing తీస్తుంది, నీవు push back చేస్తావ్, అది rewrite చేస్తుంది, నీవు context add చేస్తావ్, అది మళ్ళీ try చేస్తుంది. నాలుగైదు rounds తర్వాత, answer land కావడం start అవుతుంది.',
    pullQuote1: 'Prompting ఒక conversation.',
    section2Heading: 'ప్రతి technique ఒక move.',
    section2Intro: 'Conversation లోపల, నీవు నేర్చుకున్న ప్రతి technique నీవు చేయగల move అవుతుంది:',
    chLabel: 'Ch',
    bullet1Html: '<strong>ఐదు building blocks</strong> తో open చేయి: Role, Task, Format, Constraints, Examples.',
    bullet2Html: 'నీ goal fuzzy అయినప్పుడు, build చేయడం start చేయడానికి ముందు AI ని నిన్ను interview చేయనివ్వు. అదే <strong>Socratic move</strong>.',
    bullet3Html: 'Stakes ఎక్కువగా ఉన్నప్పుడు, <strong>context ని carefully pack చేయి</strong>, మరియు ఏమి leave out చేయాలో అంతే కష్టంగా ఆలోచించు.',
    bullet4Html: 'Problem కి reasoning అవసరమైనప్పుడు, model కి <strong>step by step ఆలోచించమని</strong> చెప్పు.',
    moreInMoment: 'దీని గురించి ఒక క్షణంలో ఇంకా',
    bullet5Html: 'First draft సరిగా లేనప్పుడు, <strong>iterate చేయి</strong>. First pass లో ఎవరూ nail చేయరు, professionals కూడా.',
    section2Closing: 'ఈ moves అన్నీ ఒకే job చేస్తాయి: AI నిజంగా useful అవ్వగల conversation set up చేయడంలో నీకు help చేస్తాయి.',
    oneMoreMove: 'మరో move',
    section3Heading: 'Chain of thought, క్లుప్తంగా.',
    section3Para1: 'Chain of thought అనే famous prompting trick ఉంది. నీవు నీ prompt కి "think step by step" phrase add చేస్తావ్, మరియు hard problems పై model accuracy noticeable గా jump అవుతుంది. Model smarter అవలేదు. దానికి ఇప్పుడు scratch paper ఉంది, అంతే, అది దాన్ని use చేస్తోంది.',
    section3Para2: 'Trick చాలా బాగా work చేసింది, researchers దీన్ని automate చేశారు. నీవు probably విన్న reasoning models (Claude Extended Thinking, OpenAI o-series, DeepSeek R1) basically chain of thought నేరుగా model లో build చేయబడినవి. అవి answer ఇవ్వడానికి ముందు step by step ఆలోచిస్తాయి, నీవు ask చేయాల్సిన అవసరం లేకుండా.',
    section3Para3: 'ఇది ఒక good question raise చేస్తుంది. Model తన సొంతంగా reason చేస్తే, human ఇంకా table కి ఏమి తెస్తుంది?',
    section3Para4: 'Conversation. Chain of thought prove చేసింది ఎక్కువ thinking better answers చేస్తుందని. అదే rule ఒక level పైన కూడా holds అవుతుంది: ఎక్కువ back-and-forth turns ఇంకా better answers చేస్తాయి. తన సొంతంగా reason చేసే model useful. నీతో reason చేసే model usually real quality వచ్చే place.',
    pullQuote2: 'కింద ఉన్న workshop అది practice చేయడానికి place.',
    yourTurn: 'నీ turn',
    widgetHeading: 'The Ultimate Prompt Builder.',
    widgetSubtitle: 'ఎడమవైపు recipe ఎంచుకో, ఉపయోగించాలనుకునే moves on చేయి, మరియు result తో happy అయ్యే వరకు AI తో turn by turn work చేయి.',
    chapterLabel: 'Chapter',
  },
  ta: {
    title: 'The Workshop',
    description: 'Prompting பற்றி நீ கத்துக்கிட்டது எல்லாம், ஒரு conversation-ல. The synthesis.',
    betweenChapters: 'Chapters 3 matrum 4-ku idaiyil',
    heroSubtitle: 'Nee kathuk kittadhu ellam, oru conversation dhooram-la.',
    section1Heading: 'One-shotting-a niruthu.',
    section1Para1: 'Intha point-ku un kitta oru toolkit iruku: building blocks, Socratic method, context engineering, system prompts, tokens.',
    section1Para2: 'Practice-la, nalla results single prompt-la irundhu almost never varuma. AI-laindhu athigamaa pera yarellam nalla use பண்ravangala avanga idha collaborator maadhiri treat பண்raanga. Nee goal-a share பண்ra, model oru swing eduthudhu, nee push back பண்ra, adhu rewrite பண்rudhu, nee context add பண்ra, adhu meendum try பண்rudhu. Naalu ainju rounds aprum, answer land aaga aarambhikum.',
    pullQuote1: 'Prompting oru conversation.',
    section2Heading: 'Ovvoru technique-um oru move.',
    section2Intro: 'Conversation ulla, nee kathuk ittadhellam nee பண்ra mudira oru move aagidum:',
    chLabel: 'Ch',
    bullet1Html: '<strong>Anju building blocks</strong>-ஓட open பண்ணu: Role, Task, Format, Constraints, Examples.',
    bullet2Html: 'Un goal vague-aa irundhaa, build பண்ra munnadi AI-ஐ un-a interview பண்ṇa vidu. Adhaan <strong>Socratic move</strong>.',
    bullet3Html: 'Stakes high-aa irundhaa, <strong>context-a carefully pack பண்ṇu</strong>, enna vittudhu-nu enna keep பண்ra-nu oru maadhirikke yosi.',
    bullet4Html: 'Problem-ku reasoning thevai irundhaa, model-a <strong>step by step yosikka</strong> sollu.',
    moreInMoment: 'indha vishayam pathi oru nimisathla innum',
    bullet5Html: 'First draft sariyaa illa-na, <strong>iterate பண்ṇu</strong>. First try-la yaarum nail பண்radhu illa, professionals-um.',
    section2Closing: 'Indha moves ellaame onne maadhiri velai பண்rudhu: AI actually useful-aa irukkira conversation set up பண்ra un-kku help பண்rudhu.',
    oneMoreMove: 'Innoru move',
    section3Heading: 'Chain of thought, surukkaa.',
    section3Para1: 'Chain of thought-nu oru famous prompting trick iruku. Un prompt-la "think step by step" phrase add பண்ra, matrum hard problems-la model-oda accuracy noticeable-aa jump aagum. Model smarter-aa aagala. Avan kitta ippo scratch paper iruku, adha use பண்raan.',
    section3Para2: 'Trick romba nalla velai seydhadhu-la researchers automate பண்ṇi vittaanga. Nee probably kettu iruka reasoning models (Claude Extended Thinking, OpenAI o-series, DeepSeek R1) basically chain of thought neraa model-la build aagirukku. Answer kuduka munnadi step by step yosikkuma, nee kekka vendamey.',
    section3Para3: 'Idhu oru nalla question-a raise பண்rudhu. Model already than-aa reason பண்navudhu-na, human enna innum table-kku kondu varaan?',
    section3Para4: 'Conversation. Chain of thought prove பண்ṇi kaattudhu athigama thinking nalla answers kudukkum-nu. Same rule oru level mela-um nelladhu: athigama back-and-forth turns innum nalla answers kudukkum. Oru model than-aa reason பண்radhu useful. Un kooda reason பண்ra model usually real quality varudha place.',
    pullQuote2: 'Keezha irukkira workshop adha practice பண்ra oru place.',
    yourTurn: 'Un murai',
    widgetHeading: 'The Ultimate Prompt Builder.',
    widgetSubtitle: 'Idhapurathula oru recipe select பண்ṇu, use பண்ra vendiya moves-a on பண்ṇu, result-la happy aayira varaikum AI kooda turn by turn work பண்ṇu.',
    chapterLabel: 'Chapter',
  },
  mr: {
    title: 'The Workshop',
    description: 'Prompting बद्दल तू जे शिकलायस ते सगळं, एका conversation मध्ये. The synthesis.',
    betweenChapters: 'Chapters 3 आणि 4 च्या मध्ये',
    heroSubtitle: 'तू जे शिकलायस, एक conversation दूर.',
    section1Heading: 'One-shotting बंद कर.',
    section1Para1: 'या point पर्यंत तुझ्याकडे एक toolkit आहे: building blocks, Socratic method, context engineering, system prompts, tokens.',
    section1Para2: 'Practice मध्ये, चांगले results कधीही single prompt ने येत नाहीत. जे लोक AI चा सर्वाधिक फायदा घेतात ते त्याला collaborator प्रमाणे treat करतात. तू goal share करतोस, model एक swing घेतं, तू push back करतोस, तो rewrite करतो, तू context add करतोस, तो पुन्हा try करतो. चार-पाच rounds नंतर, उत्तर land व्हायला सुरुवात होते.',
    pullQuote1: 'Prompting एक conversation आहे.',
    section2Heading: 'प्रत्येक technique एक move आहे.',
    section2Intro: 'Conversation मध्ये, तू शिकलेली प्रत्येक technique एक move होते जी तू करू शकतोस:',
    chLabel: 'Ch',
    bullet1Html: '<strong>पाच building blocks</strong> सह open कर: Role, Task, Format, Constraints, Examples.',
    bullet2Html: 'तुझा goal fuzzy असताना, AI ला build सुरू करण्यापूर्वी तुझा interview करू दे. तोच <strong>Socratic move</strong>.',
    bullet3Html: 'Stakes उच्च असताना, <strong>context काळजीपूर्वक pack कर</strong>, आणि काय leave out करायचं आणि काय keep in करायचं यावर तितकाच विचार कर.',
    bullet4Html: 'Problem ला reasoning लागतं तेव्हा, model ला <strong>step by step विचार करायला</strong> सांग.',
    moreInMoment: 'याबद्दल एका क्षणात अधिक',
    bullet5Html: 'First draft बरोबर नसेल तेव्हा, <strong>iterate कर</strong>. कोणीही first try मध्ये nail करत नाही, professionals देखील.',
    section2Closing: 'हे सगळे moves एकच काम करतात: ते तुला एक conversation set up करायला help करतात जिथे AI खरंच useful असू शकतं.',
    oneMoreMove: 'आणखी एक move',
    section3Heading: 'Chain of thought, थोडक्यात.',
    section3Para1: 'एक famous prompting trick आहे ज्याला chain of thought म्हणतात. तू तुझ्या prompt मध्ये "think step by step" phrase add करतोस, आणि hard problems वर model ची accuracy noticeable जंप होते. Model smarter झालेलं नाही. त्याच्याकडे आता scratch paper आहे आणि तो तो वापरतोय.',
    section3Para2: 'Trick इतकी चांगली काम केली की researchers ने ती automate केली. तू ज्या reasoning models बद्दल probably ऐकलं असशील (Claude Extended Thinking, OpenAI o-series, DeepSeek R1) ते basically chain of thought आहेत जे थेट model मध्ये built आहेत. ते answer देण्यापूर्वी step by step विचार करतात, तुला विचारावं न लागता.',
    section3Para3: 'जे एक चांगला प्रश्न उभा करतं. जर model आधीच स्वतः reason करतो, तर माणूस अजूनही table वर काय आणतो?',
    section3Para4: 'Conversation. Chain of thought ने सिद्ध केलं की जास्त thinking ने better answers मिळतात. तोच rule एक level वर पण holds होतो: अधिक back-and-forth turns अधिक चांगले answers देतात. स्वतः reason करणारं model useful आहे. तुझ्यासोबत reason करणारं model सहसा जिथे real quality येते ते ठिकाण आहे.',
    pullQuote2: 'खाली दिलेला workshop ते practice करायची जागा आहे.',
    yourTurn: 'तुझी वेळ',
    widgetHeading: 'The Ultimate Prompt Builder.',
    widgetSubtitle: 'डावीकडे एक recipe निवड, जे moves वापरायचे त्यांना on कर, आणि निकालावर खुश होईपर्यंत AI सोबत turn by turn काम कर.',
    chapterLabel: 'Chapter',
  },
  kn: {
    title: 'The Workshop',
    description: 'Prompting ಬಗ್ಗೆ ನೀನು ಕಲಿತಿದ್ದೆಲ್ಲ ಒಂದು conversation ನಲ್ಲಿ. The synthesis.',
    betweenChapters: 'Chapters 3 ಮತ್ತು 4 ನಡುವೆ',
    heroSubtitle: 'ನೀನು ಕಲಿತಿದ್ದೆಲ್ಲ, ಒಂದು conversation ದೂರದಲ್ಲಿ.',
    section1Heading: 'One-shotting ನಿಲ್ಲಿಸು.',
    section1Para1: 'ಈ point ಗೆ ನಿನ್ನ ಹತ್ತಿರ toolkit ಇದೆ: building blocks, Socratic method, context engineering, system prompts, tokens.',
    section1Para2: 'Practice ನಲ್ಲಿ, ಒಳ್ಳೆಯ results almost never single prompt ನಿಂದ ಬರುತ್ತವೆ. AI ಯಿಂದ ಹೆಚ್ಚು ಪಡೆಯೋವರು ಅದನ್ನು collaborator ಅಂತ treat ಮಾಡ್ತಾರೆ. ನೀನು goal share ಮಾಡ್ತೀಯಾ, model swing ಮಾಡುತ್ತೆ, ನೀನು push back ಮಾಡ್ತೀಯಾ, ಅದು rewrite ಮಾಡುತ್ತೆ, ನೀನು context add ಮಾಡ್ತೀಯಾ, ಅದು ಮತ್ತೆ try ಮಾಡುತ್ತೆ. ನಾಲ್ಕೈದು rounds ನಂತರ answer land ಆಗೋಕೆ start ಆಗುತ್ತೆ.',
    pullQuote1: 'Prompting ಒಂದು conversation.',
    section2Heading: 'ಪ್ರತಿ technique ಒಂದು move.',
    section2Intro: 'Conversation ಒಳಗೆ, ನೀನು ಕಲಿತ ಪ್ರತಿ technique ನೀನು ಮಾಡಬಹುದಾದ move ಆಗುತ್ತೆ:',
    chLabel: 'Ch',
    bullet1Html: '<strong>ಐದು building blocks</strong> ನಿಂದ open ಮಾಡು: Role, Task, Format, Constraints, Examples.',
    bullet2Html: 'ನಿನ್ನ goal fuzzy ಇರುವಾಗ, build ಮಾಡೋಕೆ start ಮಾಡೋ ಮೊದಲು AI ಗೆ ನಿನ್ನ interview ಮಾಡೋಕೆ ಬಿಡು. ಅದೇ <strong>Socratic move</strong>.',
    bullet3Html: 'Stakes ಹೆಚ್ಚಿರುವಾಗ, <strong>context ಅನ್ನು carefully pack ಮಾಡು</strong>, ಮತ್ತು ಏನನ್ನು leave out ಮಾಡಬೇಕು ಅಂತ ಅಷ್ಟೇ ಕಷ್ಟಪಟ್ಟು ಯೋಚಿಸು.',
    bullet4Html: 'Problem ಗೆ reasoning ಬೇಕಾದಾಗ, model ಗೆ <strong>step by step ಯೋಚಿಸಲು</strong> ಹೇಳು.',
    moreInMoment: 'ಇದರ ಬಗ್ಗೆ ಒಂದು ಕ್ಷಣದಲ್ಲಿ ಇನ್ನೂ',
    bullet5Html: 'First draft ಸರಿಯಿಲ್ಲದಾಗ, <strong>iterate ಮಾಡು</strong>. First try ನಲ್ಲಿ ಯಾರೂ nail ಮಾಡೋಲ್ಲ, professionals ಕೂಡ.',
    section2Closing: 'ಈ moves ಎಲ್ಲ ಒಂದೇ job ಮಾಡ್ತವೆ: AI ನಿಜವಾಗಿಯೂ useful ಆಗಬಹುದಾದ conversation set up ಮಾಡೋಕೆ ನಿನಗೆ help ಮಾಡ್ತವೆ.',
    oneMoreMove: 'ಇನ್ನೊಂದು move',
    section3Heading: 'Chain of thought, ಸಂಕ್ಷಿಪ್ತವಾಗಿ.',
    section3Para1: 'Chain of thought ಅನ್ನೋ famous prompting trick ಇದೆ. ನಿನ್ನ prompt ಗೆ "think step by step" phrase add ಮಾಡ್ತೀಯಾ, ಮತ್ತು hard problems ಮೇಲೆ model ನ accuracy noticeable ಆಗಿ jump ಆಗುತ್ತೆ. Model smarter ಆಗಿಲ್ಲ. ಈಗ ಅದಕ್ಕೆ scratch paper ಇದೆ, ಮತ್ತು ಅದನ್ನು use ಮಾಡ್ತಾ ಇದೆ.',
    section3Para2: 'Trick ಎಷ್ಟು ಚೆನ್ನಾಗಿ work ಮಾಡ್ತು ಅಂದ್ರೆ researchers ಇದನ್ನು automate ಮಾಡಿದ್ರು. ನೀನು probably ಕೇಳಿರಬಹುದಾದ reasoning models (Claude Extended Thinking, OpenAI o-series, DeepSeek R1) basically chain of thought ನೇ model ನಲ್ಲಿ directly built ಆಗಿವೆ. ಅವು answer ಕೊಡೋ ಮೊದಲು step by step ಯೋಚಿಸುತ್ತವೆ, ನೀನು ask ಮಾಡದೆ.',
    section3Para3: 'ಇದು ಒಂದು good question raise ಮಾಡುತ್ತೆ. Model ತಾನೇ reason ಮಾಡ್ತಿದ್ರೆ, human ಇನ್ನೂ table ಗೆ ಏನು ತರ್ತಾನೆ?',
    section3Para4: 'Conversation. Chain of thought prove ಮಾಡಿದೆ ಹೆಚ್ಚು thinking better answers ಕೊಡುತ್ತೆ ಅಂತ. ಅದೇ rule ಒಂದು level ಮೇಲೂ holds ಆಗುತ್ತೆ: ಹೆಚ್ಚು back-and-forth turns ಇನ್ನೂ better answers ಕೊಡ್ತವೆ. ತಾನಾಗಿ reason ಮಾಡೋ model useful. ನಿನ್ನೊಂದಿಗೆ reason ಮಾಡೋ model usually real quality ಬರೋ place.',
    pullQuote2: 'ಕೆಳಗಿನ workshop ಅದನ್ನು practice ಮಾಡೋ place.',
    yourTurn: 'ನಿನ್ನ turn',
    widgetHeading: 'The Ultimate Prompt Builder.',
    widgetSubtitle: 'ಎಡಭಾಗದಲ್ಲಿ recipe ಆಯ್ಕೆ ಮಾಡು, use ಮಾಡಬೇಕಾದ moves on ಮಾಡು, ಮತ್ತು result ನಿಂದ happy ಆಗೋ ವರೆಗೆ AI ಜೊತೆ turn by turn work ಮಾಡು.',
    chapterLabel: 'Chapter',
  },
  gu: {
    title: 'The Workshop',
    description: 'Prompting વિશે તેં જે શીખ્યું છે, તે બધું એક conversation માં. The synthesis.',
    betweenChapters: 'Chapters 3 અને 4 વચ્ચે',
    heroSubtitle: 'તેં જે શીખ્યું, તે એક conversation દૂર.',
    section1Heading: 'One-shotting બંધ કર.',
    section1Para1: 'આ point પર તારી પાસે toolkit છે: building blocks, Socratic method, context engineering, system prompts, tokens.',
    section1Para2: 'Practice માં, સારા results લગભગ ક્યારેય single prompt થી નથી આવતા. જે લોકો AI માંથી સૌથી વધુ કાઢે છે તે તેને collaborator ની જેમ treat કરે છે. તું goal share કરે છે, model swing કરે છે, તું push back કરે છે, તે rewrite કરે છે, તું context add કરે છે, તે ફરી try કરે છે. ચાર પાંચ rounds પછી, જવાબ land થવા માંડે છે.',
    pullQuote1: 'Prompting એ conversation છે.',
    section2Heading: 'દરેક technique એક move છે.',
    section2Intro: 'Conversation ની અંદર, તેં જે પણ technique શીખી છે તે એક move બને છે જે તું કરી શકે:',
    chLabel: 'Ch',
    bullet1Html: '<strong>પાંચ building blocks</strong> થી open કર: Role, Task, Format, Constraints, Examples.',
    bullet2Html: 'જ્યારે તારો goal fuzzy હોય, AI ને build શરૂ કરતા પહેલા તારો interview કરવા દે. એ <strong>Socratic move</strong>.',
    bullet3Html: 'Stakes ઊંચા હોય ત્યારે, <strong>context ને carefully pack કર</strong>, અને શું leave out કરવું એ પણ એટલું જ વિચાર.',
    bullet4Html: 'Problem ને reasoning જોઈતું હોય, model ને <strong>step by step વિચારવાનું</strong> કહે.',
    moreInMoment: 'આ વિશે એક ક્ષણમાં વધુ',
    bullet5Html: 'જ્યારે first draft બરાબર ન હોય, <strong>iterate કર</strong>. First try માં કોઈ nail નથી કરતું, professionals પણ.',
    section2Closing: 'આ બધા moves એક જ કામ કરે છે: એ તને એવી conversation set up કરવામાં help કરે છે જેમાં AI ખરેખર useful થઈ શકે.',
    oneMoreMove: 'વધુ એક move',
    section3Heading: 'Chain of thought, ટૂંકમાં.',
    section3Para1: 'એક famous prompting trick છે જેનું નામ chain of thought છે. તું તારા prompt માં "think step by step" phrase add કરે છે, અને hard problems પર model ની accuracy noticeable jump કરે છે. Model smart નથી થયો. તેની પાસે હવે scratch paper છે, અને તે એનો use કરી રહ્યો છે.',
    section3Para2: 'Trick એટલી સારી રીતે કામ કરી કે researchers એ તેને automate કરી દીધી. તેં probably reasoning models વિશે સાંભળ્યું હશે (Claude Extended Thinking, OpenAI o-series, DeepSeek R1) તે basically chain of thought છે જે સીધા model માં built છે. તેઓ જવાબ આપતા પહેલા step by step વિચારે છે, તારે પૂછવું પણ ન પડે.',
    section3Para3: 'જે એક સારો પ્રશ્ન ઊભો કરે છે. જો model પહેલેથી જાતે reason કરે છે, તો માણસ હજી પણ table પર શું લાવે છે?',
    section3Para4: 'Conversation. Chain of thought એ prove કર્યું કે વધુ thinking થી better answers મળે છે. એ જ rule એક level ઉપર પણ holds કરે છે: વધુ back-and-forth turns થી વધુ સારા જવાબો મળે છે. એકલા reason કરતું model useful છે. તારી સાથે reason કરતું model એ સામાન્ય રીતે જ્યાંથી real quality આવે છે.',
    pullQuote2: 'નીચેનો workshop એ practice કરવાની જગ્યા છે.',
    yourTurn: 'તારો વારો',
    widgetHeading: 'The Ultimate Prompt Builder.',
    widgetSubtitle: 'ડાબી બાજુ એક recipe પસંદ કર, જે moves વાપરવા હોય તે on કર, અને result થી ખુશ થાય ત્યાં સુધી AI સાથે turn by turn કામ કર.',
    chapterLabel: 'Chapter',
  },
  ja: {
    title: 'ワークショップ',
    description: 'プロンプティングについて学んだこと全部を、ひとつの会話で。その統合。',
    betweenChapters: '第3章と第4章の間',
    heroSubtitle: '学んだことすべてが、ひとつの会話の向こうに。',
    section1Heading: 'ワンショットをやめよう。',
    section1Para1: 'この時点で君にはツールキットがある：ビルディングブロック、ソクラテス式手法、コンテキストエンジニアリング、システムプロンプト、トークン。',
    section1Para2: '実際のところ、良い結果はほとんど一発のプロンプトからは出てこない。AIから一番多くを引き出す人たちは、AIを協力者として扱う。目標を共有し、モデルが一振りし、君が押し返し、モデルが書き直し、君が文脈を足し、モデルがまた試す。4～5ラウンドのあと、答えが着地し始める。',
    pullQuote1: 'プロンプティングとは会話だ。',
    section2Heading: 'どのテクニックもムーブだ。',
    section2Intro: '会話の中では、君が学んだどのテクニックも、君ができるムーブになる：',
    chLabel: '第',
    bullet1Html: '<strong>5つのビルディングブロック</strong>で開く：役割、タスク、フォーマット、制約、例。',
    bullet2Html: '目的があいまいなとき、AIに組み立てる前にまず君をインタビューさせる。それが<strong>ソクラテス式ムーブ</strong>。',
    bullet3Html: '重要な場面では<strong>コンテキストを丁寧に詰める</strong>。何を入れるかと同じくらい、何を外すかも真剣に考える。',
    bullet4Html: '推論が必要な問題では、モデルに<strong>ステップごとに考える</strong>よう伝える。',
    moreInMoment: '少しあとで詳しく',
    bullet5Html: '初稿がしっくりこないときは<strong>イテレートする</strong>。一発で決める人はいない、プロも含めて。',
    section2Closing: 'これらのムーブはすべて同じ仕事をする：AIが本当に役に立てる会話を整える手伝いをしてくれる。',
    oneMoreMove: 'もうひとつムーブ',
    section3Heading: 'Chain of thought、手短に。',
    section3Para1: 'chain of thought というプロンプティングの有名なトリックがある。プロンプトに「ステップごとに考えて」という一言を加えると、難しい問題での精度が目に見えて跳ね上がる。モデルが賢くなったわけじゃない。下書き用紙ができて、それを使っているだけだ。',
    section3Para2: 'この手法があまりにうまく働くので、研究者たちはそれを自動化した。君が耳にしたことがあるであろう推論モデル（ClaudeのExtended Thinking、OpenAIのoシリーズ、DeepSeek R1）は、基本的にchain of thoughtがモデルに組み込まれたものだ。頼まなくても、答える前にステップごとに考える。',
    section3Para3: 'ここで良い問いが浮かぶ。モデルがすでに自分で推論するなら、人間はまだ何をテーブルに持ち込めるのか？',
    section3Para4: '会話だ。chain of thought は、より多くの思考がより良い答えを生むことを証明した。同じルールは一段上でも成り立つ：より多くのやり取りがさらに良い答えを生む。単独で推論するモデルは有用だ。君と一緒に推論するモデルは、たいてい本当の品質が生まれる場所だ。',
    pullQuote2: '下のワークショップはそれを練習する場だ。',
    yourTurn: '君の番',
    widgetHeading: 'Ultimate Prompt Builder。',
    widgetSubtitle: '左側のレシピを選び、使いたいムーブをオンにして、納得いく結果になるまでAIとターンを重ねて進めよう。',
    chapterLabel: '章',
  },
  ko: {
    title: '더 워크숍',
    description: '프롬프팅에 대해 네가 배운 모든 것을 한 번의 대화 속에. 그 종합.',
    betweenChapters: '3장과 4장 사이',
    heroSubtitle: '네가 배운 것 전부, 한 번의 대화 거리에.',
    section1Heading: '원샷은 그만.',
    section1Para1: '여기까지 오면 너에겐 툴킷이 있어: 빌딩 블록, 소크라테스식 방법, 컨텍스트 엔지니어링, 시스템 프롬프트, 토큰.',
    section1Para2: '실제로는 좋은 결과가 단일 프롬프트에서 나오는 경우는 거의 없어. AI에서 가장 많이 얻어내는 사람들은 AI를 협력자처럼 다뤄. 목표를 공유하면, 모델이 한번 해보고, 네가 밀어붙이고, 모델이 다시 쓰고, 네가 맥락을 더하고, 모델이 다시 시도해. 네다섯 번의 라운드를 거치면 답이 자리 잡기 시작해.',
    pullQuote1: '프롬프팅은 대화다.',
    section2Heading: '모든 테크닉은 무브다.',
    section2Intro: '대화 안에서 네가 배운 각 테크닉은 네가 할 수 있는 무브가 돼:',
    chLabel: '',
    bullet1Html: '<strong>다섯 빌딩 블록</strong>으로 시작해: 역할, 과제, 형식, 제약, 예시.',
    bullet2Html: '목표가 흐릿할 때는 AI가 만들기 전에 너를 먼저 인터뷰하게 해. 그게 <strong>소크라테스식 무브</strong>야.',
    bullet3Html: '판돈이 클 때는 <strong>컨텍스트를 신중하게 꾸려</strong>. 무엇을 넣을지만큼 무엇을 뺄지도 똑같이 고민해.',
    bullet4Html: '추론이 필요한 문제에서는 모델에게 <strong>단계별로 생각하라고</strong> 말해.',
    moreInMoment: '이건 잠시 뒤에 더',
    bullet5Html: '첫 초안이 맞지 않을 때는 <strong>반복해</strong>. 프로도 포함해서 누구도 한 번에 완벽하게는 해내지 못해.',
    section2Closing: '이 모든 무브는 같은 일을 해: AI가 실제로 쓸모 있을 수 있는 대화를 네가 세팅하게 돕는 거.',
    oneMoreMove: '무브 하나 더',
    section3Heading: 'Chain of thought, 짧게.',
    section3Para1: 'chain of thought라는 유명한 프롬프팅 트릭이 있어. 프롬프트에 "단계별로 생각해"라는 문구를 추가하면, 어려운 문제에서의 모델 정확도가 눈에 띄게 뛰어올라. 모델이 더 똑똑해진 건 아니야. 이제 연습장을 갖게 됐고, 그걸 쓰고 있는 거야.',
    section3Para2: '이 트릭이 너무 잘 먹혀서 연구자들이 자동화했어. 네가 들어봤을 법한 추론 모델들(Claude의 Extended Thinking, OpenAI의 o 시리즈, DeepSeek R1)은 본질적으로 chain of thought가 모델 안에 직접 내장된 거야. 네가 요청하지 않아도 답하기 전에 단계별로 생각해.',
    section3Para3: '그러면 좋은 질문이 떠올라. 모델이 이미 스스로 추론한다면 사람은 여전히 무엇을 가져다줄까?',
    section3Para4: '대화. chain of thought는 더 많은 사고가 더 나은 답을 낸다는 걸 증명했어. 같은 규칙이 한 단계 위에도 성립해: 더 많은 주고받기가 더 나은 답을 낳아. 혼자서 추론하는 모델은 유용해. 너와 함께 추론하는 모델은 보통 진짜 품질이 나오는 지점이야.',
    pullQuote2: '아래의 워크숍은 그걸 연습하는 곳이야.',
    yourTurn: '네 차례',
    widgetHeading: 'The Ultimate Prompt Builder.',
    widgetSubtitle: '왼쪽에서 레시피를 고르고, 쓰고 싶은 무브를 켜고, 결과가 마음에 들 때까지 AI와 한 턴씩 주고받으며 작업해.',
    chapterLabel: '장',
  },
  zh: {
    title: 'Workshop',
    description: '你学到的所有关于 prompting 的东西,在一次对话里。这就是综合。',
    betweenChapters: '在第 3 章和第 4 章之间',
    heroSubtitle: '你学到的一切,就在一次对话之外。',
    section1Heading: '别再一次就交差。',
    section1Para1: '到这里为止你有了一套工具:积木、苏格拉底式方法、上下文工程、系统 prompt、tokens。',
    section1Para2: '实际上,好的结果几乎从来不是从单个 prompt 来的。最能从 AI 里榨出东西的人把它当成合作者来用。你分享一个目标,模型先出一招,你反驳,它重写,你加上下文,它再来一次。经过四五个回合,答案开始落地。',
    pullQuote1: 'Prompting 是一场对话。',
    section2Heading: '每种技巧都是一步招式。',
    section2Intro: '在对话里,你学到的每种技巧都变成你可以使出的一步招式:',
    chLabel: '第',
    bullet1Html: '用<strong>五块积木</strong>开场:角色、任务、格式、限制、示例。',
    bullet2Html: '目标模糊的时候,让 AI 在动手之前先访问你。这就是<strong>苏格拉底招式</strong>。',
    bullet3Html: '筹码大的时候,<strong>认真打包上下文</strong>,并且对"要留下什么"和"要拿掉什么"同样用力地去想。',
    bullet4Html: '遇到需要推理的问题,让模型<strong>一步一步想</strong>。',
    moreInMoment: '稍后会说更多',
    bullet5Html: '初稿不对的时候,<strong>迭代</strong>。没人能一次到位,包括专业人士。',
    section2Closing: '所有这些招式做的是同一件事:帮你布置一场 AI 真正能派上用场的对话。',
    oneMoreMove: '再多一步招式',
    section3Heading: 'Chain of thought,简短说说。',
    section3Para1: '有个著名的 prompting 小技巧叫 chain of thought。你在 prompt 里加上"一步一步想",模型在难题上的准确率就会有一个明显的跃升。模型并没有变聪明,它只是现在有了草稿纸,并且在用它。',
    section3Para2: '这个小技巧好用到研究人员把它自动化了。你大概听过的那些推理模型(Claude 的 Extended Thinking、OpenAI 的 o 系列、DeepSeek R1),本质上就是直接把 chain of thought 内建到模型里。它们在回答之前会一步一步想,不用你开口。',
    section3Para3: '这引出一个好问题。如果模型已经会自己推理了,那人类还能带来什么?',
    section3Para4: '对话。Chain of thought 证明了更多思考能带来更好的答案。同样的规则在更高一层也成立:更多的来回,会带来更好的答案。一个人自己推理的模型是有用的。一个与你一起推理的模型,通常才是真正高质量产出的来源。',
    pullQuote2: '下面的 workshop 就是练这个的地方。',
    yourTurn: '轮到你了',
    widgetHeading: 'The Ultimate Prompt Builder。',
    widgetSubtitle: '在左边挑一个食谱,打开你想用的招式,和 AI 一来一回地磨,直到结果让你满意。',
    chapterLabel: '第',
  },
  tr: {
    title: 'The Workshop',
    description: 'Prompting hakkında öğrendiğin her şey, tek bir konuşmada. Sentezi.',
    betweenChapters: '3. ve 4. bölümler arasında',
    heroSubtitle: 'Öğrendiğin her şey, bir konuşma uzağında.',
    section1Heading: 'Tek seferde bitirmeyi bırak.',
    section1Para1: "Bu noktaya geldiğinde bir araç kutun var: yapı taşları, Sokratik yöntem, bağlam mühendisliği, system prompt'lar, token'lar.",
    section1Para2: "Pratikte iyi sonuçlar neredeyse hiçbir zaman tek bir prompt'tan gelmez. AI'dan en fazla çıkaranlar onu bir ortak gibi kullanır. Bir amaç paylaşırsın, model bir deneme yapar, sen itiraz edersin, o yeniden yazar, sen bağlam eklersin, o tekrar dener. Dört beş tur sonra cevap oturmaya başlar.",
    pullQuote1: 'Prompting bir konuşmadır.',
    section2Heading: 'Her teknik bir hamledir.',
    section2Intro: 'Bir konuşmanın içinde, öğrendiğin her teknik yapabileceğin bir hamleye dönüşür:',
    chLabel: 'Bölüm ',
    bullet1Html: '<strong>Beş yapı taşı</strong> ile aç: Rol, Görev, Format, Kısıtlamalar, Örnekler.',
    bullet2Html: "Hedefin bulanıksa, AI'ın inşa etmeye başlamadan önce seni sorgulamasına izin ver. Bu <strong>Sokratik hamle</strong>.",
    bullet3Html: "Riskler yüksekse, <strong>bağlamı dikkatle paketle</strong>, ve neyi bırakman gerektiğini, neyi tutman gerektiği kadar ciddi düşün.",
    bullet4Html: "Problem muhakeme gerektiriyorsa, modele <strong>adım adım düşünmesini</strong> söyle.",
    moreInMoment: 'biraz sonra bunun hakkında daha fazla',
    bullet5Html: 'İlk taslak olmadıysa, <strong>yinele</strong>. Kimse ilk denemede çözemez, profesyoneller dahil.',
    section2Closing: "Bu hamlelerin hepsi aynı işi yapar: AI'ın gerçekten işe yarayabileceği bir konuşmayı kurmana yardım ederler.",
    oneMoreMove: 'Bir hamle daha',
    section3Heading: 'Chain of thought, kısaca.',
    section3Para1: 'Chain of thought denen meşhur bir prompting hilesi var. Prompt\'una "adım adım düşün" cümlesini ekliyorsun ve modelin zor sorulardaki doğruluğu belirgin biçimde sıçrıyor. Model daha akıllı olmadı. Şimdi müsvedde kağıdı var ve onu kullanıyor.',
    section3Para2: "Hile o kadar iyi çalıştı ki araştırmacılar onu otomatikleştirdi. Muhtemelen duyduğun muhakeme modelleri (Claude'un Extended Thinking'i, OpenAI'nin o serisi, DeepSeek R1) esasen modelin içine doğrudan yerleştirilmiş chain of thought'tur. Cevap vermeden önce adım adım düşünürler, sen istemek zorunda kalmadan.",
    section3Para3: 'Bu iyi bir soru ortaya çıkarıyor. Eğer model zaten kendi başına muhakeme ediyorsa, insan hâlâ masaya ne getiriyor?',
    section3Para4: 'Konuşma. Chain of thought daha fazla düşünmenin daha iyi cevaplar ürettiğini kanıtladı. Aynı kural bir üst seviyede de geçerli: daha fazla gidip gelme daha da iyi cevaplar üretir. Tek başına muhakeme eden bir model yararlıdır. Seninle birlikte muhakeme eden bir model genellikle gerçek kalitenin geldiği yerdir.',
    pullQuote2: "Aşağıdaki workshop bunu pratik yapmak için bir yer.",
    yourTurn: 'Sıra sende',
    widgetHeading: 'The Ultimate Prompt Builder.',
    widgetSubtitle: "Solda bir tarif seç, kullanmak istediğin hamleleri aç, ve sonuçtan memnun olana kadar AI ile tur tur çalış.",
    chapterLabel: 'Bölüm',
  },
  vi: {
    title: 'The Workshop',
    description: 'Tất cả những gì bạn đã học về prompting, trong một cuộc trò chuyện. Sự tổng hợp.',
    betweenChapters: 'Giữa chương 3 và 4',
    heroSubtitle: 'Tất cả những gì bạn đã học, cách một cuộc trò chuyện.',
    section1Heading: 'Ngừng one-shot.',
    section1Para1: 'Tới lúc này bạn đã có một bộ công cụ: các khối xây dựng, phương pháp Socratic, kỹ thuật ngữ cảnh, system prompt, token.',
    section1Para2: 'Thực tế, kết quả tốt gần như không bao giờ đến từ một prompt duy nhất. Những người khai thác AI hiệu quả nhất coi nó như một cộng sự. Bạn chia sẻ một mục tiêu, mô hình thử một lần, bạn phản hồi, nó viết lại, bạn thêm ngữ cảnh, nó thử lại. Sau bốn hoặc năm vòng, câu trả lời bắt đầu đứng vững.',
    pullQuote1: 'Prompting là một cuộc trò chuyện.',
    section2Heading: 'Mỗi kỹ thuật là một nước đi.',
    section2Intro: 'Trong một cuộc trò chuyện, mỗi kỹ thuật bạn đã học trở thành một nước đi bạn có thể thực hiện:',
    chLabel: 'Ch',
    bullet1Html: 'Mở đầu với <strong>năm khối xây dựng</strong>: Vai trò, Nhiệm vụ, Định dạng, Ràng buộc, Ví dụ.',
    bullet2Html: 'Khi mục tiêu của bạn còn mờ, hãy để AI phỏng vấn bạn trước khi bắt đầu xây dựng. Đó là <strong>nước đi Socratic</strong>.',
    bullet3Html: 'Khi tình huống quan trọng, <strong>hãy đóng gói ngữ cảnh</strong> cẩn thận, và nghĩ kỹ về việc bỏ gì ra cũng nhiều như nghĩ về việc đưa gì vào.',
    bullet4Html: 'Khi vấn đề cần lập luận, hãy nói với mô hình <strong>nghĩ từng bước</strong>.',
    moreInMoment: 'nói thêm về điều này trong chốc lát',
    bullet5Html: 'Khi bản nháp đầu không ổn, <strong>lặp lại</strong>. Không ai làm đúng ngay từ lần đầu, kể cả chuyên gia.',
    section2Closing: 'Tất cả các nước đi này đều làm cùng một việc: chúng giúp bạn bày ra một cuộc trò chuyện mà AI thật sự có thể hữu ích.',
    oneMoreMove: 'Một nước đi nữa',
    section3Heading: 'Chain of thought, nói ngắn gọn.',
    section3Para1: 'Có một mẹo prompting nổi tiếng tên là chain of thought. Bạn thêm cụm "nghĩ từng bước" vào prompt, và độ chính xác của mô hình trên các bài toán khó nhảy vọt rõ rệt. Mô hình không thông minh hơn đâu. Nó chỉ đã có giấy nháp và đang dùng nó.',
    section3Para2: 'Mẹo này hoạt động tốt đến mức các nhà nghiên cứu đã tự động hóa nó. Các mô hình lập luận mà bạn chắc đã nghe nói (Extended Thinking của Claude, dòng o của OpenAI, DeepSeek R1) về cơ bản là chain of thought được tích hợp thẳng vào mô hình. Chúng nghĩ từng bước trước khi trả lời, không cần bạn phải yêu cầu.',
    section3Para3: 'Điều đó đặt ra một câu hỏi hay. Nếu mô hình đã tự lập luận, con người còn mang gì tới bàn?',
    section3Para4: 'Cuộc trò chuyện. Chain of thought chứng minh rằng nhiều suy nghĩ hơn cho ra câu trả lời tốt hơn. Cùng quy luật đó đúng ở cấp cao hơn: nhiều lượt qua lại hơn cho ra câu trả lời còn tốt hơn nữa. Một mô hình tự lập luận thì hữu ích. Một mô hình lập luận cùng bạn thường là nơi chất lượng thật sự đến từ đó.',
    pullQuote2: 'Workshop bên dưới là chỗ để luyện tập điều đó.',
    yourTurn: 'Đến lượt bạn',
    widgetHeading: 'The Ultimate Prompt Builder.',
    widgetSubtitle: 'Chọn một công thức ở bên trái, bật các nước đi bạn muốn dùng, và làm việc với AI từng lượt cho tới khi bạn hài lòng với kết quả.',
    chapterLabel: 'Chương',
  },
};

// ─── Write files ───
for (const [locale, t] of Object.entries(LOCALES)) {
  const outDir = path.join(ROOT, 'src/pages', locale);
  mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'workshop.astro');
  writeFileSync(outFile, template(locale, t), 'utf8');
  console.log(`  ✓ ${locale}/workshop.astro`);
}
console.log(`\nWrote ${Object.keys(LOCALES).length} files.`);
