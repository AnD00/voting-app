CREATE TABLE public.ideas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ideas_pkey PRIMARY KEY (id),
  CONSTRAINT ideas_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id)
);
