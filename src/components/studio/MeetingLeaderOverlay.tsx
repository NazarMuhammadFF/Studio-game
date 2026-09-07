import React, { useState, useEffect } from 'react';
import { InteractiveObjectDef, MeetingParticipant, MeetingAgendaItem } from '../../studio/types';

interface MeetingLeaderOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
}

export const MeetingLeaderOverlay: React.FC<MeetingLeaderOverlayProps> = ({
  object,
  onClose,
}) => {
  const defaultParticipants: MeetingParticipant[] = [
    {
      name: 'Alex Rivera',
      role: 'Lead Game Designer (Host)',
      discipline: 'Game Designer',
      status: 'speaking',
    },
    {
      name: 'Devon Vance',
      role: 'Lead Programmer',
      discipline: 'Programmer',
      status: 'present',
    },
    {
      name: 'Maya Lin',
      role: 'Lead Concept & Environment Artist',
      discipline: 'Artist',
      status: 'present',
    },
    {
      name: 'Julian Vance',
      role: 'Lead Audio & Sound Engineer',
      discipline: 'Audio',
      status: 'present',
    },
    {
      name: 'Elena Rostova',
      role: 'Senior Composer',
      discipline: 'Audio',
      status: 'remote',
    },
    {
      name: 'Sarah Chen',
      role: 'Systems Programmer',
      discipline: 'Programmer',
      status: 'present',
    },
  ];

  const defaultAgenda: MeetingAgendaItem[] = [
    {
      id: 'ag_1',
      time: '10:00',
      topic: 'Review Capaian Sprint 14 & Alpha Milestone Checklist',
      presenter: 'Alex Rivera',
      status: 'done',
    },
    {
      id: 'ag_2',
      time: '10:15',
      topic: 'Penyelarasan Collision & Movement Bounds di Seluruh Ruangan',
      presenter: 'Devon Vance',
      status: 'done',
    },
    {
      id: 'ag_3',
      time: '10:35',
      topic: 'Integrasi Dynamic Combat Audio Stems dengan Partikel Visual FX',
      presenter: 'Julian Vance & Maya Lin',
      status: 'active',
    },
    {
      id: 'ag_4',
      time: '10:55',
      topic: 'Alokasi Kursi Meeting Multi-Avatars & Arsitektur Realtime Sinkronisasi',
      presenter: 'Tim Studio Core',
      status: 'upcoming',
    },
  ];

  const [agenda, setAgenda] = useState<MeetingAgendaItem[]>(
    object.meetingSessionData?.agenda || defaultAgenda
  );
  const participants = object.meetingSessionData?.participants || defaultParticipants;
  const activeTopic = agenda.find((a) => a.status === 'active') || agenda[0];

  const handleNextTopic = () => {
    const currentIndex = agenda.findIndex((a) => a.status === 'active');
    if (currentIndex >= 0 && currentIndex < agenda.length - 1) {
      const updated = agenda.map((item, idx) => {
        if (idx === currentIndex) return { ...item, status: 'done' as const };
        if (idx === currentIndex + 1) return { ...item, status: 'active' as const };
        return item;
      });
      setAgenda(updated);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex h-[85vh] max-h-[720px] w-full max-w-4xl flex-col rounded-xl border border-amber-500/40 bg-zinc-950 text-zinc-100 shadow-2xl shadow-amber-950/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 text-lg">
              🎙️
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
                  MEETING LEADER PODIUM
                </span>
                <span className="text-xs text-zinc-400">
                  Leader: <strong className="text-zinc-200">Alex Rivera (Lead Designer)</strong>
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide mt-0.5">
                Pusat Kendali & Moderasi Rapat Studio
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

        {/* Current Active Topic Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-800 bg-amber-500/5 px-6 py-3.5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
              Topik yang Sedang Dibahas
            </div>
            <div className="text-sm font-bold text-white mt-1">
              {activeTopic ? `${activeTopic.time} — ${activeTopic.topic}` : 'Tidak ada sesi aktif'}
            </div>
            <div className="text-xs text-zinc-400 mt-0.5">
              Pembicara: <span className="text-zinc-200 font-medium">{activeTopic?.presenter}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNextTopic}
              className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-500 hover:shadow-lg hover:shadow-amber-600/30"
            >
              Lanjut ke Topik Berikutnya ⏭
            </button>
          </div>
        </div>

        {/* Two-Column Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 flex-1 overflow-y-auto">
          {/* Column 1: Participants List */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>👥</span> Kehadiran Partisipan ({participants.length})
              </h3>
              <span className="text-[11px] text-emerald-400 font-mono">
                {participants.filter((p) => p.status === 'present' || p.status === 'speaking').length} Hadir di Ruangan
              </span>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {participants.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-950/70"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        p.discipline === 'Programmer'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : p.discipline === 'Artist'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : p.discipline === 'Game Designer'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                      }`}
                    >
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-100">{p.name}</div>
                      <div className="text-[11px] text-zinc-400">{p.role}</div>
                    </div>
                  </div>

                  <div>
                    {p.status === 'speaking' ? (
                      <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/40 animate-pulse">
                        🎙 Sedang Bicara
                      </span>
                    ) : p.status === 'present' ? (
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                        ● Di Meja Rapat
                      </span>
                    ) : (
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400 border border-zinc-700">
                        Remote / Standby
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Agenda Status & Controls */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
              <span>📋</span> Status Alur Agenda
            </h3>

            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {agenda.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border transition ${
                    item.status === 'active'
                      ? 'border-amber-500/60 bg-amber-500/10'
                      : item.status === 'done'
                      ? 'border-zinc-800 bg-zinc-950/40 opacity-70'
                      : 'border-zinc-800/80 bg-zinc-950/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-zinc-400">
                      Step {idx + 1} • {item.time}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        item.status === 'active'
                          ? 'bg-amber-500/20 text-amber-300'
                          : item.status === 'done'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-zinc-200 mt-1">{item.topic}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">Presenter: {item.presenter}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/90 px-6 py-3 text-xs text-zinc-400">
          <span>Podium ini memungkinkan moderator memandu jalannya presentasi dan rapat tim.</span>
          <div className="flex items-center gap-2">
            <kbd className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-300 border border-zinc-700">Esc</kbd>
            <span>Tutup</span>
          </div>
        </div>
      </div>
    </div>
  );
};
