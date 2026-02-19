CREATE TABLE public.votes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  idea_id uuid NOT NULL,
  voter_nickname text NOT NULL,
  voter_id text NOT NULL,
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT votes_pkey PRIMARY KEY (id),
  CONSTRAINT votes_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id),
  CONSTRAINT votes_idea_id_fkey FOREIGN KEY (idea_id) REFERENCES public.ideas(id)
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
