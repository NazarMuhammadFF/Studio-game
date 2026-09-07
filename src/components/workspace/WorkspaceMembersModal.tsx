import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { DisciplineBadge } from '@/components/profile/DisciplineBadge';
import { UserRole } from '@/types/database.types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { ShieldCheck, UserPlus, Crown, Users, Link, Copy } from 'lucide-react';

const ROLES: { label: string; value: UserRole }[] = [
  { label: 'Lead (Coordination & Planning)', value: 'lead' },
  { label: 'Member (Contributor)', value: 'member' },
  { label: 'Guest (Restricted)', value: 'guest' },
];

export const WorkspaceMembersModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { currentWorkspace, workspaceMembers, userRoleInWorkspace, addMemberToWorkspace, createWorkspaceInvite } =
    useWorkspace();
  const { availableDemoUsers } = useAuth();

  const [selectedUser, setSelectedUser] = useState(availableDemoUsers[0]?.id || '');
  const [selectedRole, setSelectedRole] = useState<UserRole>('member');
  const [username, setUsername] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  const canManageMembers = userRoleInWorkspace === 'owner' || userRoleInWorkspace === 'lead';

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured && !selectedUser) return;
    if (isSupabaseConfigured && !username.trim()) return;
    setIsAdding(true);
    setAddError(null);

    let userId = selectedUser;
    if (isSupabaseConfigured) {
      const normalizedUsername = username.trim().replace(/^@/, '').toLowerCase();
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', normalizedUsername)
        .maybeSingle();

      if (error || !data) {
        setAddError(error?.message || 'Member username was not found. Ask them to register first.');
        setIsAdding(false);
        return;
      }
      userId = data.id;
    }

    const added = await addMemberToWorkspace(userId, selectedRole);
    if (!added) {
      setAddError('Member could not be added. Check your role and try again.');
    } else {
      setUsername('');
    }
    setIsAdding(false);
  };

  const handleCreateInvite = async () => {
    setIsCreatingInvite(true);
    setInviteError(null);
    setCopyNotice(null);
    const invite = await createWorkspaceInvite();
    if (!invite) {
      setInviteError('Invite link could not be created. Check your role and try again.');
    } else {
      setInviteLink(`${window.location.origin}${window.location.pathname}?invite=${invite.token}`);
    }
    setIsCreatingInvite(false);
  };

  const handleCopyInvite = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopyNotice('Invite link copied. It expires in 7 days.');
    } catch {
      setCopyNotice('Copy the link from the field above.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${currentWorkspace?.name || 'Workspace'} Members`}
      description="Manage team membership, authorization roles, and assigned disciplines."
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Role permission info banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-studio-surface/50 border border-studio-border text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="text-studio-muted">Your workspace authorization:</span>
          </div>
          <Badge variant="role" role={userRoleInWorkspace || 'member'} />
        </div>

        {/* Add Member Form (Only for Owner or Lead) */}
        {canManageMembers && (
          <div className="space-y-3">
            <div className="rounded-xl border border-studio-border bg-studio-bg/60 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-studio-muted flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5 text-blue-400" /> Invite by Link
                  </h5>
                  <p className="mt-1 text-xs text-studio-muted">Recipients choose Lead, Member, or Guest. The Owner role is never available.</p>
                </div>
                <Button type="button" variant="secondary" size="sm" isLoading={isCreatingInvite} onClick={handleCreateInvite}>
                  Create Link
                </Button>
              </div>
              {inviteLink && (
                <div className="flex gap-2">
                  <Input aria-label="Workspace invite link" value={inviteLink} readOnly onFocus={(event) => event.currentTarget.select()} />
                  <Button type="button" variant="outline" size="sm" icon={<Copy className="w-3.5 h-3.5" />} onClick={handleCopyInvite}>
                    Copy
                  </Button>
                </div>
              )}
              {inviteError && <p className="text-xs text-rose-400" role="alert">{inviteError}</p>}
              {copyNotice && <p className="text-xs text-emerald-400">{copyNotice}</p>}
            </div>

            <form
              onSubmit={handleAddMember}
              className="p-4 rounded-xl border border-studio-border bg-studio-bg/60 space-y-3"
            >
              <h5 className="text-xs font-semibold uppercase tracking-wider text-studio-muted flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-blue-400" /> Add Team Member by Username
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isSupabaseConfigured ? (
                  <Input
                    label="Registered Username"
                    placeholder="e.g. alexv"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    helperText="The member must register before being added."
                    required
                  />
                ) : (
                  <Select
                    label="Select Member"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    options={availableDemoUsers.map((u) => ({
                      label: `${u.display_name} (@${u.username}) — ${u.discipline}`,
                      value: u.id,
                    }))}
                  />
                )}
                <Select
                  label="Assign Role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  options={ROLES}
                />
              </div>
              {addError && (
                <div className="text-xs text-rose-400" role="alert">{addError}</div>
              )}
              <div className="flex justify-end pt-1">
                <Button type="submit" variant="primary" size="sm" isLoading={isAdding}>
                  Add to Workspace
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Member Roster List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-studio-muted px-1 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Roster ({workspaceMembers.length})
            </span>
            <span>Role & Discipline</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {workspaceMembers.map((m) => {
              const p = m.profile;
              const isOwner = m.role === 'owner';
              return (
                <div
                  key={m.user_id}
                  className="flex items-center justify-between p-3 rounded-xl border border-studio-border bg-studio-surface/40 hover:bg-studio-surface transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={p?.display_name || 'Member'}
                      discipline={p?.discipline}
                      avatarConfig={p?.avatar_config}
                      size="md"
                      showBadge
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-studio-text">
                          {p?.display_name || m.user_id}
                        </span>
                        {isOwner && <Crown className="w-3 h-3 text-amber-400" />}
                      </div>
                      <div className="text-[11px] text-studio-muted">
                        @{p?.username || 'user'} • Joined {new Date(m.joined_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {p?.discipline && <DisciplineBadge discipline={p.discipline} size="sm" />}
                    <Badge variant="role" role={m.role} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
