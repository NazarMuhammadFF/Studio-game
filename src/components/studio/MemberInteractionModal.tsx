import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { DisciplineBadge } from '@/components/profile/DisciplineBadge';
import { PlayerNetworkState } from '@/studio/types';
import { MessageSquare, Target, MapPin } from 'lucide-react';

export const MemberInteractionModal: React.FC<{
  player: PlayerNetworkState | null;
  onClose: () => void;
  onStartChat?: (player: PlayerNetworkState) => void;
}> = ({ player, onClose, onStartChat }) => {
  if (!player) return null;

  return (
    <Modal
      isOpen={Boolean(player)}
      onClose={onClose}
      title="Team Member Context"
      description="Studio presence and active context information."
    >
      <div className="space-y-5">
        {/* Profile Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-studio-surface/50 border border-studio-border">
          <Avatar
            name={player.displayName}
            discipline={player.discipline}
            avatarConfig={player.avatarConfig}
            size="lg"
            showBadge
          />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-studio-text">{player.displayName}</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-studio-muted">@{player.username}</span>
              <DisciplineBadge discipline={player.discipline} size="sm" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium pt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>In {player.currentRoom || 'Studio'}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border border-studio-border bg-studio-bg text-center space-y-1">
            <div className="text-xs font-semibold text-studio-text flex items-center justify-center gap-1">
              <Target className="w-3.5 h-3.5 text-emerald-400" /> Status
            </div>
            <p className="text-[11px] text-studio-muted italic">"Online di {player.currentRoom || 'Studio'}"</p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onStartChat) onStartChat(player);
              onClose();
            }}
            className="p-3 rounded-xl border border-blue-500/40 bg-blue-600/20 hover:bg-blue-600/30 text-center space-y-1 transition-all group"
          >
            <div className="text-xs font-semibold text-blue-400 group-hover:text-blue-300 flex items-center justify-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Direct Chat
            </div>
            <p className="text-[10px] text-blue-300/80">Kirim pesan langsung</p>
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
