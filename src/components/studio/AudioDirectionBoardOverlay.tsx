import React, { useState, useEffect } from 'react';
import { AudioDirectionData, InteractiveObjectDef } from '../../studio/types';

interface AudioDirectionBoardOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
}

export const AudioDirectionBoardOverlay: React.FC<AudioDirectionBoardOverlayProps> = ({
  object,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'direction' | 'priorities' | 'guidelines'>('direction');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const directionData: AudioDirectionData = object.audioDirectionData || {
    musicDirection:
      'Dark hybrid synth-orchestral with reactive stems (Exploring, Low Tension, Climax Boss). Analog warmth with punchy digital transients.',
    ambienceDirection:
      'Layered industrial cyberpunk soundscapes. Wet asphalt reflections, subtle HVAC air circulation, neon capacitor buzz, and distant sector rail hums.',
    sfxStyle:
      'Physical, weighty kinetic impacts. High transient punch with metallic resonance and short, crisp sub-bass tail.',
    currentPriorities: [
      'Finalize combat transition stems for Sector 0 mini-boss',
      'Surface-aware player footsteps (metal grating, wet concrete, puddles)',
      'Synthesize holographic UI confirmation chirps and parry impact spike',
    ],
    blockedItems: [
      'Awaiting boss phase 2 animation timings to lock musical crescendo hits',
      'Need collision audio triggers placed in Sector 1 sewer tunnels',
    ],
    audioEngineStack: 'FMOD Studio 2.02 + WebAudio / Phaser Sound Subsystem',
    guidelines: [
      'Mix target baseline: -14 LUFS integrated for music, -6 dB peak headroom for combat SFX',
      'All continuous ambient loops must have seamless zero-crossing loop points',
      'Prioritize sidechain ducking on low-end frequencies when dialogue or critical parry cues play',
    ],
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-slate-900/95 border border-purple-500/40 rounded-2xl shadow-2xl shadow-purple-950/50 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-950/50 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 font-bold text-lg">
              🎵
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-purple-100">
                {object.name || 'Audio Direction & Aesthetic Blueprint'}
              </h2>
              <p className="text-xs text-purple-300/80">
                Core sonic pillars, music arrangements, Foley ambience, and sprint priorities
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-800 bg-slate-950/40 text-sm">
          <button
            onClick={() => setActiveTab('direction')}
            className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors ${
              activeTab === 'direction'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Aesthetic Direction
          </button>
          <button
            onClick={() => setActiveTab('priorities')}
            className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'priorities'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>Priorities & Blockers</span>
            {directionData.blockedItems.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {directionData.blockedItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors ${
              activeTab === 'guidelines'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Technical Specs & Standards
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'direction' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Music Direction */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-purple-300 font-semibold text-sm">
                    <span>🎼</span>
                    <h3>Music Direction</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {directionData.musicDirection}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-purple-500/10 flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/40 text-purple-300">Synthwave</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/40 text-purple-300">Reactive Stems</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/40 text-purple-300">120-145 BPM</span>
                </div>
              </div>

              {/* Ambience Direction */}
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-cyan-300 font-semibold text-sm">
                    <span>🌧️</span>
                    <h3>Ambience & Environment</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {directionData.ambienceDirection}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-cyan-500/10 flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/40 text-cyan-300">Cyberpunk Drone</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/40 text-cyan-300">Dynamic Reverb</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/40 text-cyan-300">Wet Streets</span>
                </div>
              </div>

              {/* SFX Style */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-emerald-300 font-semibold text-sm">
                    <span>⚡</span>
                    <h3>SFX & Combat Style</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {directionData.sfxStyle}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-500/10 flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300">Fast Transient</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300">Analog Crunch</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300">Satisfying Parry</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'priorities' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current Priorities */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="flex items-center gap-2 mb-3 text-purple-300 font-semibold text-sm">
                  <span>🎯</span>
                  <h3>Current Audio Priorities</h3>
                </div>
                <ul className="space-y-2.5">
                  {directionData.currentPriorities.map((item, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200"
                    >
                      <span className="text-purple-400 font-mono font-bold">{idx + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Blocked Items */}
              <div className="p-4 rounded-xl bg-rose-950/15 border border-rose-500/30">
                <div className="flex items-center gap-2 mb-3 text-rose-300 font-semibold text-sm">
                  <span>⚠️</span>
                  <h3>Blocked / Dependencies</h3>
                </div>
                <ul className="space-y-2.5">
                  {directionData.blockedItems.map((item, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 rounded-lg bg-rose-900/20 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-200"
                    >
                      <span className="text-rose-400 font-bold">!</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'guidelines' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
                  Audio Pipeline & Engine Architecture
                </h4>
                <p className="text-xs font-mono text-purple-200 bg-purple-950/40 p-2.5 rounded-lg border border-purple-500/30">
                  {directionData.audioEngineStack}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Loudness & Mixing Standards
                </h4>
                {directionData.guidelines.map((guide, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                  >
                    <span className="text-purple-400">❖</span>
                    <span>{guide}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span>Sound System: Operational • Sprint 3</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 font-medium transition-colors border border-purple-500/40"
          >
            Close Board
          </button>
        </div>
      </div>
    </div>
  );
};
