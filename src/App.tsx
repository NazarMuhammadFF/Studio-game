import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { AuthView } from '@/components/auth/AuthView';
import { AppShell } from '@/components/layout/AppShell';
import { Spinner } from '@/components/ui/Spinner';
import { AcceptWorkspaceInviteModal } from '@/components/workspace/AcceptWorkspaceInviteModal';

const INVITE_STORAGE_KEY = 'studio_pending_workspace_invite';
const INVITE_TOKEN_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readPendingInviteToken(): string | null {
  const params = new URLSearchParams(window.location.search);
  const tokenFromLink = params.get('invite');
  if (tokenFromLink && INVITE_TOKEN_PATTERN.test(tokenFromLink)) {
    sessionStorage.setItem(INVITE_STORAGE_KEY, tokenFromLink);
    window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`);
    return tokenFromLink;
  }

  const savedToken = sessionStorage.getItem(INVITE_STORAGE_KEY);
  return savedToken && INVITE_TOKEN_PATTERN.test(savedToken) ? savedToken : null;
}

const MainApp: React.FC = () => {
  const { profile, loading } = useAuth();
  const [pendingInvite, setPendingInvite] = useState<string | null>(readPendingInviteToken);

  const dismissInvite = () => {
    sessionStorage.removeItem(INVITE_STORAGE_KEY);
    setPendingInvite(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-studio-bg text-studio-text">
        <Spinner size="lg" label="Initializing Studio Workspace..." />
      </div>
    );
  }

  if (!profile) {
    return <AuthView />;
  }

  return (
    <WorkspaceProvider>
      <AppShell />
      <AcceptWorkspaceInviteModal token={pendingInvite} onClose={dismissInvite} />
    </WorkspaceProvider>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
