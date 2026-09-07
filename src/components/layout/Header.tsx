import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Avatar } from '@/components/ui/Avatar';
import { DisciplineBadge } from '@/components/profile/DisciplineBadge';
import { Badge } from '@/components/ui/Badge';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { WorkspaceMembersModal } from '@/components/workspace/WorkspaceMembersModal';
import {
  Gamepad2,
  ChevronDown,
  LogOut,
  Settings,
  Building2,
  FolderKanban,
  Users,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, signOut, availableDemoUsers, switchDemoUser } = useAuth();
  const {
    workspaces,
    currentWorkspace,
    selectWorkspace,
    userRoleInWorkspace,
    currentProject,
    projects,
    selectProject,
  } = useWorkspace();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);

  if (!profile) return null;

  return (
    <header className="h-11 w-full bg-[#0a101d] border-b border-studio-border px-4 flex items-center justify-between gap-4 z-40 select-none">
      {/* Left: App Identity, Workspace, and Project */}
      <div className="flex items-center gap-3">
        {/* App Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Gamepad2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold tracking-tight text-studio-text hidden sm:inline">
            Virtual Studio
          </span>
        </div>

        <div className="h-4 w-[1px] bg-studio-border/80 hidden sm:block" />

        {/* Workspace Selector */}
        <div className="relative">
          <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-studio-surface/60 hover:bg-studio-surface border border-studio-border text-xs font-medium text-studio-text transition-all"
          >
            <Building2 className="w-3 h-3 text-studio-muted" />
            <span className="max-w-[120px] truncate">
              {currentWorkspace ? currentWorkspace.name : 'Select Workspace'}
            </span>
            <ChevronDown className="w-3 h-3 text-studio-muted" />
          </button>

          {isWorkspaceMenuOpen && (
            <div
              className="absolute left-0 mt-1 w-52 rounded-xl bg-studio-panel border border-studio-border shadow-2xl z-50 py-1 overflow-hidden"
              onClick={() => setIsWorkspaceMenuOpen(false)}
            >
              <div className="px-3 py-1 text-[9px] uppercase font-bold text-studio-muted tracking-wider">
                Workspaces
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => selectWorkspace(ws.id)}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-studio-surface transition-colors ${
                    currentWorkspace?.id === ws.id
                      ? 'text-blue-400 font-bold bg-studio-surface/50'
                      : 'text-studio-text'
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  <span className="text-[10px] text-studio-muted font-mono">/{ws.slug}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Project Selector */}
        {currentWorkspace && (
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/40 hover:bg-blue-900/40 border border-blue-500/30 text-xs font-medium text-blue-400 transition-all"
            >
              <FolderKanban className="w-3 h-3 text-blue-400" />
              <span className="max-w-[130px] truncate">
                {currentProject ? currentProject.name : 'Select Project'}
              </span>
              <ChevronDown className="w-3 h-3 text-blue-400/80" />
            </button>

            {isProjectMenuOpen && (
              <div
                className="absolute left-0 mt-1 w-56 rounded-xl bg-studio-panel border border-studio-border shadow-2xl z-50 py-1 overflow-hidden"
                onClick={() => setIsProjectMenuOpen(false)}
              >
                <div className="px-3 py-1 text-[9px] uppercase font-bold text-studio-muted tracking-wider">
                  Projects
                </div>
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => selectProject(proj.id)}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-studio-surface transition-colors ${
                      currentProject?.id === proj.id
                        ? 'text-blue-400 font-bold bg-studio-surface/50'
                        : 'text-studio-text'
                    }`}
                  >
                    <span className="truncate">{proj.name}</span>
                    <span className="text-[9px] uppercase px-1 rounded bg-studio-surface text-studio-muted">
                      {proj.status}
                    </span>
                  </button>
                ))}
                <div className="border-t border-studio-border my-1" />
                <button
                  onClick={() => selectProject(null)}
                  className="w-full text-left px-3 py-1.5 text-xs text-studio-muted hover:text-studio-text hover:bg-studio-surface"
                >
                  Manage Projects List
                </button>
              </div>
            )}
            <button
              onClick={() => setIsMembersOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-studio-surface/60 hover:bg-studio-surface border border-studio-border text-xs font-medium text-studio-text transition-all"
              title="Manage workspace team"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">Team</span>
            </button>
          </div>
        )}
      </div>

      {/* Right: User Profile */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 py-0.5 px-1.5 rounded-lg hover:bg-studio-surface border border-transparent hover:border-studio-border transition-all"
          >
            <Avatar
              name={profile.display_name}
              discipline={profile.discipline}
              avatarConfig={profile.avatar_config}
              size="sm"
            />
            <span className="text-xs font-semibold text-studio-text hidden sm:inline">
              {profile.display_name}
            </span>
            <ChevronDown className="w-3 h-3 text-studio-muted" />
          </button>

          {isUserMenuOpen && (
            <div
              className="absolute right-0 mt-1.5 w-56 rounded-xl bg-studio-panel border border-studio-border shadow-2xl z-50 py-2 overflow-hidden"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <div className="px-3.5 py-1.5 border-b border-studio-border mb-1">
                <div className="text-xs font-bold text-studio-text">{profile.display_name}</div>
                <div className="text-[10px] text-studio-muted">@{profile.username}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <DisciplineBadge discipline={profile.discipline} size="sm" />
                  {userRoleInWorkspace && (
                    <Badge variant="role" role={userRoleInWorkspace} size="sm" />
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsProfileOpen(true)}
                className="w-full text-left px-3.5 py-2 text-xs text-studio-text hover:bg-studio-surface flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5 text-blue-400" /> Edit Avatar & Profile
              </button>

              {availableDemoUsers.length > 0 && (
                <>
                  <div className="border-t border-studio-border my-1" />
                  <div className="px-3.5 py-1 text-[9px] uppercase font-bold text-studio-muted tracking-wider">
                    Switch Test Persona (This Tab)
                  </div>
                  {availableDemoUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => switchDemoUser(u.id)}
                      className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between hover:bg-studio-surface transition-colors ${
                        profile.id === u.id
                          ? 'text-blue-400 font-bold bg-studio-surface/50'
                          : 'text-studio-text'
                      }`}
                    >
                      <span className="truncate">{u.display_name}</span>
                      <span className="text-[10px] text-studio-muted font-mono">{u.discipline}</span>
                    </button>
                  ))}
                </>
              )}

              <div className="border-t border-studio-border my-1" />

              <button
                onClick={() => signOut()}
                className="w-full text-left px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <WorkspaceMembersModal isOpen={isMembersOpen} onClose={() => setIsMembersOpen(false)} />
    </header>
  );
};
