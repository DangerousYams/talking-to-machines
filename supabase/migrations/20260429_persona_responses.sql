-- Persona survey responses (Chapter 2 personalization interview)
-- Internal data-mining table. Captures the survey selections + AI-generated
-- context. Inserted client-side from PersonalizeInterview.tsx after the
-- user completes the flow.

CREATE TABLE IF NOT EXISTS public.persona_responses (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id         text,
  customer_id        text,
  is_paid            boolean,
  profession         text NOT NULL,
  profession_detail  text,
  ai_experience      text NOT NULL,
  goals              text[] NOT NULL DEFAULT '{}',
  challenge          text,
  context            text,
  keywords           text[] NOT NULL DEFAULT '{}',
  locale             text,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS persona_responses_session_id_idx
  ON public.persona_responses (session_id);
CREATE INDEX IF NOT EXISTS persona_responses_customer_id_idx
  ON public.persona_responses (customer_id);
CREATE INDEX IF NOT EXISTS persona_responses_created_at_idx
  ON public.persona_responses (created_at DESC);

ALTER TABLE public.persona_responses ENABLE ROW LEVEL SECURITY;

-- Anonymous clients may insert their own responses (matches the pattern used
-- by course_survey_responses and analytics tables). No SELECT policy means
-- only the service role can read — this is internal data.
CREATE POLICY "anon_insert_persona_responses"
  ON public.persona_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
