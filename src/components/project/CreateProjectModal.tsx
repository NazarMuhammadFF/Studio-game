import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const CreateProjectModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { createProject, currentWorkspace } = useWorkspace();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const proj = await createProject(name.trim(), description.trim());
    setIsSubmitting(false);

    if (proj) {
      setName('');
      setDescription('');
      onClose();
    } else {
      setError('Failed to create project.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Game Project"
      description={`Add a new game title or milestone project under ${currentWorkspace?.name || 'this workspace'}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Game Project Name"
          placeholder="e.g. Project Cyber Runner, Echoes of Eternity"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-studio-muted">
            Description / Logline
          </label>
          <textarea
            rows={3}
            className="w-full px-3.5 py-2 bg-studio-bg border border-studio-border rounded-lg text-studio-text placeholder-studio-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
            placeholder="Brief game concept, genre, target platforms, or milestone focus..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
