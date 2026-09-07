import React, { useEffect } from 'react';
import { AudioMusicTrack, InteractiveObjectDef } from '../../studio/types';

interface MusicWorkstationOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
  onSitAtWorkstation?: (workstation: InteractiveObjectDef) => void;
}

export const MusicWorkstationOverlay: React.FC<MusicWorkstationOverlayProps> = ({
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

  const workstation = object.workstationData;

  const tracks: AudioMusicTrack[] = object.musicTracks || [
    {
      id: 'trk_1',
      trackName: 'Neon City Infiltration — Stealth Theme',
      owner: 'Elena Rostova',
      progress: 90,
      status: 'Mixing',
      reviewState: 'approved',
      duration: '03:24',
      bpm: 124,
      category: 'Exploration',
      notes: 'Low-tension ambient synth layers with analog filter sweeps. Stems split into Rhythm, Bass, Lead, and Pad.',
      externalUrl: 'https://soundcloud.com/example/stealth-theme',
    },
    {
      id: 'trk_2',
      trackName: 'Sector 0 Mini-Boss — Kinetic Clash',
      owner: 'Elena Rostova',
      progress: 85,
      status: 'Arranging',
      reviewState: 'pending',
      duration: '02:48',
      bpm: 142,
      category: 'Combat',
      notes: 'High-intensity dynamic combat loops. Features 3-tier layering triggered by enemy aggro levels.',
      externalUrl: 'https://soundcloud.com/example/kinetic-clash',
    },
    {
      id: 'trk_3',
      trackName: 'Quarantine Gate Climax — Heavy Orchestral Climax',
      owner: 'Elena Rostova',
      progress: 60,
      status: 'Composing',
      reviewState: 'changes_requested',
      duration: '04:10',
      bpm: 130,
      category: 'Boss',
      notes: 'Director requested more brass presence and heavier sub-bass hits for phase 2 transition.',
      externalUrl: 'https://soundcloud.com/example/boss-climax',
    },
    {
      id: 'trk_4',
      trackName: 'Main Title & Studio Boot Theme',
      owner: 'Elena Rostova',
      progress: 100,
      status: 'Mastered',
      reviewState: 'approved',
      duration: '01:50',
      bpm: 110,
      category: 'Menu',
      notes: 'Mastered to -14 LUFS integrated. Clean loop points for main menu screen.',
      externalUrl: 'https://soundcloud.com/example/title-theme',
    },
  ];

  const getStatusBadge = (state: AudioMusicTrack['reviewState']) => {
    switch (state) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <span>✓</span> Approved
          </span>
        );
      case 'changes_requested':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <span>↺</span> Changes Needed
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <span>⏳</span> In Review
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-slate-900/95 border border-fuchsia-500/40 rounded-2xl shadow-2xl shadow-fuchsia-950/50 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-fuchsia-500/20 bg-gradient-to-r from-fuchsia-950/60 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-400 font-bold text-lg">
              🎹
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-fuchsia-100">
                {workstation ? `${workstation.name} • Music Production Station` : object.name}
              </h2>
              <p className="text-xs text-fuchsia-300/80">
                {workstation?.roleTitle || 'Composer & Synthesist'} • Dynamic Soundtrack Stems
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Member Status Card */}
          {workstation && (
            <div className="p-4 rounded-xl bg-fuchsia-950/20 border border-fuchsia-500/30 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-fuchsia-200">{workstation.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {workstation.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  <span className="text-slate-400">Current Goal: </span>
                  {workstation.currentGoal}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-fuchsia-300 font-mono">
                  {workstation.progressPercentage}%
                </span>
                <div className="w-20 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                  <div
                    className="h-full bg-fuchsia-500 rounded-full"
                    style={{ width: `${workstation.progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Current Music Tracks List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Active Soundtrack Tracks ({tracks.length})</span>
              <span className="text-[10px] font-mono text-fuchsia-400">DAW Stems</span>
            </h3>

            <div className="space-y-3">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-100">{track.trackName}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-fuchsia-900/40 text-fuchsia-300 border border-fuchsia-500/30">
                          {track.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        By {track.owner} • {track.duration} • {track.bpm} BPM • Stage:{' '}
                        <span className="text-fuchsia-300 font-semibold">{track.status}</span>
                      </p>
                    </div>
                    {getStatusBadge(track.reviewState)}
                  </div>

                  {track.notes && (
                    <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      {track.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Arrangement Progress:</span>
                      <span className="font-mono font-bold text-fuchsia-300">{track.progress}%</span>
                    </div>
                    <div className="w-36 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-400 rounded-full"
                        style={{ width: `${track.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* External Reference Link */}
          {workstation?.externalWorkLink && (
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
              <span className="text-xs text-slate-300">DAW Project & Audio Stems:</span>
              <a
                href={workstation.externalWorkLink.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-fuchsia-400 hover:text-fuchsia-300 underline font-mono flex items-center gap-1"
              >
                <span>{workstation.externalWorkLink.label}</span>
                <span>↗</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60">
          {onSitAtWorkstation && workstation && (
            <button
              onClick={() => {
                onSitAtWorkstation(object);
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
            >
              <span>💺</span>
              <span>Sit at Music Workstation</span>
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
