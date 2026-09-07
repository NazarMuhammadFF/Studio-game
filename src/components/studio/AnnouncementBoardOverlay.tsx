import React, { useEffect } from 'react';
import { InteractiveObjectDef, AnnouncementItem } from '../../studio/types';

interface AnnouncementBoardOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
}

export const AnnouncementBoardOverlay: React.FC<AnnouncementBoardOverlayProps> = ({
  object,
  onClose,
}) => {
  const defaultAnnouncements: AnnouncementItem[] = [
    {
      id: 'ann_1',
      title: 'Milestone 2 Alpha Playtest Internal: Jumat, Pukul 15:00 WIB',
      category: 'Milestone',
      author: 'Alex Rivera (Lead Designer)',
      date: 'Hari ini, 09:30',
      priority: 'urgent',
      content:
        'Sesi playtest internal bersama seluruh tim untuk memvalidasi loop combat awal, pergerakan avatar, dan sinkronisasi audio dynamic stems. Harap seluruh PR penting digabungkan sebelum pukul 13:00.',
      actionText: 'Lihat Checklist Playtest',
      actionUrl: 'https://notion.so/project-studio/alpha-playtest-checklist',
    },
    {
      id: 'ann_2',
      title: 'Pemberitahuan: Batas Budget VRAM Asset Lingkungan & Sprite (Maks 1.5 GB)',
      category: 'Notice',
      author: 'Devon Vance (Lead Programmer)',
      date: 'Kemarin, 17:15',
      priority: 'high',
      content:
        'Seluruh texture sheet baru diwajibkan menggunakan resolusi power-of-two (POT) dan format kompresi WebP untuk menjaga performa stabil di 60 FPS pada browser web.',
    },
    {
      id: 'ann_3',
      title: 'Review Audio-Visual Bersama: Boss Encounter Soundscape & FX',
      category: 'Review',
      author: 'Julian Vance & Maya Lin',
      date: 'Kemarin, 14:00',
      priority: 'normal',
      content:
        'Diskusi sinkronisasi tempo perkusi 140 BPM dengan kedipan lampu neon dan partikel telegraphed hit musuh akan diadakan di Ruang Rapat (Meeting Room) hari ini.',
    },
    {
      id: 'ann_4',
      title: 'Coffee & Board Game Friday: Casual Gathering di Plaza Lounge',
      category: 'Social',
      author: 'Studio Management',
      date: '2 hari lalu',
      priority: 'normal',
      content:
        'Rehat santai dan obrolan informal seputar ide mekanik baru di area Plaza Central Lounge setelah sesi all-hands mingguan selesai.',
    },
  ];

  const announcementData = object.announcementData;
  const announcements = announcementData?.announcements || defaultAnnouncements;
  const currentMilestone =
    announcementData?.currentMilestone || 'Milestone 2 — Core Combat & Alpha Playtest';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex h-[88vh] max-h-[760px] w-full max-w-4xl flex-col rounded-xl border border-amber-500/40 bg-zinc-950 text-zinc-100 shadow-2xl shadow-amber-950/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 text-lg">
              📢
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
                  STUDIO ANNOUNCEMENT BOARD
                </span>
                <span className="text-xs text-zinc-400">
                  Milestone Aktif: <strong className="text-zinc-200">{currentMilestone}</strong>
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide mt-0.5">
                Papan Pengumuman & Pemberitahuan Studio
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

        {/* Milestone Banner */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-amber-500/10 px-6 py-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
            <span className="font-semibold text-amber-300">Fokus Studio Saat Ini:</span>
            <span className="text-zinc-200">{currentMilestone}</span>
          </div>
          <span className="text-[11px] text-amber-400/80 font-mono">
            Target Rilis: 24 Oktober 2026
          </span>
        </div>

        {/* Announcement Cards List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`rounded-xl border p-5 transition ${
                ann.priority === 'urgent'
                  ? 'border-red-500/40 bg-red-950/10 shadow-sm'
                  : ann.priority === 'high'
                  ? 'border-amber-500/40 bg-amber-950/10'
                  : 'border-zinc-800 bg-zinc-900/60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      ann.priority === 'urgent'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : ann.priority === 'high'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    {ann.priority}
                  </span>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                    {ann.category}
                  </span>
                  <span className="text-xs text-zinc-400">• {ann.date}</span>
                </div>

                <span className="text-xs text-zinc-400">
                  Oleh: <strong className="text-zinc-300">{ann.author}</strong>
                </span>
              </div>

              <h3 className="text-base font-bold text-white mt-1">{ann.title}</h3>
              <p className="mt-2 text-xs text-zinc-300 leading-relaxed">{ann.content}</p>

              {ann.actionText && ann.actionUrl && (
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-end">
                  <a
                    href={ann.actionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-amber-600/90 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-500"
                  >
                    <span>{ann.actionText}</span>
                    <span>↗</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/90 px-6 py-3 text-xs text-zinc-400">
          <span>Pengumuman penting dan jadwal studio dipublikasikan oleh lead setiap disiplin.</span>
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
