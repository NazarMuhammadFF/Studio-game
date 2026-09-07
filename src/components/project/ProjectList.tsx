import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { CreateProjectModal } from './CreateProjectModal';
import { Gamepad2, Plus, ArrowRight, Layers, Calendar } from 'lucide-react';

export const ProjectList: React.FC = () => {
  const { currentWorkspace, projects, selectProject, userRoleInWorkspace } = useWorkspace();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const canCreateProject = userRoleInWorkspace !== 'guest';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-studio-text flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Game Projects
          </h2>
          <p className="text-xs text-studio-muted mt-0.5">
            Active game productions in <span className="font-semibold text-studio-text">{currentWorkspace?.name}</span>
          </p>
        </div>

        {canCreateProject && (
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            New Project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<Gamepad2 className="w-6 h-6" />}
          title="No Projects in this Workspace"
          description="Create your first game title to start collaborating in the virtual studio and tracking milestone progress."
          actionLabel={canCreateProject ? 'Create Game Project' : undefined}
          onAction={canCreateProject ? () => setIsCreateOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <Card
              key={proj.id}
              hoverable
              onClick={() => selectProject(proj.id)}
              className="flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-studio-surface border border-studio-border flex items-center justify-center text-blue-400">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      proj.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                <h3 className="font-bold text-base text-studio-text group-hover:text-blue-400 mb-1">
                  {proj.name}
                </h3>
                <p className="text-xs text-studio-muted line-clamp-2 leading-relaxed">
                  {proj.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-studio-border/60 flex items-center justify-between text-xs text-studio-muted">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(proj.created_at).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300">
                  Open Project <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateProjectModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
};
