import React, { useEffect } from 'react';
import { InteractiveObjectDef, LeadAudioOverview } from '../../studio/types';

interface LeadAudioOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
  onSitAtWorkstation?: (workstation: InteractiveObjectDef) => void;
}

export const LeadAudioOverlay: React.FC<LeadAudioOverlayProps> = ({
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

  const overview: LeadAudioOverview = object.leadAudioOverview || {
    leadName: 'Julian Vance',
    roleTitle: 'Audio Director & Lead Sound Designer',
    overallAudioProgress: 82,
    pillarAesthetics: [
      'Modular Stem Mixing',
      'High-Impact Physical Transients',
      'Diegetic Environmental Immersion',
    ],
    activeAudioGoals: [
      'Balance combat music volume sidechain vs parry SFX spikes',
      'Master Sector 0 boss phase transition crescendos',
      'Implement footstep material switch surface detection',
      'Calibrate headphone virtual 3D surround sound spatializer',
    ],
    itemsWaitingReviewCount: 3,
    blockedItems: [
      'Awaiting audio hit markers from animation department for kinetic dash strike',
      'Need updated reverb volume bounding box for Sector 1 sewer junction',
    ],
  };

  const workstationData = object.workstationData;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-slate-900/95 border border-purple-500/40 rounded-2xl shadow-2xl shadow-purple-950/50 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 font-bold text-lg">
              🎧
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-purple-100">
                {overview.leadName} • Audio Direction
              </h2>
              <p className="text-xs text-purple-300/80">{overview.roleTitle}</p>
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Progress & Quick Stats Card */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-200">Overall Audio Pipeline Progress</span>
              <span className="text-sm font-bold font-mono text-purple-300">
                {overview.overallAudioProgress}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${overview.overallAudioProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-purple-500/20 flex items-center justify-between">
                <span className="text-slate-400">Waiting for Review:</span>
                <span className="font-bold text-amber-300 font-mono">
                  {overview.itemsWaitingReviewCount} Tracks / Stems
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-purple-500/20 flex items-center justify-between">
                <span className="text-slate-400">Blocked Dependencies:</span>
                <span className="font-bold text-rose-300 font-mono">
                  {overview.blockedItems.length} Items
                </span>
              </div>
            </div>
          </div>

          {/* Core Sonic Pillars */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Audio Production Pillars
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {overview.pillarAesthetics.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-center text-xs font-semibold text-purple-300"
                >
                  {pillar}
                </div>
              ))}
            </div>
          </div>

          {/* Active Audio Goals */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Active Sprint Audio Goals
            </h3>
            <ul className="space-y-2">
              {overview.activeAudioGoals.map((goal, idx) => (
                <li
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-start gap-2.5 text-xs text-slate-200"
                >
                  <span className="text-purple-400 font-bold">✓</span>
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Blockers */}
          {overview.blockedItems.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                <span>⚠️</span>
                <span>Active Blocker Items</span>
              </h3>
              <ul className="space-y-2">
                {overview.blockedItems.map((blocker, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2"
                  >
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{blocker}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* External Reference Link */}
          {workstationData?.externalWorkLink && (
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
              <span className="text-xs text-slate-300">
                FMOD Session & Audio Master Spec:
              </span>
              <a
                href={workstationData.externalWorkLink.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-purple-400 hover:text-purple-300 underline font-mono flex items-center gap-1"
              >
                <span>{workstationData.externalWorkLink.label}</span>
                <span>↗</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60">
          {onSitAtWorkstation && workstationData && (
            <button
              onClick={() => {
                onSitAtWorkstation(object);
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
            >
              <span>💺</span>
              <span>Sit at Audio Console</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
