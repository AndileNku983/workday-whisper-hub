CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  job_title text,
  department text,
  email_notifications boolean NOT NULL DEFAULT true,
  task_reminders boolean NOT NULL DEFAULT true,
  save_chat_history boolean NOT NULL DEFAULT true,
  share_usage_analytics boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'todo',
  assignee text,
  due_date timestamptz,
  reminder boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tasks_user_idx ON public.tasks(user_id, due_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tasks all" ON public.tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message_id text NOT NULL,
  role text NOT NULL,
  parts jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, message_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own chat all" ON public.chat_messages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, job_title)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), 'Team member');
  INSERT INTO public.tasks (user_id, title, description, priority, status, assignee, due_date, reminder) VALUES
   (NEW.id, 'Prepare Q4 budget review', 'Consolidate department spend and forecast for leadership meeting', 'urgent', 'in_progress', 'Me', now() + interval '1 day', true),
   (NEW.id, 'Reply to client contract questions', 'Address clauses 4.2 and 7.1 raised by Meridian Corp', 'high', 'todo', 'Me', now() + interval '6 hours', true),
   (NEW.id, 'Weekly team sync agenda', 'Collect updates from the product and design leads', 'medium', 'todo', 'Sarah Chen', now() + interval '2 days', false),
   (NEW.id, 'Onboard new analyst', 'Set up accounts and schedule intro sessions', 'medium', 'todo', 'James Okafor', now() + interval '4 days', false),
   (NEW.id, 'Update project roadmap', 'Reflect revised launch timeline in the shared roadmap', 'low', 'todo', 'Me', now() + interval '6 days', false),
   (NEW.id, 'Submit expense report', 'September travel and client lunch receipts', 'low', 'done', 'Me', now() - interval '1 day', false);
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();