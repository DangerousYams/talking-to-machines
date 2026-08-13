-- Cultivated AI "nice to meet you" questionnaire responses.
-- Inserted client-side from HelloSurvey.tsx (/cultivated-ai/hello).
-- Mirrors the course_survey_responses pattern: anon insert + anon select,
-- so a dashboard can read it with the public key later.

CREATE TABLE IF NOT EXISTS public.cultivated_survey_responses (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort         text NOT NULL DEFAULT 'bakers-dozen',
  name           text NOT NULL,
  world          text[] NOT NULL DEFAULT '{}',
  frequency      text,
  ai_tools       text[] NOT NULL DEFAULT '{}',
  ai_tools_other text,
  laptop         text[] NOT NULL DEFAULT '{}',
  handover       text[] NOT NULL DEFAULT '{}',
  handover_other text,
  worries        text[] NOT NULL DEFAULT '{}',
  last_word      text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cultivated_survey_cohort_idx
  ON public.cultivated_survey_responses (cohort);
CREATE INDEX IF NOT EXISTS cultivated_survey_created_at_idx
  ON public.cultivated_survey_responses (created_at DESC);

ALTER TABLE public.cultivated_survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_cultivated_survey"
  ON public.cultivated_survey_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "anon_select_cultivated_survey"
  ON public.cultivated_survey_responses
  FOR SELECT
  TO anon, authenticated
  USING (true);
