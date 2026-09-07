import React, { useEffect } from 'react';
import { WorkstationMemberData, PlayerNetworkState } from '@/studio/types';
import { DisciplineBadge } from '@/components/profile/DisciplineBadge';
import {
  X,
  Target,
  Sparkles,
  GitPullRequest,
  Cpu,
  Clock,
  CheckCircle2,
  MapPin,
  MessageSquare,
} from 'lucide-react';

interface MemberContextualOverlayProps {
  member: (WorkstationMemberData | PlayerNetworkState) | null;
  onClose: () => void;
  onStartChat?: (member: WorkstationMemberData | PlayerNetworkState) => void;
}

export const MemberContextualOverlay: React.FC<MemberContextualOverlayProps> = ({
  member,
  onClose,
  onStartChat,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!member) return null;

  // Normalize data between WorkstationMemberData and PlayerNetworkState
  const isWorkstationMember = 'currentGoal' in member;
  const name = isWorkstationMember ? member.name : member.displayName;
  const discipline = member.discipline;
  const roleTitle = isWorkstationMember ? member.roleTitle : 'Studio Developer';
  const status = isWorkstationMember ? member.status : 'In Flow';
  const currentGoal = isWorkstationMember
    ? member.currentGoal
    : 'Active sprint development and feature iteration';
  const progressPercentage = isWorkstationMember ? member.progressPercentage : 80;
  const isOnline = isWorkstationMember ? (member.isOnline ?? true) : true;
  const currentRoom = !isWorkstationMember ? member.currentRoom : 'Engineering & Code Lab';

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'In Flow':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Reviewing PR':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Building':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Pair Programming':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'Debugging':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case 'In Flow':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />;
      case 'Reviewing PR':
        return <GitPullRequest className="w-3.5 h-3.5 text-amber-400" />;
      case 'Building':
        return <Cpu className="w-3.5 h-3.5 text-blue-400 animate-spin" />;
      case 'Debugging':
        return <Clock className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#0c1220] border border-white/10 shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-sky-400 to-blue-600" />

        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="text-[11px] font-mono tracking-wider text-studio-muted uppercase">
              {isOnline ? 'Active Colleague' : 'Offline Member'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-white/5 border border-white/10 text-studio-muted rounded">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-studio-muted hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Member Profile Snapshot */}
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-md border border-white/10">
                {name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">{name}</h4>
                  <DisciplineBadge discipline={discipline} size="sm" />
                </div>
                <p className="text-xs text-studio-muted mt-0.5">{roleTitle}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-blue-400 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{currentRoom}</span>
                </div>
              </div>
            </div>

            {/* Live Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                status
              )}`}
            >
              {getStatusIcon(status)}
              <span>{status}</span>
            </div>
          </div>

          {/* Current Sprint Goal & Progress */}
          <div className="p-3.5 rounded-xl bg-[#070b14] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <Target className="w-3.5 h-3.5" />
                <span>Current Goal</span>
              </div>
              <span className="font-mono font-bold text-emerald-400">
                {progressPercentage}%
              </span>
            </div>

            <p className="text-xs text-studio-text/90 leading-relaxed">{currentGoal}</p>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-white/[0.02]">
          {onStartChat && (
            <button
              onClick={() => {
                onStartChat(member);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors shadow"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Kirim Pesan / Chat</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-studio-muted hover:text-white hover:bg-white/10 transition-colors ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
