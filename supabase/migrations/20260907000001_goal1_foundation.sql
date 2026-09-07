-- ============================================================================
-- GOAL 1: FOUNDATION MIGRATION
-- Virtual Game Dev Studio
-- ============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    avatar_config JSONB DEFAULT '{"skinColor": "#f5d0b5", "hairColor": "#4a2c11", "shirtColor": "#3b82f6", "style": "casual"}'::jsonb,
    discipline TEXT DEFAULT 'Programmer' CHECK (discipline IN ('Programmer', 'Artist', 'Game Designer', 'Audio', 'Writer', 'QA', 'Producer', 'Other')),
    status_message TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on username for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- 2. Workspaces Table
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON public.workspaces(slug);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON public.workspaces(owner_id);

-- 3. Workspace Members Table
CREATE TABLE IF NOT EXISTS public.workspace_members (
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'lead', 'member', 'guest')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members(user_id);

-- 4. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'paused', 'completed')),
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_workspace ON public.projects(workspace_id);

-- 5. Project Members Table
CREATE TABLE IF NOT EXISTS public.project_members (
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_role TEXT NOT NULL DEFAULT 'member' CHECK (project_role IN ('lead', 'member', 'guest')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_user ON public.project_members(user_id);

-- ============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to handle new user registration -> profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    clean_username TEXT;
    raw_name TEXT;
BEGIN
    raw_name := COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1));
    clean_username := lower(regexp_replace(COALESCE(NEW.raw_user_meta_data->>'username', raw_name), '[^a-zA-Z0-9_]', '', 'g'));
    
    -- Ensure username is not empty
    IF clean_username = '' THEN
        clean_username := 'user_' || substr(NEW.id::text, 1, 8);
    END IF;

    -- Handle potential collisions by appending random suffix if needed
    BEGIN
        INSERT INTO public.profiles (id, display_name, username, discipline)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'display_name', raw_name),
            clean_username,
            COALESCE(NEW.raw_user_meta_data->>'discipline', 'Programmer')
        );
    EXCEPTION WHEN unique_violation THEN
        INSERT INTO public.profiles (id, display_name, username, discipline)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'display_name', raw_name),
            clean_username || '_' || substr(gen_random_uuid()::text, 1, 4),
            COALESCE(NEW.raw_user_meta_data->>'discipline', 'Programmer')
        );
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for auto-adding workspace creator as owner in workspace_members
CREATE OR REPLACE FUNCTION public.handle_new_workspace()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner')
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_workspace_created ON public.workspaces;
CREATE TRIGGER on_workspace_created
    AFTER INSERT ON public.workspaces
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_workspace();

-- Trigger for auto-adding project creator as lead in project_members
CREATE OR REPLACE FUNCTION public.handle_new_project()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.project_members (project_id, user_id, project_role)
    VALUES (NEW.id, NEW.created_by, 'lead')
    ON CONFLICT (project_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_project_created ON public.projects;
CREATE TRIGGER on_project_created
    AFTER INSERT ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_project();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Workspaces Policies
CREATE POLICY "Users can view workspaces they are members of"
    ON public.workspaces FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = workspaces.id
            AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create workspaces"
    ON public.workspaces FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspace owners and leads can update workspace"
    ON public.workspaces FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = workspaces.id
            AND workspace_members.user_id = auth.uid()
            AND workspace_members.role IN ('owner', 'lead')
        )
    );

CREATE POLICY "Only workspace owners can delete workspace"
    ON public.workspaces FOR DELETE
    TO authenticated
    USING (owner_id = auth.uid());

-- Workspace Members Policies
CREATE POLICY "Members can view other members of their workspaces"
    ON public.workspace_members FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members AS self_member
            WHERE self_member.workspace_id = workspace_members.workspace_id
            AND self_member.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace owners and leads can add members"
    ON public.workspace_members FOR INSERT
    TO authenticated
    WITH CHECK (
        -- User can add self if creating workspace (handled via trigger or check)
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.workspace_members AS lead_check
            WHERE lead_check.workspace_id = workspace_members.workspace_id
            AND lead_check.user_id = auth.uid()
            AND lead_check.role IN ('owner', 'lead')
        )
    );

