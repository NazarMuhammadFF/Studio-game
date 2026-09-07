import React, { useState, useEffect } from 'react';
import { InteractiveObjectDef, TeamPresenceMember } from '../../studio/types';

interface TeamPresenceBoardOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
}

export const TeamPresenceBoardOverlay: React.FC<TeamPresenceBoardOverlayProps> = ({
  object,
  onClose,
}) => {
  const [filterDept, setFilterDept] = useState<string>('All');
  const [filterOnlineOnly, setFilterOnlineOnly] = useState<boolean>(false);

  const defaultMembers: TeamPresenceMember[] = [
    {
      id: 'm_1',
      name: 'Alex Rivera',
      role: 'Lead Game Designer',
      discipline: 'Game Designer',
      isOnline: true,
      currentRoom: 'Conference & Strategy Hub',
      status: 'In Discussion',
      currentTask: 'Memimpin review sprint & integrasi combat pacing',
    },
    {
      id: 'm_2',
      name: 'Devon Vance',
      role: 'Lead Programmer',
      discipline: 'Programmer',
      isOnline: true,
      currentRoom: 'Engineering & Code Lab',
      status: 'In Flow',
      currentTask: 'Optimasi collision resolution & spatial bounds',
    },
    {
      id: 'm_3',
      name: 'Maya Lin',
      role: 'Lead Concept & Environment Artist',
      discipline: 'Artist',
      isOnline: true,
      currentRoom: 'Art & Animation Studio',
      status: 'Reviewing PR',
      currentTask: 'Finalisasi texture sheet monitor & visual style guide',
    },
    {
      id: 'm_4',
      name: 'Julian Vance',
      role: 'Lead Audio & Sound Engineer',
      discipline: 'Audio',
      isOnline: true,
      currentRoom: 'Audio & Sound Studio',
      status: 'Audio Mixing',
      currentTask: 'Penyelarasan 4-stem combat dynamic music transition',
    },
    {
      id: 'm_5',
      name: 'Elena Rostova',
      role: 'Senior Composer',
      discipline: 'Audio',
      isOnline: true,
      currentRoom: 'Conference & Strategy Hub (Remote)',
      status: 'Scoring',
      currentTask: 'Eksplorasi boss theme motif & orchestral strings',
    },
    {
      id: 'm_6',
      name: 'Sarah Chen',
      role: 'Systems Programmer',
      discipline: 'Programmer',
      isOnline: true,
      currentRoom: 'Engineering & Code Lab',
      status: 'Debugging',
      currentTask: 'Pemeriksaan memory leak pada sprite texture cache',
    },
    {
      id: 'm_7',
      name: 'Kai Tanaka',
      role: 'Technical 3D/2D Artist',
      discipline: 'Artist',
      isOnline: false,
      currentRoom: 'Offline (Last seen: Art Studio)',
      status: 'Idle',
      currentTask: 'Menunggu feedback konsep prop environment',
    },
    {
      id: 'm_8',
      name: 'Marcus Brody',
      role: 'Economy & Balance Designer',
      discipline: 'Game Designer',
      isOnline: false,
      currentRoom: 'Offline (Last seen: Design Bay)',
      status: 'Idle',
      currentTask: 'Penyusunan baseline spreadsheet drop rate',
    },
  ];

  const presenceData = object.teamPresenceData;
  const members = presenceData?.members || defaultMembers;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredMembers = members.filter((m) => {
    if (filterOnlineOnly && !m.isOnline) return false;
    if (filterDept !== 'All' && m.discipline !== filterDept) return false;
    return true;
  });

  const onlineTotal = members.filter((m) => m.isOnline).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex h-[88vh] max-h-[760px] w-full max-w-4xl flex-col rounded-xl border border-emerald-500/40 bg-zinc-950 text-zinc-100 shadow-2xl shadow-emerald-950/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-lg">
              👥
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                  TEAM PRESENCE BOARD
                </span>
                <span className="text-xs text-zinc-400">
                  Kehadiran Tim: <strong className="text-emerald-400">{onlineTotal} Online</strong> / {members.length} Anggota
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide mt-0.5">
                Status Kehadiran & Aktivitas Seluruh Anggota Studio
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

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900/40 px-6 py-3 text-xs">
          {/* Discipline Filters */}
          <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-lg border border-zinc-800">
            {['All', 'Programmer', 'Artist', 'Game Designer', 'Audio'].map((dept) => (
              <button
                key={dept}
                onClick={() => setFilterDept(dept)}
                className={`rounded px-2.5 py-1 font-medium transition ${
                  filterDept === dept
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {dept === 'All' ? 'Semua' : dept}
              </button>
            ))}
          </div>

          {/* Toggle Online Only */}
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterOnlineOnly}
              onChange={(e) => setFilterOnlineOnly(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/30"
            />
            <span>Hanya yang Online ({onlineTotal})</span>
          </label>
        </div>

        {/* Members List Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-3 rounded-xl border p-4 transition ${
                member.isOnline
                  ? 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700'
                  : 'border-zinc-800/60 bg-zinc-950/40 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3.5">
                {/* Avatar Initial Circle with Status Badge */}
                <div className="relative">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border ${
                      member.discipline === 'Programmer'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : member.discipline === 'Artist'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : member.discipline === 'Game Designer'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                    }`}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-950 ${
                      member.isOnline ? 'bg-emerald-500' : 'bg-zinc-600'
                    }`}
                  ></span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{member.name}</span>
                    <span className="text-xs text-zinc-400">• {member.role}</span>
                  </div>
                  <div className="text-xs text-zinc-300 mt-0.5">
                    Fokus:{' '}
                    <span className="text-zinc-200 italic font-medium">{member.currentTask}</span>
                  </div>
                </div>
              </div>

              {/* Location & Status Badges */}
              <div className="flex items-center gap-3 self-end md:self-center">
                <div className="text-right">
                  <div className="text-xs font-semibold text-zinc-200">{member.currentRoom}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Status:{' '}
                    <span
                      className={`font-medium ${
                        member.status === 'In Flow'
                          ? 'text-emerald-400'
                          : member.status === 'In Discussion'
                          ? 'text-amber-400'
                          : member.status === 'Reviewing PR'
                          ? 'text-sky-400'
                          : 'text-zinc-400'
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>
                </div>

                <span
                  className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    member.isOnline
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {member.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/90 px-6 py-3 text-xs text-zinc-400">
          <span>
            Data kehadiran diperbarui secara otomatis berdasarkan deteksi keberadaan avatar di ruangan.
          </span>
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
