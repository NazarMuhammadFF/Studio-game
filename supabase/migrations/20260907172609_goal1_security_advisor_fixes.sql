-- Resolve Goal 1 database advisor findings without changing product behavior.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_workspace_member(target_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members AS wm
    WHERE wm.workspace_id = target_workspace_id
      AND wm.user_id = (SELECT auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION private.has_workspace_role(target_workspace_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members AS wm
    WHERE wm.workspace_id = target_workspace_id
      AND wm.user_id = (SELECT auth.uid())
      AND wm.role = ANY(allowed_roles)
  );
$$;

CREATE OR REPLACE FUNCTION private.is_project_lead(target_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_members AS pm
    WHERE pm.project_id = target_project_id
      AND pm.user_id = (SELECT auth.uid())
      AND pm.project_role = 'lead'
  );
$$;

REVOKE ALL ON FUNCTION private.is_workspace_member(UUID) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION private.has_workspace_role(UUID, TEXT[]) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION private.is_project_lead(UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_workspace_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_workspace_role(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_project_lead(UUID) TO authenticated;

-- Public wrappers remain compatible with existing policies, but no longer run
-- with elevated privileges and cannot be reached by anonymous clients.
CREATE OR REPLACE FUNCTION public.is_workspace_member(target_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT private.is_workspace_member(target_workspace_id);
$$;

CREATE OR REPLACE FUNCTION public.has_workspace_role(target_workspace_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT private.has_workspace_role(target_workspace_id, allowed_roles);
$$;

CREATE OR REPLACE FUNCTION public.is_project_lead(target_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT private.is_project_lead(target_project_id);
$$;

REVOKE ALL ON FUNCTION public.is_workspace_member(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_workspace_role(UUID, TEXT[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_project_lead(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_workspace_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_workspace_role(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_project_lead(UUID) TO authenticated;

-- Trigger functions are invoked by their triggers, never through the Data API.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.handle_new_workspace() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.handle_new_project() FROM PUBLIC, anon, authenticated, service_role;

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON public.workspaces;
CREATE POLICY "Authenticated users can create workspaces"
  ON public.workspaces FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = owner_id);

DROP POLICY IF EXISTS "Only workspace owners can delete workspace" ON public.workspaces;
CREATE POLICY "Only workspace owners can delete workspace"
  ON public.workspaces FOR DELETE TO authenticated
  USING (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Members can leave or owners/leads can remove members" ON public.workspace_members;
CREATE POLICY "Members can leave or owners/leads can remove members"
  ON public.workspace_members FOR DELETE TO authenticated
  USING (
    role <> 'owner'
    AND (
      user_id = (SELECT auth.uid())
      OR public.has_workspace_role(workspace_id, ARRAY['owner', 'lead'])
    )
  );

DROP POLICY IF EXISTS "Workspace owners, leads and members can create projects" ON public.projects;
CREATE POLICY "Workspace owners, leads and members can create projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = created_by
    AND public.has_workspace_role(workspace_id, ARRAY['owner', 'lead', 'member'])
  );

DROP POLICY IF EXISTS "Project members can leave or leads can remove members" ON public.project_members;
CREATE POLICY "Project members can leave or leads can remove members"
  ON public.project_members FOR DELETE TO authenticated
  USING (
    (user_id = (SELECT auth.uid()) AND project_role <> 'lead')
    OR public.is_project_lead(project_id)
    OR EXISTS (
      SELECT 1
      FROM public.projects
      WHERE projects.id = project_members.project_id
        AND public.has_workspace_role(projects.workspace_id, ARRAY['owner', 'lead'])
    )
  );