CREATE POLICY "Workspace owners and leads can update member roles"
    ON public.workspace_members FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members AS lead_check
            WHERE lead_check.workspace_id = workspace_members.workspace_id
            AND lead_check.user_id = auth.uid()
            AND lead_check.role IN ('owner', 'lead')
        )
    );

CREATE POLICY "Members can leave or owners/leads can remove members"
    ON public.workspace_members FOR DELETE
    TO authenticated
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.workspace_members AS lead_check
            WHERE lead_check.workspace_id = workspace_members.workspace_id
            AND lead_check.user_id = auth.uid()
            AND lead_check.role IN ('owner', 'lead')
        )
    );

-- Projects Policies
CREATE POLICY "Members of the workspace can view projects"
    ON public.projects FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = projects.workspace_id
            AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace owners, leads and members can create projects"
    ON public.projects FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = projects.workspace_id
            AND workspace_members.user_id = auth.uid()
            AND workspace_members.role IN ('owner', 'lead', 'member')
        )
    );

CREATE POLICY "Workspace owners, leads or project leads can update projects"
    ON public.projects FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = projects.workspace_id
            AND workspace_members.user_id = auth.uid()
            AND workspace_members.role IN ('owner', 'lead')
        ) OR
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_id = projects.id
            AND project_members.user_id = auth.uid()
            AND project_members.project_role = 'lead'
        )
    );

CREATE POLICY "Only workspace owners or leads can delete projects"
    ON public.projects FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = projects.workspace_id
            AND workspace_members.user_id = auth.uid()
            AND workspace_members.role IN ('owner', 'lead')
        )
    );

-- Project Members Policies
CREATE POLICY "Workspace members can view project members"
    ON public.project_members FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            JOIN public.workspace_members ON workspace_members.workspace_id = projects.workspace_id
            WHERE projects.id = project_members.project_id
            AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Project leads or workspace leads can add project members"
    ON public.project_members FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.projects
            JOIN public.workspace_members ON workspace_members.workspace_id = projects.workspace_id
            WHERE projects.id = project_members.project_id
            AND workspace_members.user_id = auth.uid()
            AND workspace_members.role IN ('owner', 'lead')
        ) OR
        EXISTS (
            SELECT 1 FROM public.project_members AS self_lead
            WHERE self_lead.project_id = project_members.project_id
            AND self_lead.user_id = auth.uid()
            AND self_lead.project_role = 'lead'
        )
    );

CREATE POLICY "Project leads or workspace leads can update project members"
    ON public.project_members FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            JOIN public.workspace_members ON workspace_members.workspace_id = projects.workspace_id
            WHERE projects.id = project_members.project_id
            AND workspace_members.user_id = auth.uid()
            AND workspace_members.role IN ('owner', 'lead')
        ) OR
        EXISTS (
            SELECT 1 FROM public.project_members AS self_lead
            WHERE self_lead.project_id = project_members.project_id
            AND self_lead.user_id = auth.uid()
            AND self_lead.project_role = 'lead'
        )
    );

CREATE POLICY "Project members can leave or leads can remove members"
    ON public.project_members FOR DELETE
    TO authenticated
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.projects
            JOIN public.workspace_members ON workspace_members.workspace_id = projects.workspace_id
            WHERE projects.id = project_members.project_id
            AND workspace_members.user_id = auth.uid()
            AND workspace_members.role IN ('owner', 'lead')
        ) OR
        EXISTS (
            SELECT 1 FROM public.project_members AS self_lead
            WHERE self_lead.project_id = project_members.project_id
            AND self_lead.user_id = auth.uid()
            AND self_lead.project_role = 'lead'
        )
    );
