import React from 'react';
import { Header } from './Header';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { WorkspaceList } from '@/components/workspace/WorkspaceList';
import { ProjectList } from '@/components/project/ProjectList';
import { StudioView } from '@/components/studio/StudioView';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { currentWorkspace, currentProject, loading, error, refreshWorkspaceData } = useWorkspace();
  const [editingRoom, setEditingRoom] = React.useState(false);
  React.useEffect(() => {
    const handle = (event: Event) => setEditingRoom(Boolean((event as CustomEvent).detail));
    window.addEventListener('studio-layout-focus', handle);
    return () => window.removeEventListener('studio-layout-focus', handle);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-studio-bg text-studio-text overflow-hidden select-none">
      {/* 1. Minimal Top Bar */}
      {!editingRoom && <Header />}

      {/* 2. Main Viewport */}
      <main className="flex-1 w-full h-[calc(100vh-44px)] relative overflow-hidden">
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 p-3 px-5 rounded-xl bg-rose-500/90 backdrop-blur-md border border-rose-400 text-white flex items-center gap-3 text-xs shadow-2xl animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => refreshWorkspaceData()}
              className="px-2 py-0.5 rounded bg-black/20 hover:bg-black/30 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Spinner size="lg" label="Synchronizing Studio data..." />
          </div>
        ) : currentProject ? (
          /* When a project is active, open directly into the full Studio View */
          <StudioView />
        ) : currentWorkspace ? (
          /* Fallback view only when no project is selected */
          <div className="h-full overflow-y-auto max-w-6xl mx-auto p-6 space-y-8">
            <ProjectList />
            <div className="border-t border-studio-border/60 pt-6">
              <WorkspaceList />
            </div>
          </div>
        ) : (
          /* Fallback view when no workspace is selected */
          <div className="h-full overflow-y-auto max-w-6xl mx-auto p-6">
            <WorkspaceList />
          </div>
        )}
      </main>
    </div>
  );
};
