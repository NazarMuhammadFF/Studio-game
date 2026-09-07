export type UserRole = 'owner' | 'lead' | 'member' | 'guest';

export type UserDiscipline =
  | 'Programmer'
  | 'Artist'
  | 'Game Designer'
  | 'Audio'
  | 'Writer'
  | 'QA'
  | 'Producer'
  | 'Other';

export interface AvatarConfig {
  skinColor?: string;
  hairColor?: string;
  shirtColor?: string;
  style?: string;
}

export interface Profile {
  id: string;
  display_name: string;
  username: string;
  avatar_config: AvatarConfig;
  discipline: UserDiscipline;
  status_message?: string;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
  profile?: Profile;
}

export interface WorkspaceInvite {
  id: string;
  workspace_id: string;
  token: string;
  created_by: string;
  expires_at: string;
  revoked_at?: string | null;
  created_at: string;
}

export type ProjectStatus = 'active' | 'archived' | 'paused' | 'completed';

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  project_id: string;
  user_id: string;
  project_role: 'lead' | 'member' | 'guest';
  joined_at: string;
  profile?: Profile;
}
