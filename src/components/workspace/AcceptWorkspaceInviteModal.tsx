import React, { useState } from 'react';
import { ShieldCheck, UserPlus } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types/database.types';

const INVITEE_ROLES: { label: string; value: Exclude<UserRole, 'owner'> }[] = [
  { label: 'Lead (Coordination & Planning)', value: 'lead' },
  { label: 'Member (Contributor)', value: 'member' },
  { label: 'Guest (Restricted)', value: 'guest' },
];

interface AcceptWorkspaceInviteModalProps {
  token: string | null;
  onClose: () => void;
}

export const AcceptWorkspaceInviteModal: React.FC<AcceptWorkspaceInviteModalProps> = ({ token, onClose }) => {
  const { acceptWorkspaceInvite } = useWorkspace();
  const [role, setRole] = useState<Exclude<UserRole, 'owner'>>('member');
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!token) return;
    setIsAccepting(true);
    setError(null);
    const result = await acceptWorkspaceInvite(token, role);
    if (!result) {
      setError('This invite could not be accepted. It may be invalid, expired, or revoked.');
      setIsAccepting(false);
      return;
    }
    onClose();
  };

  return (
    <Modal
      isOpen={Boolean(token)}
      onClose={onClose}
      title="Join Workspace"
      description="Choose how you will participate in this workspace before joining."
      maxWidth="sm"
    >
      <div className="space-y-5">
        <div className="flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-100">
          <ShieldCheck className="h-4 w-4 shrink-0 text-amber-400" />
          <p>Owner is intentionally unavailable. This link never transfers workspace ownership.</p>
        </div>

        <Select
          label="Your Workspace Role"
          value={role}
          onChange={(event) => setRole(event.target.value as Exclude<UserRole, 'owner'>)}
          options={INVITEE_ROLES}
        />

        {error && <p className="text-xs text-rose-400" role="alert">{error}</p>}

        <Button
          type="button"
          className="w-full"
          icon={<UserPlus className="h-4 w-4" />}
          isLoading={isAccepting}
          onClick={handleAccept}
        >
          Join Workspace
        </Button>
      </div>
    </Modal>
  );
};
