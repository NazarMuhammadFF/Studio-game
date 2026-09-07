import React, { useState, useEffect } from 'react';
import { InteractiveObjectDef, MeetingAgendaItem, MeetingDecision, MeetingActionItem } from '../../studio/types';

interface MeetingBoardOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
}

export const MeetingBoardOverlay: React.FC<MeetingBoardOverlayProps> = ({
  object,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'agenda' | 'decisions' | 'action_items'>('all');

  const defaultAgenda: MeetingAgendaItem[] = [
    {
      id: 'ag_1',
      time: '10:00 - 10:15',
      topic: 'Review Capaian Sprint 14 & Alpha Milestone Checklist',
      presenter: 'Alex Rivera (Lead Designer)',
      status: 'done',
    },
    {
      id: 'ag_2',
      time: '10:15 - 10:35',
      topic: 'Penyelarasan Collision & Movement Bounds di Seluruh Ruangan',
      presenter: 'Devon Vance (Lead Programmer)',
      status: 'done',
    },
    {
      id: 'ag_3',
      time: '10:35 - 10:55',
      topic: 'Integrasi Dynamic Combat Audio Stems dengan Partikel Visual FX',
      presenter: 'Julian Vance & Maya Lin',
      status: 'active',
    },
    {
      id: 'ag_4',
      time: '10:55 - 11:15',
      topic: 'Alokasi Kursi Meeting Multi-Avatars & Arsitektur Realtime Sinkronisasi',
      presenter: 'Tim Studio Core',
      status: 'upcoming',
    },
    {
      id: 'ag_5',
      time: '11:15 - 11:30',
      topic: 'Q&A, Action Items Assignment, dan Penjadwalan Playtest Bersama',
      presenter: 'Seluruh Tim',
      status: 'upcoming',
    },
  ];

  const defaultDecisions: MeetingDecision[] = [
    {
      id: 'dec_1',
      title: 'Pemberlakuan Batas Ruang Simetris 3x2 (384x392 per Ruangan)',
      outcome:
        'Seluruh 6 ruangan (Programming, Art, Design, Audio, Meeting, Plaza) mengadopsi dimensi dan lorong 64px seragam untuk mencegah bug tabrakan kamera.',
      decidedBy: 'Lead Designer & Lead Programmer',
    },
    {
      id: 'dec_2',
      title: 'Desain Kursi Meja Rapat Non-Konflik (Single Occupancy per Seat)',
      outcome:
        'Setiap kursi meja rapat memiliki ID kursi unik. Pemain yang mendekati kursi dapat duduk dan status kursi berubah visual sehingga avatar lain tidak menimpa.',
      decidedBy: 'Alex Rivera',
    },
    {
      id: 'dec_3',
      title: 'Format Audio Stems 4-Layer Dinamis',
      outcome:
        'Combat music dipecah menjadi 4 layer (Kick, Bass, Melody, Percussion) yang volume-nya beradaptasi secara dinamis dengan status pertempuran pemain.',
      decidedBy: 'Julian Vance',
    },
  ];

  const defaultActionItems: MeetingActionItem[] = [
    {
      id: 'act_1',
      task: 'Finalisasi collider lorong pintu tengah antara Plaza dan Meeting Room',
      assignee: 'Devon Vance',
      deadline: 'Hari ini, 17:00',
      status: 'completed',
    },
    {
      id: 'act_2',
      task: 'Sinkronisasi visual kursi terisi (occupied) saat avatar duduk di meja rapat',
      assignee: 'Devon Vance & Alex Rivera',
      deadline: 'Besok, 12:00',
      status: 'in_progress',
    },
    {
      id: 'act_3',
      task: 'Eksport moodboard & palet warna UI Meeting ke format SVG Figma',
      assignee: 'Maya Lin',
      deadline: 'Kamis, 15:00',
      status: 'pending',
    },
    {
      id: 'act_4',
      task: 'Benchmarking audio memory footprint pada browser mobile/tablet',
      assignee: 'Julian Vance',
      deadline: 'Jumat, 18:00',
      status: 'pending',
    },
  ];

  const meetingData = object.meetingSessionData;
  const agenda = meetingData?.agenda || defaultAgenda;
  const decisions = meetingData?.decisions || defaultDecisions;
  const actionItems = meetingData?.actionItems || defaultActionItems;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex h-[88vh] max-h-[750px] w-full max-w-4xl flex-col rounded-xl border border-amber-500/40 bg-zinc-950 text-zinc-100 shadow-2xl shadow-amber-950/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 text-lg">
              📋
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
                  MEETING BOARD
                </span>
                <span className="text-xs text-zinc-400">
                  Topik Aktif: <strong className="text-amber-300">{meetingData?.currentTopic || 'Alpha Milestone Review & Audio Sync'}</strong>
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide mt-0.5">
                {meetingData?.meetingTitle || 'Papan Agenda & Notulensi Rapat Studio'}
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/40 px-6 py-2.5">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Semua Ringkasan ({agenda.length + decisions.length + actionItems.length})
          </button>
          <button
            onClick={() => setActiveTab('agenda')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === 'agenda'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Agenda Rapat ({agenda.length})
          </button>
          <button
            onClick={() => setActiveTab('decisions')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === 'decisions'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Keputusan ({decisions.length})
          </button>
          <button
            onClick={() => setActiveTab('action_items')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === 'action_items'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tindak Lanjut / Action Items ({actionItems.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: AGENDA */}
          {(activeTab === 'all' || activeTab === 'agenda') && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <span>⏱</span> Jadwal & Agenda Pembahasan
                </h3>
                <span className="text-[11px] text-zinc-400 font-mono">Status: Sesi Berlangsung</span>
              </div>
              <div className="space-y-2.5">
                {agenda.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition ${
                      item.status === 'active'
                        ? 'border-amber-500/60 bg-amber-500/10 shadow-sm'
                        : item.status === 'done'
                        ? 'border-zinc-800 bg-zinc-950/40 opacity-70'
                        : 'border-zinc-800/80 bg-zinc-950/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-zinc-400 min-w-[90px]">{item.time}</span>
                      <div>
                        <div className="text-sm font-semibold text-white">{item.topic}</div>
                        <div className="text-xs text-zinc-400 mt-0.5">Presenter: {item.presenter}</div>
                      </div>
                    </div>
                    <div>
                      {item.status === 'active' ? (
                        <span className="rounded bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-amber-500/40 animate-pulse">
                          ● SEDANG DIBAHAS
                        </span>
                      ) : item.status === 'done' ? (
                        <span className="rounded bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                          ✓ Selesai
                        </span>
                      ) : (
                        <span className="rounded bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-400 border border-zinc-700">
                          Mendatang
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: KEPUTUSAN (DECISIONS) */}
          {(activeTab === 'all' || activeTab === 'decisions') && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
                <span>✓</span> Hasil & Keputusan Rapat (Decisions Log)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {decisions.map((dec) => (
                  <div
                    key={dec.id}
                    className="flex flex-col justify-between rounded-lg border border-emerald-500/30 bg-zinc-950/70 p-4"
                  >
                    <div>
                      <div className="text-sm font-bold text-zinc-100 mb-1.5">{dec.title}</div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{dec.outcome}</p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-zinc-800/80 text-[11px] text-zinc-500">
                      Disepakati oleh: <span className="text-zinc-300 font-medium">{dec.decidedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: ACTION ITEMS */}
          {(activeTab === 'all' || activeTab === 'action_items') && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-4 flex items-center gap-2">
                <span>⚡</span> Tindak Lanjut & Action Items
              </h3>
              <div className="space-y-2.5">
                {actionItems.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/80 bg-zinc-950/70"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm">
                        {act.status === 'completed' ? '🟢' : act.status === 'in_progress' ? '🟡' : '⚪'}
                      </span>
                      <div>
                        <div className={`text-sm font-medium ${act.status === 'completed' ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                          {act.task}
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          PIC: <span className="text-amber-300 font-medium">{act.assignee}</span> • Batas: <span className="text-zinc-300">{act.deadline}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`rounded px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                        act.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : act.status === 'in_progress'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {act.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/90 px-6 py-3 text-xs text-zinc-400">
          <span>Papan ini sinkron secara visual dengan aktivitas kolaborasi tim di dalam ruangan.</span>
          <div className="flex items-center gap-2">
            <kbd className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-300 border border-zinc-700">Esc</kbd>
            <span>Tutup</span>
          </div>
        </div>
      </div>
    </div>
  );
};
