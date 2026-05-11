/**
 * Personas for the Cultivated AI "for owners" briefing.
 *
 * Each persona drives Page 3 of the briefing PDF (the "Meet ___" page),
 * showing how the four stages of Cultivated AI play out in one specific
 * leader's career. Add a new persona by appending an entry to the
 * `personas` record below; the dynamic route at
 * `/cultivated-ai/for-owners/[persona]` will pick it up automatically.
 *
 * Fields can use a small subset of inline HTML: <em>...</em> for accent
 * italics. Avoid em dashes in any string.
 */

export interface PersonaStage2 {
  lede: string;
  playbooks: string[];
}

export interface PersonaStage3 {
  lede: string;
  playbooks: string[];
}

export interface PersonaStage4 {
  lede: string;
  environments: string[];
}

/**
 * One stage on the persona-driven pitch deck (slides 10-13).
 * Each item is HTML; may include <em>...</em> for the italic accent word.
 */
export interface PersonaPitchStage {
  /** Intro paragraph above the list. */
  intro: string;
  /** Ordered list items. */
  items: string[];
  /** Footnote line after the list. */
  footnote: string;
}

/**
 * Persona-specific copy for the four "Meet ___" slides on the pitch deck.
 * Optional on Persona: a persona without `pitch` will not appear on the
 * /cultivated-ai/pitch/[persona] route (returns 404 at build time).
 */
export interface PersonaPitch {
  /** Job title used in slide 10 intro, e.g., "Head of Credit". */
  role: string;
  stage1: PersonaPitchStage;
  stage2: PersonaPitchStage;
  stage3: PersonaPitchStage;
  stage4: PersonaPitchStage;
}

export interface Persona {
  /** URL slug. Lowercase, kebab-case. */
  slug: string;
  /** Footer label for Page 3, e.g., "Priya · Finwizz". */
  pageLabel: string;
  /** Document title suffix, e.g., "for Finwizz". */
  briefingFor: string;
  /** First name shown in the page title. */
  firstName: string;
  /** One-paragraph intro under the title. */
  intro: string;
  /** Stage 1: four short principle phrases. May include <em>...</em>. */
  stage1Principles: string[];
  stage2: PersonaStage2;
  stage3: PersonaStage3;
  stage4: PersonaStage4;
  /** Optional: pitch-deck-specific copy for slides 10-13. */
  pitch?: PersonaPitch;
}

const SHARED_STAGE_1: string[] = [
  'Plan for the AI of <em>tomorrow</em>',
  'Ask AI to ask <em>you</em> the questions',
  'Ask AI for help <em>with</em> AI',
  'Cross-check answers with another AI',
];

export const personas: Record<string, Persona> = {
  finwizz: {
    slug: 'finwizz',
    pageLabel: 'Priya · Finwizz',
    briefingFor: 'for Finwizz Financial Services',
    firstName: 'Priya',
    intro:
      'Priya is Head of Credit at Finwizz Financial Services, an Indian NBFC originating collateral-free MSME and business loans. She runs an underwriting team of credit officers, sets the deviation policy, and signs off on every file before sanction.',
    stage1Principles: SHARED_STAGE_1,
    stage2: {
      lede:
        "What was in Priya's head for a decade now runs as agentic skills, in her voice, at her standard, on every file, every day. These are her first five.",
      playbooks: [
        'Credit Memo Drafter',
        'Bank Statement Triangulator',
        'Bureau Report Synthesiser',
        'Deviation Audit',
        'Sanction Letter Drafter',
      ],
    },
    stage3: {
      lede:
        "Priya did not write these. Her peers across Finwizz did, in the same cohort. She runs them daily. <em>Your best work stops being rare, and starts being the default.</em>",
      playbooks: [
        "Collections' settlement-letter drafter",
        "Risk team's portfolio stress-test scenarios",
        "Ops' KYC anomaly scanner",
      ],
    },
    stage4: {
      lede:
        'Synthetic AI environments her competitors cannot build. For Priya, these are unlocks that simply were not possible before.',
      environments: [
        'Credit committee rehearsals against AI committee members',
        'Borrower-default scenarios at month 18',
        'New-product underwriting policy dry-runs',
        'RBI inspection response drills',
        'Onboarding simulations for new credit officers',
      ],
    },
    pitch: {
      role: 'Head of Credit',
      stage1: {
        intro: '<em>Priya</em>, Head of Credit. She has completed Stage 1. This is how she now thinks.',
        items: [
          'Plan for the AI of <em>tomorrow</em>, not the LOS plug-in of today.',
          'Ask AI to ask <em>you</em> the questions before you underwrite the borrower.',
          'Ask AI for help <em>with</em> AI. Choosing tools, not just using them.',
          'Cross-check answers <em>with another AI</em> before they go in the credit memo.',
        ],
        footnote: 'Priya is working on a Bureau Read Rubric &rarr;',
      },
      stage2: {
        intro: "What was between <em>Priya's ears</em> now runs as agentic AI, at scale, in her voice. These are her first five playbooks.",
        items: [
          'Credit Memo <em>Drafter</em>.',
          'Bank Statement <em>Triangulator</em>.',
          'Bureau Report <em>Reader</em>.',
          'Policy-Deviation <em>Note</em>.',
          'Sanction Letter <em>Composer</em>.',
        ],
        footnote: 'These spread to her cohort next &rarr;',
      },
      stage3: {
        intro: "Priya inherits the <em>cohort's</em> playbooks. She didn't write them, but she runs them daily via AI.",
        items: [
          "Collections' delinquency <em>call-brief</em>.",
          "Risk's early-warning <em>signal scan</em>.",
          "Operations' file-completeness <em>check</em>.",
        ],
        footnote: 'Her own playbooks are proliferating outward, too &rarr;',
      },
      stage4: {
        intro: "Priya uses synthetic AI environments for <em>strategy, preparation, and training</em>. Her own, and her team's.",
        items: [
          'Borrower interview <em>rehearsals</em> against AI counterparties.',
          'Portfolio <em>stress scenarios</em> for credit-policy review.',
          'RBI inspection <em>dry-runs</em> before audit week.',
          'Branch fraud-pattern <em>drills</em> with her direct reports.',
          'Onboarding <em>simulations</em> for new credit officers.',
        ],
        footnote: "Unlocks that simply weren't possible without AI &rarr;",
      },
    },
  },
};

export const personaSlugs = Object.keys(personas);
