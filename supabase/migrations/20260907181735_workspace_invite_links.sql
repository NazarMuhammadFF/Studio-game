-- Workspace invite links let an authenticated recipient choose a non-owner role.
-- The link token is intentionally opaque; direct table access remains disabled.
CREATE TABLE public.workspace_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workspace_invites_workspace_active
  ON public.workspace_invites (workspace_id, expires_at)
  WHERE revoked_at IS NULL;

ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.create_workspace_invite(target_workspace_id UUID)
RETURNS TABLE (token UUID, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL
    OR NOT private.has_workspace_role(target_workspace_id, ARRAY['owner', 'lead']) THEN
    RAISE EXCEPTION 'Only workspace owners and leads can create invite links'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  INSERT INTO public.workspace_invites (workspace_id, created_by)
  VALUES (target_workspace_id, (SELECT auth.uid()))
  RETURNING workspace_invites.token, workspace_invites.expires_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_workspace_invite(
  invite_token UUID,
  requested_role TEXT
)
RETURNS TABLE (workspace_id UUID, workspace_name TEXT, assigned_role TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
  invited_workspace_id UUID;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Sign in before accepting an invite link' USING ERRCODE = '42501';
  END IF;

  IF requested_role NOT IN ('lead', 'member', 'guest') THEN
    RAISE EXCEPTION 'Invite recipients cannot choose the owner role' USING ERRCODE = '22023';
  END IF;

  SELECT wi.workspace_id
  INTO invited_workspace_id
  FROM public.workspace_invites AS wi
  WHERE wi.token = invite_token
    AND wi.revoked_at IS NULL
    AND wi.expires_at > now();

  IF invited_workspace_id IS NULL THEN
    RAISE EXCEPTION 'This invite link is invalid, revoked, or expired' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (invited_workspace_id, (SELECT auth.uid()), requested_role)
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  RETURN QUERY
  SELECT w.id, w.name, wm.role
  FROM public.workspaces AS w
  JOIN public.workspace_members AS wm
    ON wm.workspace_id = w.id
   AND wm.user_id = (SELECT auth.uid())
  WHERE w.id = invited_workspace_id;
END;
$$;

REVOKE ALL ON TABLE public.workspace_invites FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.create_workspace_invite(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.accept_workspace_invite(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_workspace_invite(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_workspace_invite(UUID, TEXT) TO authenticated;
