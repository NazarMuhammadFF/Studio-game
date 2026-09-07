import React, { useState, useEffect } from 'react';
import { AudioSfxItem, InteractiveObjectDef } from '../../studio/types';

interface SfxWorkstationOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
  onSitAtWorkstation?: (workstation: InteractiveObjectDef) => void;
}

export const SfxWorkstationOverlay: React.FC<SfxWorkstationOverlayProps> = ({
  object,
  onClose,
  onSitAtWorkstation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  const sfxItems: AudioSfxItem[] = object.sfxItems || [
    {
      id: 'sfx_1',
      sfxName: 'Player Surface Footsteps (6-Step Round Robin)',
      category: 'Footsteps',
      owner: 'Taro Tanaka',
      progress: 95,
      status: 'In Game Ready',
      variationCount: 18,
      reviewState: 'approved',
      notes: 'Recorded across metal grating, wet tarmac, and concrete. Integrated into player walk cycle triggers.',
    },
    {
      id: 'sfx_2',
      sfxName: 'Kinetic Dash Strike Impact & Whoosh',
      category: 'Weapons',
      owner: 'Taro Tanaka',
      progress: 90,
      status: 'Mastering',
      reviewState: 'approved',
      notes: 'Crisp transient attack with analog synthesizer sub-bass drop on hit confirm.',
    },
    {
      id: 'sfx_3',
      sfxName: 'Perfect Parry Timing & Projectile Reflection Clink',
      category: 'Weapons',
      owner: 'Taro Tanaka',
      progress: 80,
      status: 'Synthesizing',
      reviewState: 'pending',
      notes: 'Glassy high-frequency chime to clearly signal parry window success amidst busy combat mix.',
    },
    {
      id: 'sfx_4',
      sfxName: 'Holographic Terminal Open, Select, & Back Bleeps',
      category: 'UI',
      owner: 'Taro Tanaka',
      progress: 100,
      status: 'In Game Ready',
      variationCount: 12,
      reviewState: 'approved',
      notes: 'Subtle, tactile UI chirps designed to never cause auditory fatigue during inventory management.',
    },
    {
      id: 'sfx_5',
      sfxName: 'Rain On Glass & Distant Sector Transformer Hum',
      category: 'Ambience',
      owner: 'Taro Tanaka',
      progress: 85,
      status: 'Mastering',
      reviewState: 'pending',
      notes: 'Continuous 4-channel ambient loop with randomized raindrop burst triggers.',
    },
    {
      id: 'sfx_6',
      sfxName: 'Cyber-Hound Aggro Growl & Mechanical Panting',
      category: 'Creatures',
      owner: 'Taro Tanaka',
      progress: 70,
      status: 'Recording',
      reviewState: 'pending',
      notes: 'Hybrid lion roar combined with pneumatic servo motor whine for Sector 1 patrol beasts.',
    },
  ];

  const filteredItems = sfxItems.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const categories = ['all', 'Footsteps', 'Weapons', 'UI', 'Ambience', 'Creatures'];

  const getStatusBadge = (state: AudioSfxItem['reviewState']) => {
    switch (state) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <span>✓</span> Ready
          </span>
        );
      case 'changes_requested':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <span>↺</span> Needs Retake
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
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
        className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-slate-900/95 border border-sky-500/40 rounded-2xl shadow-2xl shadow-sky-950/50 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-500/20 bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 font-bold text-lg">
              🎙️
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-sky-100">
                {workstation ? `${workstation.name} • SFX & Foley Station` : object.name}
              </h2>
              <p className="text-xs text-sky-300/80">
                {workstation?.roleTitle || 'Senior Sound Designer'} • Sound Effects & Transient Design
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
            <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-500/30 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-sky-200">{workstation.name}</span>
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
                <span className="text-xs font-bold text-sky-300 font-mono">
                  {workstation.progressPercentage}%
                </span>
                <div className="w-20 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${workstation.progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-medium capitalize transition-colors ${
                  selectedCategory === cat
                    ? 'bg-sky-600/30 text-sky-300 border border-sky-500/50'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* SFX Items List */}
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">{item.sfxName}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-900/40 text-sky-300 border border-sky-500/30">
                        {item.category}
                      </span>
                      {item.variationCount && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.variationCount} variations
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Designed by {item.owner} • Stage:{' '}
                      <span className="text-sky-300 font-semibold">{item.status}</span>
                    </p>
                  </div>
                  {getStatusBadge(item.reviewState)}
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    {item.notes}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Implementation Progress:</span>
                    <span className="font-mono font-bold text-sky-300">{item.progress}%</span>
                  </div>
                  <div className="w-36 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* External Reference Link */}
          {workstation?.externalWorkLink && (
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
              <span className="text-xs text-slate-300">Sound Library / DAW Asset:</span>
              <a
                href={workstation.externalWorkLink.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-400 hover:text-sky-300 underline font-mono flex items-center gap-1"
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
              className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
            >
              <span>💺</span>
              <span>Sit at SFX Workstation</span>
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
