import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import { Building2, Plus, ArrowRight, FolderKanban } from 'lucide-react';

export const WorkspaceList: React.FC = () => {
  const { workspaces, currentWorkspace, selectWorkspace, userRoleInWorkspace } = useWorkspace();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-studio-text flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            Your Workspaces
          </h2>
          <p className="text-xs text-studio-muted mt-0.5">
            Select a studio workspace to coordinate game projects and team communication.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateOpen(true)}
        >
          Create Workspace
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-6 h-6" />}
          title="No Workspaces Found"
          description="You haven't joined or created any studio workspace yet. Create one to get started."
          actionLabel="Create First Workspace"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => {
            const isSelected = currentWorkspace?.id === ws.id;
            return (
              <Card
                key={ws.id}
                hoverable
                onClick={() => selectWorkspace(ws.id)}
                className={`flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-blue-500/60 bg-studio-surface ring-1 ring-blue-500/30'
                    : 'hover:border-studio-border'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-950/40 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                      {ws.name.substring(0, 2).toUpperCase()}
                    </div>
                    {isSelected && (
                      <Badge variant="role" role={userRoleInWorkspace || 'member'} size="sm" />
                    )}
                  </div>

                  <h3 className="font-bold text-base text-studio-text group-hover:text-blue-400">
                    {ws.name}
                  </h3>
                  <p className="text-xs text-studio-muted font-mono mt-0.5">/{ws.slug}</p>
                </div>

                <div className="pt-5 mt-4 border-t border-studio-border/60 flex items-center justify-between text-xs text-studio-muted">
                  <span className="flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5" /> Open Studio
                  </span>
                  <ArrowRight className="w-4 h-4 text-studio-muted hover:text-studio-text" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <CreateWorkspaceModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
};
