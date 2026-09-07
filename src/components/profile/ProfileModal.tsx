import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { UserDiscipline } from '@/types/database.types';

const DISCIPLINES: { label: string; value: UserDiscipline }[] = [
  { label: 'Programmer', value: 'Programmer' },
  { label: 'Artist', value: 'Artist' },
  { label: 'Game Designer', value: 'Game Designer' },
  { label: 'Audio', value: 'Audio' },
  { label: 'Writer', value: 'Writer' },
  { label: 'QA', value: 'QA' },
  { label: 'Producer', value: 'Producer' },
  { label: 'Other', value: 'Other' },
];

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { profile, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [discipline, setDiscipline] = useState<UserDiscipline>(profile?.discipline || 'Programmer');
  const [statusMessage, setStatusMessage] = useState(profile?.status_message || '');
  const [shirtColor, setShirtColor] = useState(profile?.avatar_config?.shirtColor || '#3b82f6');
  const [hairColor, setHairColor] = useState(profile?.avatar_config?.hairColor || '#2b1d0c');
  const [skinColor, setSkinColor] = useState(profile?.avatar_config?.skinColor || '#f5d0b5');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if profile changes
  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setUsername(profile.username);
      setDiscipline(profile.discipline);
      setStatusMessage(profile.status_message || '');
      setShirtColor(profile.avatar_config?.shirtColor || '#3b82f6');
      setHairColor(profile.avatar_config?.hairColor || '#2b1d0c');
      setSkinColor(profile.avatar_config?.skinColor || '#f5d0b5');
    }
  }, [profile]);

  if (!profile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    await updateProfile({
      display_name: displayName,
      username,
      discipline,
      status_message: statusMessage,
      avatar_config: {
        ...profile.avatar_config,
        shirtColor,
        hairColor,
        skinColor,
      },
    });

    setIsSaving(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Member Profile"
      description="Customize your virtual studio identity, discipline, and avatar colors."
    >
      <form onSubmit={handleSave} className="space-y-5">
        {/* Avatar Live Preview */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-studio-surface/50 border border-studio-border">
          <Avatar
            name={displayName || 'User'}
            discipline={discipline}
            avatarConfig={{ shirtColor, hairColor, skinColor }}
            size="lg"
            showBadge
          />
          <div>
            <h4 className="text-sm font-bold text-studio-text">{displayName || 'Anonymous'}</h4>
            <p className="text-xs text-studio-muted">@{username}</p>
            <p className="text-xs text-studio-muted/80 mt-1 italic line-clamp-1">
              "{statusMessage || 'No status set'}"
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Discipline"
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value as UserDiscipline)}
            options={DISCIPLINES}
          />
          <Input
            label="Status Message"
            placeholder="e.g. Profiling memory leak..."
            value={statusMessage}
            onChange={(e) => setStatusMessage(e.target.value)}
          />
        </div>

        {/* Avatar Customization Colors */}
        <div className="p-3 bg-studio-bg border border-studio-border rounded-xl space-y-3">
          <h5 className="text-xs font-semibold uppercase text-studio-muted tracking-wider">
            Avatar Palette (Studio View)
          </h5>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-studio-muted mb-1">Shirt Color</label>
              <input
                type="color"
                value={shirtColor}
                onChange={(e) => setShirtColor(e.target.value)}
                className="w-full h-8 rounded border border-studio-border bg-transparent cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[11px] text-studio-muted mb-1">Hair Color</label>
              <input
                type="color"
                value={hairColor}
                onChange={(e) => setHairColor(e.target.value)}
                className="w-full h-8 rounded border border-studio-border bg-transparent cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[11px] text-studio-muted mb-1">Skin Tone</label>
              <input
                type="color"
                value={skinColor}
                onChange={(e) => setSkinColor(e.target.value)}
                className="w-full h-8 rounded border border-studio-border bg-transparent cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
