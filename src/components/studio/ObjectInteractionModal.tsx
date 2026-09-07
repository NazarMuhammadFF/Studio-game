import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { InteractiveObjectDef } from '@/studio/types';
import {
  FolderKanban,
  Monitor,
  Palette,
  FileCode,
  Users,
  Compass,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const ObjectInteractionModal: React.FC<{
  object: InteractiveObjectDef | null;
  onClose: () => void;
  onNavigateBoard?: () => void;
}> = ({ object, onClose, onNavigateBoard }) => {
  if (!object) return null;

  const getObjectIcon = () => {
    switch (object.type) {
      case 'board':
        return <FolderKanban className="w-6 h-6 text-blue-400" />;
      case 'monitor':
        return <Monitor className="w-6 h-6 text-sky-400" />;
      case 'canvas':
        return <Palette className="w-6 h-6 text-purple-400" />;
      case 'meeting_table':
        return <Users className="w-6 h-6 text-amber-400" />;
      case 'directory':
        return <Compass className="w-6 h-6 text-emerald-400" />;
      default:
        return <FileCode className="w-6 h-6 text-blue-400" />;
    }
  };

  return (
    <Modal
      isOpen={Boolean(object)}
      onClose={onClose}
      title={object.title}
      description={`Location: ${object.roomType.toUpperCase()} DEPT • Interactive World Object`}
    >
      <div className="space-y-5">
        <div className="flex items-start gap-4 p-4 rounded-xl bg-studio-surface/50 border border-studio-border">
          <div className="w-12 h-12 rounded-xl bg-studio-panel border border-studio-border flex items-center justify-center shrink-0 shadow-sm">
            {getObjectIcon()}
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-studio-text">{object.name}</h4>
            <p className="text-xs text-studio-muted leading-relaxed">{object.description}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-studio-bg border border-studio-border space-y-2 text-xs">
          <div className="flex items-center justify-between text-studio-muted">
            <span>Context Department:</span>
            <Badge variant="discipline" discipline={object.roomType.toUpperCase()} size="sm" />
          </div>
          <div className="flex items-center justify-between text-studio-muted">
            <span>Productivity Shortcut:</span>
            <span className="text-blue-400 font-mono text-[11px]">[Directly accessible from React UI]</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          {object.type === 'board' && onNavigateBoard ? (
            <Button
              variant="primary"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => {
                onClose();
                onNavigateBoard();
              }}
            >
              Open Planning Board
            </Button>
          ) : (
            <Button variant="primary" icon={<ExternalLink className="w-4 h-4" />} onClick={onClose}>
              {object.actionText}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
