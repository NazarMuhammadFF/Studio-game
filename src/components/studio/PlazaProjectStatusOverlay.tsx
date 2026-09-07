import React, { useEffect } from 'react';
import { InteractiveObjectDef, PlazaProjectStatusData } from '../../studio/types';

interface PlazaProjectStatusOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
}

export const PlazaProjectStatusOverlay: React.FC<PlazaProjectStatusOverlayProps> = ({
  object,
  onClose,
}) => {
  const defaultStatus: PlazaProjectStatusData = {
    projectName: 'Cyberpunk Odyssey: Protocol Zero',
    milestone: 'Milestone 2 — Core Combat & Alpha Playtest',
    overallProgress: 76,
    blockedCount: 2,
    waitingReviewCount: 4,
    activeSprint: 'Sprint 14',
    daysRemainingInSprint: 4,
    topPriorityGoal:
      'Penyelesaian deteksi tabrakan 2D tanpa celah dan sinkronisasi audio dynamic combat loop',
    quickMetrics: [
      { label: 'Sprint Velocity', value: '92%' },
      { label: 'Build Pass Rate', value: '99.4%' },
      { label: 'Open PRs', value: '5 Pending' },
      { label: 'Active Playtesters', value: '12 Internal' },
    ],
  };

  const status = object.plazaProjectStatusData || defaultStatus;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex h-auto max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-sky-500/40 bg-zinc-950 text-zinc-100 shadow-2xl shadow-sky-950/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40 text-lg">
              ⚡
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-sky-500/20 px-2 py-0.5 text-xs font-semibold text-sky-300 border border-sky-500/30">
                  PROJECT QUICK STATUS
                </span>
                <span className="text-xs text-zinc-400">{status.activeSprint}</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide mt-0.5">
                {status.projectName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-800 p-2 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
            title="Tutup (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Milestone & Overall Progress */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Milestone Aktif
                </div>
                <div className="text-base font-bold text-white mt-0.5">{status.milestone}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Progres Keseluruhan
                </div>
                <div className="text-2xl font-black text-sky-400 mt-0.5">
                  {status.overallProgress}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${status.overallProgress}%` }}
              ></div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
              <span>Sisa Waktu Sprint: <strong className="text-zinc-200">{status.daysRemainingInSprint} Hari</strong></span>
              <span className="text-emerald-400 font-medium">Sprint On Track</span>
            </div>
          </div>

          {/* Quick Counter Badges (Blocked & Waiting Review) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">Kendala Aktif (Blocked)</span>
                <span className="text-xl font-bold text-amber-400">{status.blockedCount}</span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Memerlukan evaluasi lead sebelum playtest
              </p>
            </div>

            <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">Menunggu Review</span>
                <span className="text-xl font-bold text-purple-400">
                  {status.waitingReviewCount}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                PR dan aset dalam antrian persetujuan
              </p>
            </div>
          </div>

          {/* Top Priority Goal Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-1.5 flex items-center gap-1.5">
              <span>🎯</span> Fokus Prioritas Utama Sprint
            </div>
            <p className="text-xs text-zinc-200 leading-relaxed">{status.topPriorityGoal}</p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {status.quickMetrics.map((m, i) => (
              <div key={i} className="rounded-lg bg-zinc-900/80 p-3 border border-zinc-800/80">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider">{m.label}</div>
                <div className="text-sm font-bold text-white mt-0.5">{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/90 px-6 py-3 text-xs text-zinc-400">
          <span>Ringkasan status proyek ringan untuk koordinasi harian seluruh tim.</span>
          <div className="flex items-center gap-2">
            <kbd className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-300 border border-zinc-700">
              Esc
            </kbd>
            <span>Tutup</span>
          </div>
        </div>
      </div>
    </div>
  );
};
