import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Profile, Workspace, WorkspaceMember, WorkspaceInvite, Project, ProjectMember, UserDiscipline, UserRole } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-id'));

// Auth uses storageKey as its BroadcastChannel name even with custom storage.
// Isolate notifications per document while keeping the existing tab session key
// stable across reloads (including the PKCE verifier suffix).
const authChannelKey = `studio-auth-${crypto.randomUUID()}`;
const persistedAuthKey = isConfigured
  ? `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
  : 'studio-auth-token';
const persistedKey = (key: string) => key.replace(authChannelKey, persistedAuthKey);

// Custom tab-isolated storage adapter for Supabase Auth:
// Using sessionStorage ensures that opening multiple tabs/windows on localhost allows each
// tab to maintain its own independent user session without overwriting each other in localStorage.
export const tabAuthStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(persistedKey(key));
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(persistedKey(key), value);
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(persistedKey(key));
    try {
      localStorage.removeItem(persistedKey(key));
    } catch {}
  },
};

// Export standard Supabase client if configured, or a dummy client
export const supabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: tabAuthStorage,
        storageKey: authChannelKey,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient('https://mock.supabase.co', 'mock-key', {
      auth: { persistSession: false },
    });

export const isSupabaseConfigured = isConfigured;

// -----------------------------------------------------------------------------
// Local Mock Store for Development & Immediate Testing
// (Used when Supabase credentials are not yet configured or demo mode is on)
// -----------------------------------------------------------------------------

const STORAGE_KEYS = {
  CURRENT_USER: 'studio_demo_current_user',
  PROFILES: 'studio_demo_profiles',
  WORKSPACES: 'studio_demo_workspaces',
  WORKSPACE_MEMBERS: 'studio_demo_workspace_members',
  WORKSPACE_INVITES: 'studio_demo_workspace_invites',
  PROJECTS: 'studio_demo_projects',
  PROJECT_MEMBERS: 'studio_demo_project_members',
};

const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'user-lead-1',
    display_name: 'Alex Vance',
    username: 'alexv',
    avatar_config: { skinColor: '#f5d0b5', hairColor: '#2b1d0c', shirtColor: '#3b82f6', style: 'default' },
    discipline: 'Game Designer',
    status_message: 'Working on core game loop spec 🎮',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-prog-2',
    display_name: 'Maya Lin',
    username: 'mayalin',
    avatar_config: { skinColor: '#ffd1b3', hairColor: '#e056fd', shirtColor: '#10b981', style: 'hoodie' },
    discipline: 'Programmer',
    status_message: 'Implementing player physics and network sync ⚡',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-art-3',
    display_name: 'Leo Chen',
    username: 'leoc',
    avatar_config: { skinColor: '#deb887', hairColor: '#1e293b', shirtColor: '#f59e0b', style: 'cap' },
    discipline: 'Artist',
    status_message: 'Drawing tileset and character animations 🎨',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: 'ws-pixel-forge',
    name: 'PixelForge Studios',
    slug: 'pixel-forge',
    owner_id: 'user-lead-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_WORKSPACE_MEMBERS: WorkspaceMember[] = [
  {
    workspace_id: 'ws-pixel-forge',
    user_id: 'user-lead-1',
    role: 'owner',
    joined_at: new Date().toISOString(),
  },
  {
    workspace_id: 'ws-pixel-forge',
    user_id: 'user-prog-2',
    role: 'lead',
    joined_at: new Date().toISOString(),
  },
  {
    workspace_id: 'ws-pixel-forge',
    user_id: 'user-art-3',
    role: 'member',
    joined_at: new Date().toISOString(),
  },
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-cyber-runner',
    workspace_id: 'ws-pixel-forge',
    name: 'Project Cyber Runner',
    description: 'A 2D pixel-art roguelike runner with dynamic combat mechanics.',
    status: 'active',
    created_by: 'user-lead-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-dungeon-tactics',
    workspace_id: 'ws-pixel-forge',
    name: 'Dungeon Tactics Tactics 2',
    description: 'Turn-based tactical grid combat with procedural levels.',
    status: 'active',
    created_by: 'user-lead-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_PROJECT_MEMBERS: ProjectMember[] = [
  {
    project_id: 'proj-cyber-runner',
    user_id: 'user-lead-1',
    project_role: 'lead',
    joined_at: new Date().toISOString(),
  },
  {
    project_id: 'proj-cyber-runner',
    user_id: 'user-prog-2',
    project_role: 'lead',
    joined_at: new Date().toISOString(),
  },
  {
    project_id: 'proj-cyber-runner',
    user_id: 'user-art-3',
    project_role: 'member',
    joined_at: new Date().toISOString(),
  },
];

function getStored<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to write to localStorage', err);
  }
}

export const mockStore = {
  getProfiles: (): Profile[] => getStored(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES),
  getProfile: (userId: string): Profile | undefined => {
    const list = mockStore.getProfiles();
    return list.find((p) => p.id === userId);
  },
  saveProfile: (profile: Profile): void => {
    const list = mockStore.getProfiles();
    const idx = list.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      list[idx] = { ...profile, updated_at: new Date().toISOString() };
    } else {
      list.push(profile);
    }
    setStored(STORAGE_KEYS.PROFILES, list);
  },

  getCurrentUser: (): Profile | null => {
    const uid = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER) : null;
    if (!uid) return null;
    return mockStore.getProfile(uid) || null;
  },
  setCurrentUser: (userId: string | null): void => {
    if (typeof window === 'undefined') return;
    if (userId) {
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      try {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      } catch {}
    }
  },

  getWorkspaces: (userId: string): Workspace[] => {
    const members = getStored<WorkspaceMember[]>(STORAGE_KEYS.WORKSPACE_MEMBERS, DEFAULT_WORKSPACE_MEMBERS);
    const userWorkspaceIds = members.filter((m) => m.user_id === userId).map((m) => m.workspace_id);
    const workspaces = getStored<Workspace[]>(STORAGE_KEYS.WORKSPACES, DEFAULT_WORKSPACES);
    return workspaces.filter((w) => userWorkspaceIds.includes(w.id));
  },
  createWorkspace: (name: string, slug: string, userId: string): Workspace => {
    const workspaces = getStored<Workspace[]>(STORAGE_KEYS.WORKSPACES, DEFAULT_WORKSPACES);
    const members = getStored<WorkspaceMember[]>(STORAGE_KEYS.WORKSPACE_MEMBERS, DEFAULT_WORKSPACE_MEMBERS);

    const newWs: Workspace = {
      id: 'ws-' + Math.random().toString(36).substring(2, 9),
      name,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      owner_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    workspaces.push(newWs);
    members.push({
      workspace_id: newWs.id,
      user_id: userId,
      role: 'owner',
      joined_at: new Date().toISOString(),
    });

    setStored(STORAGE_KEYS.WORKSPACES, workspaces);
    setStored(STORAGE_KEYS.WORKSPACE_MEMBERS, members);
    return newWs;
  },
  getWorkspaceMembers: (workspaceId: string): WorkspaceMember[] => {
    const members = getStored<WorkspaceMember[]>(STORAGE_KEYS.WORKSPACE_MEMBERS, DEFAULT_WORKSPACE_MEMBERS);
    const profiles = mockStore.getProfiles();
    return members
      .filter((m) => m.workspace_id === workspaceId)
      .map((m) => ({
        ...m,
        profile: profiles.find((p) => p.id === m.user_id),
      }));
  },
  addWorkspaceMember: (workspaceId: string, userId: string, role: UserRole): WorkspaceMember => {
    const members = getStored<WorkspaceMember[]>(STORAGE_KEYS.WORKSPACE_MEMBERS, DEFAULT_WORKSPACE_MEMBERS);
    const existing = members.find((m) => m.workspace_id === workspaceId && m.user_id === userId);
    if (existing) {
      existing.role = role;
      setStored(STORAGE_KEYS.WORKSPACE_MEMBERS, members);
      return existing;
    }
    const newMember: WorkspaceMember = {
      workspace_id: workspaceId,
      user_id: userId,
      role,
      joined_at: new Date().toISOString(),
    };
    members.push(newMember);
    setStored(STORAGE_KEYS.WORKSPACE_MEMBERS, members);
    return newMember;
  },
  createWorkspaceInvite: (workspaceId: string, userId: string): WorkspaceInvite => {
    const invites = getStored<WorkspaceInvite[]>(STORAGE_KEYS.WORKSPACE_INVITES, []);
    const invite: WorkspaceInvite = {
      id: crypto.randomUUID(),
      workspace_id: workspaceId,
      token: crypto.randomUUID(),
      created_by: userId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    };
    invites.push(invite);
    setStored(STORAGE_KEYS.WORKSPACE_INVITES, invites);
    return invite;
  },
  acceptWorkspaceInvite: (token: string, userId: string, role: Exclude<UserRole, 'owner'>): WorkspaceInvite | null => {
    const invites = getStored<WorkspaceInvite[]>(STORAGE_KEYS.WORKSPACE_INVITES, []);
    const invite = invites.find((item) =>
      item.token === token && !item.revoked_at && new Date(item.expires_at).getTime() > Date.now()
    );
    if (!invite) return null;
    mockStore.addWorkspaceMember(invite.workspace_id, userId, role);
    return invite;
  },

  getProjects: (workspaceId: string): Project[] => {
    const projects = getStored<Project[]>(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
    return projects.filter((p) => p.workspace_id === workspaceId);
  },
  createProject: (workspaceId: string, name: string, description: string, userId: string): Project => {
    const projects = getStored<Project[]>(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
    const projectMembers = getStored<ProjectMember[]>(STORAGE_KEYS.PROJECT_MEMBERS, DEFAULT_PROJECT_MEMBERS);

    const newProject: Project = {
      id: 'proj-' + Math.random().toString(36).substring(2, 9),
      workspace_id: workspaceId,
      name,
      description,
      status: 'active',
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    projects.push(newProject);
    projectMembers.push({
      project_id: newProject.id,
      user_id: userId,
      project_role: 'lead',
      joined_at: new Date().toISOString(),
    });

    setStored(STORAGE_KEYS.PROJECTS, projects);
    setStored(STORAGE_KEYS.PROJECT_MEMBERS, projectMembers);
    return newProject;
  },
  getProjectMembers: (projectId: string): ProjectMember[] => {
    const members = getStored<ProjectMember[]>(STORAGE_KEYS.PROJECT_MEMBERS, DEFAULT_PROJECT_MEMBERS);
    const profiles = mockStore.getProfiles();
    return members
      .filter((m) => m.project_id === projectId)
      .map((m) => ({
        ...m,
        profile: profiles.find((p) => p.id === m.user_id),
      }));
  },
  registerUser: (displayName: string, email: string, discipline: UserDiscipline): Profile => {
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
    const newProfile: Profile = {
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      display_name: displayName,
      username: username || 'user_' + Math.random().toString(36).substring(2, 6),
      avatar_config: { skinColor: '#f5d0b5', hairColor: '#334155', shirtColor: '#6366f1', style: 'default' },
      discipline,
      status_message: 'Ready to build awesome games!',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockStore.saveProfile(newProfile);
    mockStore.setCurrentUser(newProfile.id);
    return newProfile;
  },
};
