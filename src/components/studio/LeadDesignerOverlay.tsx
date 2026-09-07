import React, { useEffect } from 'react';
import { InteractiveObjectDef, LeadDesignOverview } from '../../studio/types';

interface LeadDesignerOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
}

export const LeadDesignerOverlay: React.FC<LeadDesignerOverlayProps> = ({
  object,
  onClose,
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

  const overview: LeadDesignOverview | undefined = object.leadDesignOverview;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900/95 border border-emerald-500/40 rounded-2xl shadow-2xl shadow-emerald-950/50 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold text-lg">
              🎯
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-emerald-100">
                {overview?.leadName || 'Lead Game Designer Desk'}
              </h2>
              <p className="text-xs text-emerald-300/80">
                {overview?.roleTitle || 'Lead Systems & Combat Designer'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex text-[11px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
              ESC to close
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Overall Progress */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Overall Gameplay Design Completion
              </span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {overview?.overallDesignProgress ?? 75}%
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${overview?.overallDesignProgress ?? 75}%` }}
              />
            </div>
          </div>

          {/* Core Design Pillars */}
          {overview?.corePillars && overview.corePillars.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Core Design Pillars
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {overview.corePillars.map((pillar, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 text-center flex items-center justify-center"
                  >
                    {pillar}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Design Goals */}
          {overview?.activeDesignGoals && overview.activeDesignGoals.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Active Design Goals
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Sprint 2 Focus
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {overview.activeDesignGoals.map((g, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mechanics in Review Counter */}
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/80 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Mechanics Awaiting Peer Playtest & Review
            </span>
            <span className="text-sm font-bold text-amber-400 font-mono">
              {overview?.mechanicsInReviewCount ?? 2} in queue
            </span>
          </div>

          {/* Blockers */}
          {overview?.blockedItems && overview.blockedItems.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs uppercase tracking-wider">
                <span>⚠️</span> Active Design Blockers
              </div>
              <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                {overview.blockedItems.map((b, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Game Design Leadership Station</span>
          <span className="font-mono text-[11px] text-slate-500">
            Design Room Layer • StudioGame V1
          </span>
        </div>
      </div>
    </div>
  );
};
