BEGIN;
CREATE TABLE public.studio_direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(btrim(content)) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (sender_id <> recipient_id)
);
CREATE INDEX studio_dm_sender_time ON public.studio_direct_messages(sender_id, created_at DESC);
CREATE INDEX studio_dm_recipient_time ON public.studio_direct_messages(recipient_id, created_at DESC);
CREATE INDEX studio_dm_workspace ON public.studio_direct_messages(workspace_id);
ALTER TABLE public.studio_direct_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.studio_direct_messages FROM anon, authenticated;
GRANT SELECT, INSERT ON public.studio_direct_messages TO authenticated;
CREATE POLICY studio_dm_read ON public.studio_direct_messages FOR SELECT TO authenticated
USING (sender_id = (SELECT auth.uid()) OR recipient_id = (SELECT auth.uid()));
CREATE POLICY studio_dm_send ON public.studio_direct_messages FOR INSERT TO authenticated
WITH CHECK (
 sender_id = (SELECT auth.uid())
 AND EXISTS (SELECT 1 FROM public.workspace_members m WHERE m.workspace_id = studio_direct_messages.workspace_id AND m.user_id = (SELECT auth.uid()))
 AND EXISTS (SELECT 1 FROM public.workspace_members m WHERE m.workspace_id = studio_direct_messages.workspace_id AND m.user_id = studio_direct_messages.recipient_id)
);
ALTER PUBLICATION supabase_realtime ADD TABLE public.studio_direct_messages;
COMMIT;
