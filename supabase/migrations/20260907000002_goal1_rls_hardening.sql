-- Goal 1 hardening: avoid recursive membership policies and prevent self-joining.

ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_workspace() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_project() SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.is_workspace_member(target_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = target_workspace_id
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.has_workspace_role(target_workspace_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = target_workspace_id
      AND user_id = auth.uid()
      AND role = ANY(allowed_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_lead(target_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_members
    WHERE project_id = target_project_id
      AND user_id = auth.uid()
      AND project_role = 'lead'
  );
$$;

REVOKE ALL ON FUNCTION public.is_workspace_member(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_workspace_role(UUID, TEXT[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_project_lead(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_workspace_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_workspace_role(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_project_lead(UUID) TO authenticated;

DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON public.workspaces;
CREATE POLICY "Users can view workspaces they are members of"
  ON public.workspaces FOR SELECT TO authenticated
  USING (public.is_workspace_member(id));

DROP POLICY IF EXISTS "Workspace owners and leads can update workspace" ON public.workspaces;
CREATE POLICY "Workspace owners and leads can update workspace"
  ON public.workspaces FOR UPDATE TO authenticated
  USING (public.has_workspace_role(id, ARRAY['owner', 'lead']))
  WITH CHECK (public.has_workspace_role(id, ARRAY['owner', 'lead']));

DROP POLICY IF EXISTS "Members can view other members of their workspaces" ON public.workspace_members;
CREATE POLICY "Members can view other members of their workspaces"
  ON public.workspace_members FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Workspace owners and leads can add members" ON public.workspace_members;
CREATE POLICY "Workspace owners and leads can add members"
  ON public.workspace_members FOR INSERT TO authenticated
  WITH CHECK (
    role <> 'owner'
    AND public.has_workspace_role(workspace_id, ARRAY['owner', 'lead'])
  );

DROP POLICY IF EXISTS "Workspace owners and leads can update member roles" ON public.workspace_members;
CREATE POLICY "Workspace owners and leads can update member roles"
  ON public.workspace_members FOR UPDATE TO authenticated
  USING (
    role <> 'owner'
    AND public.has_workspace_role(workspace_id, ARRAY['owner', 'lead'])
  )
  WITH CHECK (
    role <> 'owner'
    AND public.has_workspace_role(workspace_id, ARRAY['owner', 'lead'])
  );

DROP POLICY IF EXISTS "Members can leave or owners/leads can remove members" ON public.workspace_members;
CREATE POLICY "Members can leave or owners/leads can remove members"
  ON public.workspace_members FOR DELETE TO authenticated
  USING (
    role <> 'owner'
    AND (
      user_id = auth.uid()
      OR public.has_workspace_role(workspace_id, ARRAY['owner', 'lead'])
    )
  );

DROP POLICY IF EXISTS "Members of the workspace can view projects" ON public.projects;
CREATE POLICY "Members of the workspace can view projects"
  ON public.projects FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Workspace owners, leads and members can create projects" ON public.projects;
CREATE POLICY "Workspace owners, leads and members can create projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND public.has_workspace_role(workspace_id, ARRAY['owner', 'lead', 'member'])
  );

DROP POLICY IF EXISTS "Workspace owners, leads or project leads can update projects" ON public.projects;
CREATE POLICY "Workspace owners, leads or project leads can update projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (
    public.has_workspace_role(workspace_id, ARRAY['owner', 'lead'])
    OR public.is_project_lead(id)
  )
  WITH CHECK (
    public.has_workspace_role(workspace_id, ARRAY['owner', 'lead'])
    OR public.is_project_lead(id)
  );

DROP POLICY IF EXISTS "Only workspace owners or leads can delete projects" ON public.projects;
CREATE POLICY "Only workspace owners or leads can delete projects"
  ON public.projects FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, ARRAY['owner', 'lead']));

DROP POLICY IF EXISTS "Workspace members can view project members" ON public.project_members;
CREATE POLICY "Workspace members can view project members"
  ON public.project_members FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects
      WHERE projects.id = project_members.project_id
        AND public.is_workspace_member(projects.workspace_id)
    )
  );

DROP POLICY IF EXISTS "Project leads or workspace leads can add project members" ON public.project_members;
CREATE POLICY "Project leads or workspace leads can add project members"
  ON public.project_members FOR INSERT TO authenticated
  WITH CHECK (
    public.is_project_lead(project_id)
    OR EXISTS (
      SELECT 1
      FROM public.projects
      WHERE projects.id = project_members.project_id
        AND public.has_workspace_role(projects.workspace_id, ARRAY['owner', 'lead'])
    )
  );

DROP POLICY IF EXISTS "Project leads or workspace leads can update project members" ON public.project_members;
CREATE POLICY "Project leads or workspace leads can update project members"
  ON public.project_members FOR UPDATE TO authenticated
  USING (
    public.is_project_lead(project_id)
    OR EXISTS (
      SELECT 1
      FROM public.projects
      WHERE projects.id = project_members.project_id
        AND public.has_workspace_role(projects.workspace_id, ARRAY['owner', 'lead'])
    )
  )
  WITH CHECK (
    public.is_project_lead(project_id)
    OR EXISTS (
      SELECT 1
      FROM public.projects
      WHERE projects.id = project_members.project_id
        AND public.has_workspace_role(projects.workspace_id, ARRAY['owner', 'lead'])
    )
  );

DROP POLICY IF EXISTS "Project members can leave or leads can remove members" ON public.project_members;
CREATE POLICY "Project members can leave or leads can remove members"
  ON public.project_members FOR DELETE TO authenticated
  USING (
    (user_id = auth.uid() AND project_role <> 'lead')
    OR public.is_project_lead(project_id)
    OR EXISTS (
      SELECT 1
      FROM public.projects
      WHERE projects.id = project_members.project_id
        AND public.has_workspace_role(projects.workspace_id, ARRAY['owner', 'lead'])
    )
  );
