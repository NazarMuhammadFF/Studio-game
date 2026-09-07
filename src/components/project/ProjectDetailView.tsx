import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { DisciplineBadge } from '@/components/profile/DisciplineBadge';
import { StudioView } from '@/components/studio/StudioView';
import {
  Gamepad2,
  LayoutGrid,
  Users,
  MessageSquare,
  FileText,
  ArrowLeft,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';

export const ProjectDetailView: React.FC = () => {
  const { currentProject, selectProject, projectMembers, userRoleInProject, userRoleInWorkspace } =
    useWorkspace();

  const [activeTab, setActiveTab] = useState<'studio' | 'overview' | 'board_preview'>('studio');

  if (!currentProject) return null;

  const effectiveRole = userRoleInProject || (userRoleInWorkspace === 'owner' ? 'lead' : 'member');

  return (
    <div className="space-y-6">
      {/* Top Breadcrumbs & Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => selectProject(null)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-studio-muted hover:text-studio-text transition-colors p-1.5 rounded-lg hover:bg-studio-surface"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Project List
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-studio-muted">Your Project Role:</span>
          <Badge variant="role" role={effectiveRole} size="sm" />
        </div>
      </div>

      {/* Project Banner Card */}
      <Card className="p-6 bg-gradient-to-r from-studio-panel via-studio-surface to-studio-panel border-blue-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-lg">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-studio-text tracking-tight">
                  {currentProject.name}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {currentProject.status}
                </span>
              </div>
              <p className="text-xs text-studio-muted mt-1 max-w-2xl leading-relaxed">
                {currentProject.description || 'No project description provided.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-studio-muted border-t md:border-t-0 md:border-l border-studio-border pt-3 md:pt-0 md:pl-6">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Created {new Date(currentProject.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> {projectMembers.length} Assigned Members
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex border-b border-studio-border gap-2">
        <button
          onClick={() => setActiveTab('studio')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'studio'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-studio-muted hover:text-studio-text'
          }`}
        >
          <Gamepad2 className="w-4 h-4" /> Studio View (Interactive 2D)
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Active
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-studio-muted hover:text-studio-text'
          }`}
        >
          <Layers className="w-4 h-4" /> Overview & Roster
        </button>

        <button
          onClick={() => setActiveTab('board_preview')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'board_preview'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-studio-muted hover:text-studio-text'
          }`}
        >
          <LayoutGrid className="w-4 h-4" /> Board View (Planning)
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Goal 4
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'studio' && (
        <StudioView />
      )}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="space-y-4">
              <h3 className="text-sm font-bold text-studio-text uppercase tracking-wider text-studio-muted flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" /> Foundation Milestone Status
              </h3>
              <div className="p-4 rounded-xl bg-studio-surface/50 border border-studio-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-studio-text">Goal 1 — Foundation</span>
                  <span className="text-emerald-400 font-bold">READY / ACTIVE</span>
                </div>
                <p className="text-xs text-studio-muted leading-relaxed">
                  Authentication, user profiles, disciplines, workspace membership, project isolation, and database RLS policies are operational.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl border border-studio-border bg-studio-bg space-y-1">
                  <div className="text-xs font-semibold text-studio-text flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Team Communication
                  </div>
                  <p className="text-[11px] text-studio-muted">
                    Direct, group & room channels (Scheduled for Roadmap Goal 3).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-studio-border bg-studio-bg space-y-1">
                  <div className="text-xs font-semibold text-studio-text flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" /> Progress Reports
                  </div>
                  <p className="text-[11px] text-studio-muted">
                    Structured milestone logs & blocker tracking (Roadmap Goal 5).
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Project Members Roster */}
          <div className="space-y-4">
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-studio-muted flex items-center gap-2">
                  <Users className="w-4 h-4" /> Team Roster ({projectMembers.length})
                </h3>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {projectMembers.map((m) => {
                  const p = m.profile;
                  return (
                    <div
                      key={m.user_id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-studio-border bg-studio-surface/40"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          name={p?.display_name || 'Member'}
                          discipline={p?.discipline}
                          avatarConfig={p?.avatar_config}
                          size="sm"
                          showBadge
                        />
                        <div>
                          <div className="text-xs font-bold text-studio-text">
                            {p?.display_name || m.user_id}
                          </div>
                          <div className="text-[10px] text-studio-muted">
                            @{p?.username || 'user'}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {p?.discipline && <DisciplineBadge discipline={p.discipline} size="sm" />}
                        <Badge variant="role" role={m.project_role} size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}



      {activeTab === 'board_preview' && (
        <Card className="p-12 text-center border-dashed border-amber-500/40 bg-studio-panel/50 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <LayoutGrid className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-studio-text">Productivity & Planning Board</h3>
            <p className="text-xs text-studio-muted max-w-md mx-auto mt-1">
              Milestone tracking, goals, assigned tasks, and lead coordination board will be activated in <strong>Roadmap Goal 4</strong>.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
