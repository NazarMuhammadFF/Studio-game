import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured, mockStore } from '@/lib/supabase';
import { Workspace, WorkspaceMember, Project, ProjectMember, UserRole } from '@/types/database.types';
import { useAuth } from './AuthContext';

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  userRoleInWorkspace: UserRole | null;
  workspaceMembers: WorkspaceMember[];
  projects: Project[];
  currentProject: Project | null;
  userRoleInProject: 'lead' | 'member' | 'guest' | null;
  projectMembers: ProjectMember[];
  loading: boolean;
  error: string | null;
  selectWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string, slug?: string) => Promise<Workspace | null>;
  addMemberToWorkspace: (userId: string, role: UserRole) => Promise<boolean>;
  createWorkspaceInvite: () => Promise<{ token: string; expiresAt: string } | null>;
  acceptWorkspaceInvite: (token: string, role: Exclude<UserRole, 'owner'>) => Promise<{ workspaceId: string; workspaceName: string; role: string } | null>;
  selectProject: (projectId: string | null) => void;
  createProject: (name: string, description?: string) => Promise<Project | null>;
  refreshWorkspaceData: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const isUUID = (id?: string) =>
  Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const useRealDatabase = Boolean(isSupabaseConfigured && profile && isUUID(profile.id));

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [userRoleInWorkspace, setUserRoleInWorkspace] = useState<UserRole | null>(null);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [userRoleInProject, setUserRoleInProject] = useState<'lead' | 'member' | 'guest' | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch workspaces for current user
  const fetchWorkspaces = useCallback(async () => {
    if (!profile) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (useRealDatabase) {
        // Query user's workspaces via workspace_members
        const { data: memberRows, error: memberErr } = await supabase
          .from('workspace_members')
          .select('workspace_id, role, workspaces(*)')
          .eq('user_id', profile.id);

        if (memberErr) throw memberErr;

        const wsList = (memberRows || []).map((row: any) => row.workspaces as Workspace).filter(Boolean);
        setWorkspaces(wsList);

        if (wsList.length > 0) {
          // Preserve current selection or select the first workspace
          const selected = currentWorkspace
            ? wsList.find((w) => w.id === currentWorkspace.id) || wsList[0]
            : wsList[0];
          setCurrentWorkspace(selected);
        } else {
          // Auto-provision initial studio workspace so user lands directly in Virtual Studio
          try {
            const cleanSlug = `studio-${profile.id.slice(0, 8)}`;
            const { data: newWs, error: wsCreateErr } = await supabase
              .from('workspaces')
              .insert({
                name: 'Virtual Dev Studio',
                slug: cleanSlug,
                owner_id: profile.id,
              })
              .select()
              .single();

            if (!wsCreateErr && newWs) {
              setWorkspaces([newWs as Workspace]);
              setCurrentWorkspace(newWs as Workspace);
            } else {
              setCurrentWorkspace(null);
            }
          } catch {
            setCurrentWorkspace(null);
          }
        }
      } else {
        const wsList = mockStore.getWorkspaces(profile.id);
        setWorkspaces(wsList);
        if (wsList.length > 0) {
          const selected = currentWorkspace
            ? wsList.find((w) => w.id === currentWorkspace.id) || wsList[0]
            : wsList[0];
          setCurrentWorkspace(selected);
        } else {
          setCurrentWorkspace(null);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch workspaces:', err);
      setError(err.message || 'Failed to fetch workspaces');
    } finally {
      setLoading(false);
    }
  }, [profile, currentWorkspace?.id]);

  // Fetch details when currentWorkspace changes
  const fetchWorkspaceDetails = useCallback(async () => {
    if (!currentWorkspace || !profile) {
      setWorkspaceMembers([]);
      setProjects([]);
      setCurrentProject(null);
      setUserRoleInWorkspace(null);
      return;
    }

    try {
      if (useRealDatabase) {
        // 1. Fetch workspace members
        const { data: members, error: memErr } = await supabase
          .from('workspace_members')
          .select('*, profile:profiles(*)')
          .eq('workspace_id', currentWorkspace.id);

        if (memErr) throw memErr;
        setWorkspaceMembers(members as WorkspaceMember[]);

        const myMembership = (members || []).find((m: any) => m.user_id === profile.id);
        setUserRoleInWorkspace(myMembership?.role || null);

        // 2. Fetch projects for this workspace
        const { data: projList, error: projErr } = await supabase
          .from('projects')
          .select('*')
          .eq('workspace_id', currentWorkspace.id);

        if (projErr) throw projErr;
        const validProjects = (projList || []) as Project[];
        setProjects(validProjects);

        // Auto-select first project so app lands directly in game view
        if (validProjects.length > 0) {
          if (!currentProject || !validProjects.some((p) => p.id === currentProject.id)) {
            setCurrentProject(validProjects[0]);
          }
        } else {
          // Auto-provision initial game project for workspace
          try {
            const { data: newProj, error: pCreateErr } = await supabase
              .from('projects')
              .insert({
                workspace_id: currentWorkspace.id,
                name: 'Studio Cyber Runner',
                description: 'Primary studio game project',
                created_by: profile.id,
                status: 'active',
              })
              .select()
              .single();

            if (!pCreateErr && newProj) {
              setProjects([newProj as Project]);
              setCurrentProject(newProj as Project);
            } else {
              setCurrentProject(null);
            }
          } catch {
            setCurrentProject(null);
          }
        }
      } else {
        const members = mockStore.getWorkspaceMembers(currentWorkspace.id);
        setWorkspaceMembers(members);

        const myMembership = members.find((m) => m.user_id === profile.id);
        setUserRoleInWorkspace(myMembership?.role || null);

        const projList = mockStore.getProjects(currentWorkspace.id);
        setProjects(projList);

        if (projList.length > 0) {
          if (!currentProject || !projList.some((p) => p.id === currentProject.id)) {
            setCurrentProject(projList[0]);
          }
        } else {
          setCurrentProject(null);
        }
      }
    } catch (err: any) {
      console.error('Failed to load workspace details:', err);
      setError(err.message || 'Error loading workspace details');
    }
  }, [currentWorkspace, profile, currentProject?.id, useRealDatabase]);

  // Fetch project details when currentProject changes
  const fetchProjectDetails = useCallback(async () => {
    if (!currentProject || !profile) {
      setProjectMembers([]);
      setUserRoleInProject(null);
      return;
    }

    try {
      if (useRealDatabase) {
        const { data: members, error: pMemErr } = await supabase
          .from('project_members')
          .select('*, profile:profiles(*)')
          .eq('project_id', currentProject.id);

        if (pMemErr) throw pMemErr;
        setProjectMembers(members as ProjectMember[]);

        const myProjectRole = (members || []).find((m: any) => m.user_id === profile.id);
        setUserRoleInProject(myProjectRole?.project_role || null);
      } else {
        const members = mockStore.getProjectMembers(currentProject.id);
        setProjectMembers(members);

        const myProjectRole = members.find((m) => m.user_id === profile.id);
        setUserRoleInProject(myProjectRole?.project_role || null);
      }
    } catch (err: any) {
      console.error('Failed to load project details:', err);
    }
  }, [currentProject, profile]);

  useEffect(() => {
    fetchWorkspaces();
  }, [profile?.id]);

  useEffect(() => {
    fetchWorkspaceDetails();
  }, [currentWorkspace?.id, profile?.id]);

  useEffect(() => {
    fetchProjectDetails();
  }, [currentProject?.id, profile?.id]);

  const selectWorkspace = (workspaceId: string) => {
    const found = workspaces.find((w) => w.id === workspaceId);
    if (found) {
      setCurrentWorkspace(found);
      setCurrentProject(null);
    }
  };

  const createWorkspace = async (name: string, slug?: string): Promise<Workspace | null> => {
    if (!profile) return null;
    const cleanSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    try {
      if (useRealDatabase) {
        const { data, error } = await supabase
          .from('workspaces')
          .insert({
            name,
            slug: cleanSlug,
            owner_id: profile.id,
          })
          .select()
          .single();

        if (error) throw error;
        await fetchWorkspaces();
        setCurrentWorkspace(data as Workspace);
        return data as Workspace;
      } else {
        const created = mockStore.createWorkspace(name, cleanSlug, profile.id);
        await fetchWorkspaces();
        setCurrentWorkspace(created);
        return created;
      }
    } catch (err: any) {
      console.error('Failed to create workspace:', err);
      setError(err.message || 'Failed to create workspace');
      return null;
    }
  };

  const addMemberToWorkspace = async (userId: string, role: UserRole): Promise<boolean> => {
    if (!currentWorkspace) return false;
    try {
      if (useRealDatabase) {
        const { error } = await supabase
          .from('workspace_members')
          .upsert({
            workspace_id: currentWorkspace.id,
            user_id: userId,
            role,
          });

        if (error) throw error;
      } else {
        mockStore.addWorkspaceMember(currentWorkspace.id, userId, role);
      }
      await fetchWorkspaceDetails();
      return true;
    } catch (err: any) {
      console.error('Failed to add member:', err);
      setError(err.message || 'Failed to add member');
      return false;
    }
  };

  const createWorkspaceInvite = async (): Promise<{ token: string; expiresAt: string } | null> => {
    if (!currentWorkspace || !profile) return null;
    try {
      if (useRealDatabase) {
        const { data, error } = await supabase
          .from('workspace_invites')
          .insert({ workspace_id: currentWorkspace.id, created_by: profile.id })
          .select('token, expires_at')
          .single();
        if (error) throw error;
        const invite = data as { token: string; expires_at: string };
        return { token: invite.token, expiresAt: invite.expires_at };
      }

      const invite = mockStore.createWorkspaceInvite(currentWorkspace.id, profile.id);
      return { token: invite.token, expiresAt: invite.expires_at };
    } catch (err: any) {
      console.error('Failed to create workspace invite:', err);
      setError(err.message || 'Failed to create workspace invite');
      return null;
    }
  };

  const acceptWorkspaceInvite = async (
    token: string,
    role: Exclude<UserRole, 'owner'>
  ): Promise<{ workspaceId: string; workspaceName: string; role: string } | null> => {
    if (!profile) return null;
    try {
      if (useRealDatabase) {
        const { data, error } = await supabase
          .from('workspace_invite_claims')
          .insert({ invite_token: token, claimer_id: profile.id, requested_role: role })
          .select('workspace_id, assigned_role')
          .single();
        if (error) throw error;
        const claim = data as { workspace_id: string; assigned_role: string };
        await fetchWorkspaces();
        return {
          workspaceId: claim.workspace_id,
          workspaceName: 'workspace',
          role: claim.assigned_role,
        };
      }

      const invite = mockStore.acceptWorkspaceInvite(token, profile.id, role);
      if (!invite) throw new Error('This invite link is invalid or expired.');
      const workspace = mockStore.getWorkspaces(profile.id).find((item) => item.id === invite.workspace_id);
      await fetchWorkspaces();
      return {
        workspaceId: invite.workspace_id,
        workspaceName: workspace?.name || 'workspace',
        role,
      };
    } catch (err: any) {
      console.error('Failed to accept workspace invite:', err);
      setError(err.message || 'Failed to accept workspace invite');
      return null;
    }
  };

  const selectProject = (projectId: string | null) => {
    if (!projectId) {
      setCurrentProject(null);
      return;
    }
    const found = projects.find((p) => p.id === projectId);
    if (found) {
      setCurrentProject(found);
    }
  };

  const createProject = async (name: string, description: string = ''): Promise<Project | null> => {
    if (!currentWorkspace || !profile) return null;
    try {
      if (useRealDatabase) {
        const { data, error } = await supabase
          .from('projects')
          .insert({
            workspace_id: currentWorkspace.id,
            name,
            description,
            created_by: profile.id,
            status: 'active',
          })
          .select()
          .single();

        if (error) throw error;
        await fetchWorkspaceDetails();
        setCurrentProject(data as Project);
        return data as Project;
      } else {
        const created = mockStore.createProject(currentWorkspace.id, name, description, profile.id);
        await fetchWorkspaceDetails();
        setCurrentProject(created);
        return created;
      }
    } catch (err: any) {
      console.error('Failed to create project:', err);
      setError(err.message || 'Failed to create project');
      return null;
    }
  };

  const refreshWorkspaceData = async () => {
    await fetchWorkspaces();
    await fetchWorkspaceDetails();
    if (currentProject) {
      await fetchProjectDetails();
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        userRoleInWorkspace,
        workspaceMembers,
        projects,
        currentProject,
        userRoleInProject,
        projectMembers,
        loading,
        error,
        selectWorkspace,
        createWorkspace,
        addMemberToWorkspace,
        createWorkspaceInvite,
        acceptWorkspaceInvite,
        selectProject,
        createProject,
        refreshWorkspaceData,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
