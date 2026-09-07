-- Replace callable SECURITY DEFINER RPCs with RLS-controlled inserts and a
-- private trigger. The trigger is never exposed through the Data API.
DROP FUNCTION IF EXISTS public.create_workspace_invite(UUID);
DROP FUNCTION IF EXISTS public.accept_workspace_invite(UUID, TEXT);

CREATE POLICY "Workspace owners and leads can view invite links"
  ON public.workspace_invites FOR SELECT TO authenticated
  USING (private.has_workspace_role(workspace_id, ARRAY['owner', 'lead']));

CREATE POLICY "Workspace owners and leads can create invite links"
  ON public.workspace_invites FOR INSERT TO authenticated
  WITH CHECK (
    created_by = (SELECT auth.uid())
    AND private.has_workspace_role(workspace_id, ARRAY['owner', 'lead'])
  );

GRANT SELECT, INSERT ON public.workspace_invites TO authenticated;

CREATE TABLE public.workspace_invite_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_token UUID NOT NULL,
  claimer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_role TEXT NOT NULL CHECK (requested_role IN ('lead', 'member', 'guest')),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  assigned_role TEXT CHECK (assigned_role IN ('lead', 'member', 'guest')),
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (invite_token, claimer_id)
);

CREATE INDEX idx_workspace_invite_claims_claimer
  ON public.workspace_invite_claims (claimer_id, claimed_at DESC);

ALTER TABLE public.workspace_invite_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invite claims"
  ON public.workspace_invite_claims FOR SELECT TO authenticated
  USING (claimer_id = (SELECT auth.uid()));

CREATE POLICY "Users can claim an invite for themselves"
  ON public.workspace_invite_claims FOR INSERT TO authenticated
  WITH CHECK (
    claimer_id = (SELECT auth.uid())
    AND requested_role IN ('lead', 'member', 'guest')
  );

GRANT SELECT, INSERT ON public.workspace_invite_claims TO authenticated;

CREATE OR REPLACE FUNCTION private.claim_workspace_invite()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
  invited_workspace_id UUID;
BEGIN
  IF NEW.claimer_id <> (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'Invite claims must be made for the signed-in user'
      USING ERRCODE = '42501';
  END IF;

  SELECT wi.workspace_id
  INTO invited_workspace_id
  FROM public.workspace_invites AS wi
  WHERE wi.token = NEW.invite_token
    AND wi.revoked_at IS NULL
    AND wi.expires_at > now();

  IF invited_workspace_id IS NULL THEN
    RAISE EXCEPTION 'This invite link is invalid, revoked, or expired'
      USING ERRCODE = '22023';
  END IF;

  NEW.workspace_id := invited_workspace_id;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (invited_workspace_id, NEW.claimer_id, NEW.requested_role)
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  SELECT wm.role
  INTO NEW.assigned_role
  FROM public.workspace_members AS wm
  WHERE wm.workspace_id = invited_workspace_id
    AND wm.user_id = NEW.claimer_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_workspace_invite_claimed ON public.workspace_invite_claims;
CREATE TRIGGER on_workspace_invite_claimed
  BEFORE INSERT ON public.workspace_invite_claims
  FOR EACH ROW EXECUTE FUNCTION private.claim_workspace_invite();

REVOKE ALL ON FUNCTION private.claim_workspace_invite() FROM PUBLIC, anon, authenticated, service_role;
