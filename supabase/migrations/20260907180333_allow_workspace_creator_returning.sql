-- INSERT ... RETURNING evaluates the SELECT policy before the AFTER INSERT
-- membership trigger is visible. The creator is the workspace owner, so allow
-- that same authenticated user to read the row during creation.
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON public.workspaces;
CREATE POLICY "Users can view workspaces they are members of"
  ON public.workspaces FOR SELECT TO authenticated
  USING (
    owner_id = (SELECT auth.uid())
    OR public.is_workspace_member(id)
  );
