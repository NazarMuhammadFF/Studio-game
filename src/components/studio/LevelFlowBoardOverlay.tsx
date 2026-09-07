import React, { useEffect } from 'react';
import { DesignFlowItem, InteractiveObjectDef } from '../../studio/types';

interface LevelFlowBoardOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
}

export const LevelFlowBoardOverlay: React.FC<LevelFlowBoardOverlayProps> = ({
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

  const flowItems: DesignFlowItem[] = object.flowItems || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-slate-900/95 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 font-bold text-lg">
              🗺️
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-cyan-100">
                {object.name || 'Level & Gameplay Flow Planning'}
              </h2>
              <p className="text-xs text-cyan-300/80">
                Campaign progression, mission pacing, difficulty ramps, and onboarding curve
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

        {/* Pacing Overview Banner */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-cyan-400 uppercase tracking-wider text-[11px]">
              Active Campaign Arc:
            </span>
            <span>Act 1 — Infiltration of the Neon Underbelly</span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400/80">
            Pacing Curve: 3 Sequential Phases
          </span>
        </div>

        {/* Level Flow Steps List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="relative border-l-2 border-cyan-500/30 ml-4 pl-6 space-y-6">
            {flowItems.map((item) => (
              <div key={item.id} className="relative group">
                {/* Node marker on timeline */}
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-cyan-500 border-2 border-slate-900 group-hover:scale-125 transition-transform" />

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 hover:border-cyan-500/50 hover:bg-slate-800/90 transition-all space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                        {item.levelOrPhase}
                      </span>
                      <h3 className="text-base font-bold text-white">
                        {item.title}
                      </h3>
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                      {item.targetPacing}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="font-semibold text-amber-400">Core Gate:</span>
                      <span>{item.coreChallenge}</span>
                    </div>

                    {item.externalDocUrl && (
                      <a
                        href={item.externalDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600 hover:text-white transition-all shrink-0"
                      >
                        <span>FigJam / Miro Board</span>
                        <span>↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {flowItems.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">No level flow items documented.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Level Flow & Progression Matrix</span>
          <span className="font-mono text-[11px] text-slate-500">
            Design Room Layer • StudioGame V1
          </span>
        </div>
      </div>
    </div>
  );
};
