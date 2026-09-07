import React, { useEffect } from 'react';
import { ArtDirectorOverview, InteractiveObjectDef } from '../../studio/types';

interface ArtDirectorOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
}

export const ArtDirectorOverlay: React.FC<ArtDirectorOverlayProps> = ({
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

  const overview: ArtDirectorOverview | undefined = object.artDirectorOverview;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900/95 border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-950/50 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold text-lg">
              👑
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-amber-100">
                {overview?.directorName || 'Art Director Workstation'}
              </h2>
              <p className="text-xs text-amber-300/80">
                {overview?.roleTitle || 'Studio Art Director & Visual Supervisor'}
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

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Current Visual Direction Card */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Active Visual Direction
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                V1 Production
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {overview?.currentVisualDirection ||
                'High-contrast pixel styling blended with vibrant neon palettes and readable silhouette hierarchy.'}
            </p>
          </div>

          {/* Color Palette Keys */}
          {overview?.colorPaletteKeys && overview.colorPaletteKeys.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Core Styleguide Palette
              </span>
              <div className="grid grid-cols-5 gap-2">
                {overview.colorPaletteKeys.map((color, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center gap-1.5 text-center group"
                  >
                    <div
                      className="w-full h-8 rounded border border-white/20 shadow-inner group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {color}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestone and Review queue stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Active Milestone
              </span>
              <p className="text-sm font-bold text-white">
                {overview?.activeMilestone || 'Milestone 2 — Core Asset Set'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Pending Review Queue
              </span>
              <p className="text-sm font-bold text-amber-400">
                {overview?.itemsWaitingReviewCount ?? 3} assets waiting critique
              </p>
            </div>
          </div>

          {/* Blockers / Quality Notes */}
          {overview?.blockers && overview.blockers.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs uppercase tracking-wider">
                <span>⚠️</span> Active Visual Blockers & Quality Notes
              </div>
              <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                {overview.blockers.map((b, idx) => (
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
          <span>Art Leadership Desk</span>
          <span className="font-mono text-[11px] text-slate-500">
            Art Room Layer • StudioGame V1
          </span>
        </div>
      </div>
    </div>
  );
};
