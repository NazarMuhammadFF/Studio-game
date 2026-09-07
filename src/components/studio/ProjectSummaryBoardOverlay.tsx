import React, { useState, useEffect } from 'react';
import { InteractiveObjectDef, ProjectSummaryData } from '../../studio/types';

interface ProjectSummaryBoardOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
}

export const ProjectSummaryBoardOverlay: React.FC<ProjectSummaryBoardOverlayProps> = ({
  object,
  onClose,
}) => {
  const [filterDept, setFilterDept] = useState<string>('All');

  const defaultSummary: ProjectSummaryData = {
    projectName: 'Cyberpunk Odyssey: Protocol Zero',
    currentMilestone: 'Milestone 2 — Core Combat & Alpha Playtest',
    targetReleaseDate: '24 Oktober 2026',
    overallProgress: 76,
    activeGoals: [
      {
        department: 'Programming',
        goal: 'Sistem pergerakan avatar, bounds collision map, & room detection realtime',
        progress: 92,
        owner: 'Devon Vance',
      },
      {
        department: 'Art',
        goal: 'Environment visual meeting room, sound studio tiles, & lighting accents',
        progress: 85,
        owner: 'Maya Lin',
      },
      {
        department: 'Design',
        goal: 'Balancing curve boss encounter & integrasi spec multi-room interaction',
        progress: 78,
        owner: 'Alex Rivera',
      },
      {
        department: 'Audio',
        goal: 'Mixing dynamic combat stems & surround acoustic room ambiance',
        progress: 72,
        owner: 'Julian Vance',
      },
    ],
    blockers: [
      {
        id: 'blk_1',
        title: 'Player camera jitter saat melewati batas lorong simetris di frame rate rendah',
        severity: 'medium',
        department: 'Programming',
      },
      {
        id: 'blk_2',
        title: 'Normal map art asset pada monitor meeting screen memerlukan optimasi VRAM',
        severity: 'medium',
        department: 'Art',
      },
    ],
    waitingReview: [
      {
        id: 'rev_1',
        item: 'PR #124: Multi-Seat Interactive Reservation System',
        submittedBy: 'Devon Vance',
        type: 'Code PR',
      },
      {
        id: 'rev_2',
        item: 'Sector 0 Boss Encounter Soundtrack (4 Stems Mastered)',
        submittedBy: 'Elena Rostova',
        type: 'Audio Track',
      },
      {
        id: 'rev_3',
        item: 'Design Document: Interactive Table Seating UX v1.2',
        submittedBy: 'Alex Rivera',
        type: 'Design Spec',
      },
      {
        id: 'rev_4',
        item: '3D High-Poly Turret Concept & Texture Sheet',
        submittedBy: 'Kai Tanaka',
        type: 'Art Asset',
      },
    ],
  };

  const summary = object.projectSummaryData || defaultSummary;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredGoals =
    filterDept === 'All'
      ? summary.activeGoals
      : summary.activeGoals.filter((g) => g.department === filterDept);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex h-[88vh] max-h-[760px] w-full max-w-5xl flex-col rounded-xl border border-sky-500/40 bg-zinc-950 text-zinc-100 shadow-2xl shadow-sky-950/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40 text-lg">
              📊
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-sky-500/20 px-2 py-0.5 text-xs font-semibold text-sky-300 border border-sky-500/30">
                  PROJECT SUMMARY BOARD
                </span>
                <span className="text-xs text-zinc-400">
                  Target Rilis: <strong className="text-zinc-200">{summary.targetReleaseDate}</strong>
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide mt-0.5">
                {summary.projectName} • {summary.currentMilestone}
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

        {/* Milestone & Overall Progress Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-zinc-800 bg-zinc-900/40 px-6 py-4">
          <div className="rounded-lg bg-zinc-950/70 p-3.5 border border-zinc-800/80">
            <div className="text-[11px] uppercase font-semibold text-zinc-400">Overall Progress</div>
            <div className="flex items-end justify-between mt-1">
              <span className="text-2xl font-black text-sky-400">{summary.overallProgress}%</span>
              <span className="text-xs text-emerald-400 font-medium">On Track</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${summary.overallProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="rounded-lg bg-zinc-950/70 p-3.5 border border-zinc-800/80">
            <div className="text-[11px] uppercase font-semibold text-zinc-400">Tujuan Aktif</div>
            <div className="text-2xl font-black text-white mt-1">{summary.activeGoals.length}</div>
            <div className="text-xs text-zinc-500 mt-1">Lintas 4 disiplin tim</div>
          </div>

          <div className="rounded-lg bg-zinc-950/70 p-3.5 border border-zinc-800/80">
            <div className="text-[11px] uppercase font-semibold text-zinc-400">Kendala / Blockers</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{summary.blockers.length}</div>
            <div className="text-xs text-zinc-400 mt-1">Tidak ada isu kritis</div>
          </div>

          <div className="rounded-lg bg-zinc-950/70 p-3.5 border border-zinc-800/80">
            <div className="text-[11px] uppercase font-semibold text-zinc-400">Antrian Review</div>
            <div className="text-2xl font-black text-purple-400 mt-1">{summary.waitingReview.length}</div>
            <div className="text-xs text-zinc-500 mt-1">Menunggu persetujuan</div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Goals by Discipline */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <span>🎯</span> Progres Berdasarkan Disiplin
              </h3>

              {/* Department Filter Pills */}
              <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-lg border border-zinc-800 text-xs">
                {['All', 'Programming', 'Art', 'Design', 'Audio'].map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setFilterDept(dept)}
                    className={`rounded px-2.5 py-0.5 font-medium transition ${
                      filterDept === dept
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGoals.map((g, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-zinc-800/80 bg-zinc-950/70 p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          g.department === 'Programming'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : g.department === 'Art'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : g.department === 'Design'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                        }`}
                      >
                        {g.department}
                      </span>
                      <span className="font-mono text-sm font-bold text-white">{g.progress}%</span>
                    </div>
                    <div className="text-sm font-medium text-zinc-200 mt-2">{g.goal}</div>
                  </div>

                  <div className="mt-4">
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          g.department === 'Programming'
                            ? 'bg-blue-500'
                            : g.department === 'Art'
                            ? 'bg-purple-500'
                            : g.department === 'Design'
                            ? 'bg-emerald-500'
                            : 'bg-pink-500'
                        }`}
                        style={{ width: `${g.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-2">
                      Penanggung Jawab: <span className="text-zinc-200 font-medium">{g.owner}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blockers & Waiting Review Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Blockers */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                <span>⚠️</span> Kendala Aktif (Blockers)
              </h3>
              <div className="space-y-2.5">
                {summary.blockers.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3"
                  >
                    <div>
                      <div className="text-xs font-medium text-zinc-200">{b.title}</div>
                      <div className="text-[11px] text-zinc-400 mt-1">
                        Disiplin: <strong className="text-zinc-300">{b.department}</strong>
                      </div>
                    </div>
                    <span
                      className={`rounded px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider whitespace-nowrap ${
                        b.severity === 'critical'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : b.severity === 'high'
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {b.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Waiting Review */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-2">
                <span>⏳</span> Antrian Review (Waiting Review)
              </h3>
              <div className="space-y-2.5">
                {summary.waitingReview.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800/80 bg-zinc-950/70 p-3"
                  >
                    <div className="truncate">
                      <div className="text-xs font-medium text-zinc-200 truncate">{r.item}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Diajukan oleh: <span className="text-zinc-300">{r.submittedBy}</span>
                      </div>
                    </div>
                    <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[9px] font-bold text-purple-300 border border-purple-500/30 whitespace-nowrap uppercase">
                      {r.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/90 px-6 py-3 text-xs text-zinc-400">
          <span>Ringkasan Milestone Proyek diperbarui secara periodik dari board koordinasi tim.</span>
          <div className="flex items-center gap-2">
            <kbd className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-300 border border-zinc-700">Esc</kbd>
            <span>Tutup</span>
          </div>
        </div>
      </div>
    </div>
  );
};
