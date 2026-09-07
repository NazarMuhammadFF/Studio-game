import React, { useEffect } from 'react';
import { InteractiveObjectDef, StudioDirectoryRoom } from '../../studio/types';

interface StudioDirectoryOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
}

export const StudioDirectoryOverlay: React.FC<StudioDirectoryOverlayProps> = ({
  object,
  onClose,
}) => {
  const defaultRooms: StudioDirectoryRoom[] = [
    {
      id: 'room_programming',
      name: 'Engineering & Code Lab',
      discipline: 'Programming',
      purpose:
        'Arsitektur engine utama, logika sistem gameplay, sinkronisasi realtime, dan server build internal.',
      directionGuide: 'Sayap Barat Laut (North-West Wing) • Masuk melalui Lorong Pintu Barat',
      onlineCount: 3,
      activeLeads: ['Devon Vance (Lead)'],
      status: 'active',
    },
    {
      id: 'room_meeting',
      name: 'Conference & Strategy Hub',
      discipline: 'Management & All-Hands',
      purpose:
        'Ruang koordinasi kolaboratif lintas divisi, layar presentasi bersama, notulensi rapat, dan milestone review.',
      directionGuide: 'Sayap Utara (North Concourse) • Pintu Utama Langsung di Atas Plaza',
      onlineCount: 4,
      activeLeads: ['Alex Rivera (Host)'],
      status: 'active',
    },
    {
      id: 'room_art',
      name: 'Art & Animation Studio',
      discipline: 'Art & Animation',
      purpose:
        'Konsep seni visual, pembuatan sprite 2D, linimasa animasi karakter, moodboard, dan review aset.',
      directionGuide: 'Sayap Timur Laut (North-East Wing) • Masuk melalui Lorong Pintu Timur Atas',
      onlineCount: 2,
      activeLeads: ['Maya Lin (Lead)'],
      status: 'active',
    },
    {
      id: 'room_design',
      name: 'Game Design & Narrative Bay',
      discipline: 'Game Design',
      purpose:
        'Perancangan mekanik inti, balancing kurva ekonomi & tempur, alur level, dan playtest arcade.',
      directionGuide: 'Sayap Barat Daya (South-West Wing) • Masuk melalui Lorong Pintu Barat Bawah',
      onlineCount: 2,
      activeLeads: ['Alex Rivera (Lead)'],
      status: 'active',
    },
    {
      id: 'room_audio',
      name: 'Audio & Sound Studio',
      discipline: 'Audio & Music',
      purpose:
        'Komposisi musik dinamis (4-stems), perekaman efek suara Foley, mixing multi-track, dan soundboard review.',
      directionGuide: 'Sayap Tenggara (South-East Wing) • Masuk melalui Lorong Pintu Timur Bawah',
      onlineCount: 2,
      activeLeads: ['Julian Vance (Lead)'],
      status: 'active',
    },
    {
      id: 'room_qa',
      name: 'QA & Compatibility Lab (Mendatang)',
      discipline: 'Quality Assurance',
      purpose:
        'Testing kompatibilitas browser, verifikasi regresi bug, stress test performa build, dan crash reporting.',
      directionGuide: 'Rencana Koridor Selatan (South Extension) • Akses Dalam Tahap Perencanaan',
      onlineCount: 0,
      activeLeads: ['Terjadwal Sprint 16'],
      status: 'future',
    },
  ];

  const directory = object.directoryData;
  const rooms = directory?.rooms || defaultRooms;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex h-[88vh] max-h-[760px] w-full max-w-4xl flex-col rounded-xl border border-sky-500/40 bg-zinc-950 text-zinc-100 shadow-2xl shadow-sky-950/40 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40 text-lg">
              🗺️
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-sky-500/20 px-2 py-0.5 text-xs font-semibold text-sky-300 border border-sky-500/30">
                  STUDIO DIRECTORY & MAP
                </span>
                <span className="text-xs text-zinc-400">
                  Lokasi Anda Saat Ini: <strong className="text-sky-300">Central Plaza & Lobby</strong>
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide mt-0.5">
                Direktori Ruangan & Panduan Navigasi Studio
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

        {/* Spatial Orientation Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-b border-zinc-800 bg-zinc-900/40 px-6 py-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="rounded bg-blue-500/20 px-1.5 py-0.5 font-mono text-[10px] text-blue-300 border border-blue-500/40 font-bold">
              WEST
            </span>
            <span>Programming & Game Design</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300 justify-center">
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[10px] text-amber-300 border border-amber-500/40 font-bold">
              NORTH
            </span>
            <span>Meeting Room & Strategy</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300 justify-end">
            <span className="rounded bg-purple-500/20 px-1.5 py-0.5 font-mono text-[10px] text-purple-300 border border-purple-500/40 font-bold">
              EAST
            </span>
            <span>Art Studio & Sound Lab</span>
          </div>
        </div>

        {/* Room Directory Cards */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`flex flex-col justify-between rounded-xl border p-4 transition ${
                  room.status === 'future'
                    ? 'border-zinc-800/80 bg-zinc-950/40 opacity-70'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        room.discipline === 'Programming'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : room.discipline === 'Art & Animation'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : room.discipline === 'Game Design'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : room.discipline === 'Audio & Music'
                          ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                          : room.discipline.includes('Management')
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {room.discipline}
                    </span>

                    {room.status === 'future' ? (
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 border border-zinc-700">
                        Dalam Rencana
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {room.onlineCount} Anggota di Ruangan
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white">{room.name}</h3>
                  <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{room.purpose}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] text-sky-400">
                    <span>🧭</span>
                    <span className="font-medium text-zinc-300">{room.directionGuide}</span>
                  </div>
                  {room.activeLeads && room.activeLeads.length > 0 && (
                    <div className="text-[11px] text-zinc-500 mt-1">
                      Lead / On-Duty: <span className="text-zinc-400">{room.activeLeads.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/90 px-6 py-3 text-xs text-zinc-400">
          <span>
            Gunakan penunjuk arah lantai dan plang fisik di Plaza untuk berjalan menuju ruangan tujuan.
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
