import React, { useEffect } from 'react';
import { InteractiveObjectDef } from '@/studio/types';
import { DisciplineBadge } from '@/components/profile/DisciplineBadge';
import {
  X,
  ExternalLink,
  Target,
  CheckCircle2,
  Clock,
  Sparkles,
  GitPullRequest,
  Cpu,
  Laptop,
} from 'lucide-react';

interface WorkstationOverlayProps {
  object: InteractiveObjectDef | null;
  onClose: () => void;
  onSitAtWorkstation?: (workstation: InteractiveObjectDef) => void;
}

export const WorkstationOverlay: React.FC<WorkstationOverlayProps> = ({
  object,
  onClose,
  onSitAtWorkstation,
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

  if (!object || !object.workstationData) return null;

  const { workstationData } = object;

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
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
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#0e1524] border border-white/10 shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-500" />

        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-studio-text tracking-wide">
                {object.name}
              </h3>
              <p className="text-[11px] font-mono text-studio-muted">
                {object.roomType.toUpperCase()} LAB • WORKSTATION
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-white/5 border border-white/10 text-studio-muted rounded">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-studio-muted hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="p-6 space-y-5">
          {/* Member Profile Row */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-md border border-white/10">
                {workstationData.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">
                    {workstationData.name}
                  </h4>
                  <DisciplineBadge discipline={workstationData.discipline} size="sm" />
                </div>
                <p className="text-xs text-studio-muted mt-0.5">
                  {workstationData.roleTitle}
                </p>
              </div>
            </div>

            {/* Live Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                workstationData.status
              )}`}
            >
              {getStatusIcon(workstationData.status)}
              <span>{workstationData.status}</span>
            </div>
          </div>

          {/* Current Sprint Goal & Progress */}
          <div className="p-4 rounded-xl bg-[#090d16] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <Target className="w-4 h-4" />
                <span>Current Goal</span>
              </div>
              <span className="font-mono font-bold text-white">
                {workstationData.progressPercentage}% Complete
              </span>
            </div>

            <p className="text-xs text-studio-text/90 leading-relaxed">
              {workstationData.currentGoal}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, workstationData.progressPercentage))}%` }}
              />
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-studio-muted">
              <span>Active Task: <strong className="text-studio-text font-normal">{workstationData.currentTaskTitle}</strong></span>
            </div>
          </div>

          {/* External Work Link (If Available) */}
          {workstationData.externalWorkLink && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2.5">
                <GitPullRequest className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <p className="text-[11px] text-studio-muted">External Deliverable</p>
                  <p className="text-xs font-medium text-blue-300">
                    {workstationData.externalWorkLink.label}
                  </p>
                </div>
              </div>
              <a
                href={workstationData.externalWorkLink.url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <span>Open Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-studio-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            Close Window
          </button>

          {onSitAtWorkstation && (
            <button
              onClick={() => {
                onSitAtWorkstation(object);
                onClose();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition-all flex items-center gap-1.5 ${
                object.workstationStatus === 'available'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>
                {object.workstationStatus === 'available'
                  ? 'Claim & Sit at Desk'
                  : 'Sit & Work at Workstation'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
