import React, { useState, useEffect } from 'react';
import { AudioListeningReviewItem, InteractiveObjectDef } from '../../studio/types';

interface AudioListeningStationOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
}

export const AudioListeningStationOverlay: React.FC<AudioListeningStationOverlayProps> = ({
  object,
  onClose,
}) => {
  const [selectedItem, setSelectedItem] = useState<AudioListeningReviewItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [mockProgress, setMockProgress] = useState<number>(0);

  const listeningItems: AudioListeningReviewItem[] = object.listeningItems || [
    {
      id: 'rev_aud_1',
      title: 'Combat Stems — Sector 0 Mini-Boss Crescendo',
      category: 'Music',
      author: 'Elena Rostova',
      duration: '02:45',
      status: 'Awaiting Feedback',
      reviewState: 'pending',
      waveformProfile: [25, 40, 65, 80, 55, 70, 95, 85, 60, 45, 75, 90, 100, 60, 40],
      feedbackNotes:
        'Needs sidechain ducking test with player kinetic dash and parry sound effects. Ensure percussion does not mask high-frequency cues.',
      tags: ['combat', 'dynamic-stems', '140bpm', 'hybrid-orchestral'],
    },
    {
      id: 'rev_aud_2',
      title: 'Player Surface Footsteps (Metal Grate & Wet Asphalt)',
      category: 'SFX',
      author: 'Taro Tanaka',
      duration: '00:38',
      status: 'Revision Submitted',
      reviewState: 'pending',
      waveformProfile: [20, 85, 30, 90, 25, 75, 20, 80, 15, 70, 20, 85, 25, 60, 20],
      feedbackNotes:
        'Re-recorded with lighter heel impacts and reduced sub-bass rumbling. 6 randomized round-robin variations per surface.',
      tags: ['foley', 'footsteps', 'player-verbs', 'round-robin'],
    },
    {
      id: 'rev_aud_3',
      title: 'Cyber-Enforcer Heavy Shield Charge & Impact',
      category: 'SFX',
      author: 'Taro Tanaka',
      duration: '00:14',
      status: 'Final Mix Check',
      reviewState: 'approved',
      waveformProfile: [30, 45, 60, 80, 95, 100, 70, 40, 30, 20, 15, 10, 5, 2, 0],
      feedbackNotes:
        'Excellent weighty metallic resonance. Tested against player shield parry; feedback clarity is sharp and punchy.',
      tags: ['combat', 'enemy-sfx', 'impact', 'approved'],
    },
    {
      id: 'rev_aud_4',
      title: 'Sector 1 Neon Underbelly Ambient Drone & HVAC Hum',
      category: 'Ambience',
      author: 'Julian Vance',
      duration: '03:12',
      status: 'Awaiting Feedback',
      reviewState: 'pending',
      waveformProfile: [40, 45, 42, 48, 44, 46, 50, 48, 45, 43, 46, 48, 45, 42, 40],
      feedbackNotes:
        'Seamless quad-surround loop test. Reverb decay set to 1.8s for alleyway corridors with wet high-pass filter.',
      tags: ['environment', 'ambient-loop', 'reverb', 'immersive'],
    },
  ];

  useEffect(() => {
    if (!selectedItem && listeningItems.length > 0) {
      setSelectedItem(listeningItems[0]);
    }
  }, [listeningItems, selectedItem]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Mock audio player animation loop
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setMockProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 250);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const getStatusBadge = (state: AudioListeningReviewItem['reviewState']) => {
    switch (state) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <span>✓</span> Approved Mix
          </span>
        );
      case 'changes_requested':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <span>↺</span> Revision Needed
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
        className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-slate-900/95 border border-purple-500/40 rounded-2xl shadow-2xl shadow-purple-950/50 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 font-bold text-lg">
              🔊
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-purple-100">
                {object.name || 'Studio Listening & Audio Review Console'}
              </h2>
              <p className="text-xs text-purple-300/80">
                Reference monitor listening session, dynamic stem inspection, and mix approvals
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

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Review Queue List */}
          <div className="md:col-span-5 border-r border-slate-800 p-4 overflow-y-auto space-y-2 bg-slate-950/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center justify-between">
              <span>Review Queue ({listeningItems.length})</span>
              <span className="text-[10px] text-purple-400 font-mono">Reference Stems</span>
            </h3>

            {listeningItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setIsPlaying(false);
                    setMockProgress(0);
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500/50 shadow-md shadow-purple-950/50'
                      : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-slate-100 line-clamp-1">{item.title}</span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{item.duration}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">By {item.author}</span>
                    {getStatusBadge(item.reviewState)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Item Review & Mock Audio Player */}
          <div className="md:col-span-7 p-6 overflow-y-auto space-y-5 flex flex-col justify-between bg-slate-900/60">
            {selectedItem ? (
              <div className="space-y-5">
                {/* Active Item Title & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-500/30">
                      {selectedItem.category.toUpperCase()} STEM
                    </span>
                    <h3 className="text-base font-bold text-slate-100 mt-1.5">{selectedItem.title}</h3>
                    <p className="text-xs text-slate-400">Composed / Designed by {selectedItem.author}</p>
                  </div>
                  {getStatusBadge(selectedItem.reviewState)}
                </div>

                {/* Simulated Waveform & Audio Player Component */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-purple-500/30 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                      <span>{isPlaying ? 'PLAYING PREVIEW' : 'PAUSED'}</span>
                    </div>
                    <span>{selectedItem.duration} (48kHz / 24-bit PCM)</span>
                  </div>

                  {/* Animated Waveform Bars */}
                  <div className="h-16 flex items-end justify-between gap-1 px-2 py-1 bg-slate-900/80 rounded-lg border border-slate-800">
                    {selectedItem.waveformProfile.map((amp, idx) => {
                      const isActive = (idx / selectedItem.waveformProfile.length) * 100 <= mockProgress;
                      const dynamicHeight = isPlaying ? Math.max(15, (amp + (idx % 3) * 10) % 100) : amp;
                      return (
                        <div
                          key={idx}
                          className="w-full rounded-sm transition-all duration-150"
                          style={{
                            height: `${dynamicHeight}%`,
                            backgroundColor: isActive ? '#a855f7' : '#334155',
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Scrubber Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-200"
                      style={{ width: `${mockProgress}%` }}
                    />
                  </div>

                  {/* Transport Controls */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={togglePlayback}
                      className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition-colors flex items-center gap-2"
                    >
                      <span>{isPlaying ? '⏸ Pause' : '▶ Play Preview'}</span>
                    </button>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span>Volume: 85%</span>
                      <span className="text-[10px] text-slate-500">• Mock DAW Preview</span>
                    </div>
                  </div>
                </div>

                {/* Reviewer Feedback Notes */}
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Mix Feedback & Review Notes
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedItem.feedbackNotes}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedItem.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Select an audio stem from the review queue to inspect and listen.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-purple-400">●</span>
            <span>Studio Listening Console • Calibrated Stereo Headroom</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
