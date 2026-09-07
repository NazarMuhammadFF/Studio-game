import React, { useState, useEffect } from 'react';
import { InteractiveObjectDef, PresentationSlideData } from '../../studio/types';

interface PresentationScreenOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
}

export const PresentationScreenOverlay: React.FC<PresentationScreenOverlayProps> = ({
  object,
  onClose,
}) => {
  const defaultSlides: PresentationSlideData[] = [
    {
      id: 'slide_1',
      slideNumber: 1,
      title: 'Milestone 2: Core Gameplay Loop & Sector 0 Alpha Readiness',
      subtitle: 'Sprint 14 All-Hands Cross-Discipline Sync',
      type: 'slide',
      contentPreview:
        'Ikhtisar penyelesaian sprint 14 menuju Alpha Milestone. Pembahasan sinkronisasi antardivisi Programming, Art, Design, dan Audio untuk playtest internal pertama.',
      bulletPoints: [
        'Programming: Movement physics, interaction trigger system, dan room bounds terselesaikan.',
        'Art: 100% environment room tileset, workstation assets, dan avatar walk cycle terintegrasi.',
        'Design: Core combat loop spec, pacing curve, dan prototype balance sheet selesai.',
        'Audio: Dynamic combat stems, directional sound fx, dan ambient background loop aktif.',
      ],
      metrics: [
        { label: 'Sprint Velocity', value: '94%' },
        { label: 'Alpha Target', value: 'Oct 24' },
        { label: 'Open Blockers', value: '2 Medium' },
      ],
    },
    {
      id: 'slide_2',
      slideNumber: 2,
      title: 'Figma Canvas: Combat HUD & Tactical Inventory UX',
      subtitle: 'Wireframes & Interactive Prototype Spec v2.4',
      type: 'figma',
      contentPreview:
        'Desain antarmuka HUD minimalis dengan indikator status staminabar, quick-slot item radial dial, dan clean minimap overlay tanpa mengurangi pandangan visual aksi pemain.',
      bulletPoints: [
        'Penyederhanaan floating health bars untuk musuh bertipe swarm.',
        'Contrast ratio compliance (WCAG AAA) pada font status HUD.',
        'Layout respon terhadap resolusi 16:9 dan ultrawide 21:9.',
      ],
      metrics: [
        { label: 'Figma Components', value: '48 Variants' },
        { label: 'Prototype Screens', value: '12 Flows' },
        { label: 'Design Sign-off', value: 'Approved' },
      ],
      externalUrl: 'https://figma.com/@project-game/tactical-hud-v2',
    },
    {
      id: 'slide_3',
      slideNumber: 3,
      title: 'Sprint 14 Cross-Discipline Progress & QA Velocity',
      subtitle: 'Grafik Penyelesaian Task & Stabilitas Build',
      type: 'report',
      contentPreview:
        'Laporan performa build Alpha 0.4.2 menunjukkan penurunan crash-rate hingga 0.02% per 100 sesi playtest. Tidak ada blocker kritis pada loop game inti.',
      bulletPoints: [
        'Programming PR throughput meningkat 22% dibanding Sprint 13.',
        'Penyelarasan audio latency ke batas aman di bawah 18ms.',
        'Texture budget art asset optimal pada rentang VRAM 1.2 GB.',
      ],
      metrics: [
        { label: 'Build Pass Rate', value: '99.4%' },
        { label: 'Avg FPS (Target 60)', value: '59.8 fps' },
        { label: 'Resolved Tickets', value: '41 / 44' },
      ],
      externalUrl: 'https://github.com/project-studio/game/pulls',
    },
    {
      id: 'slide_4',
      slideNumber: 4,
      title: 'Design Spec: Boss Encounter Pacing & Audio Cues',
      subtitle: 'Dokumentasi Mekanik & Kordinasi Audio-Visual',
      type: 'document',
      contentPreview:
        'Spesifikasi transisi fase boss dari Phase 1 (Melee Telegraphed) menuju Phase 2 (Bullet Wave & Sound Distortion) dengan penanda suara 650ms sebelum serangan.',
      bulletPoints: [
        'Phase 1: Kecepatan serangan terprediksi dengan partikel peringatan kuning.',
        'Phase 2: Musik beralih ke layer perkusi cepat (150 BPM) dan lampu arena meredup.',
        'Phase 3: Enrage timer memicu audio alarm frekuensi tinggi.',
      ],
      metrics: [
        { label: 'Telegraph Time', value: '650 ms' },
        { label: 'Phase Count', value: '3 Phases' },
        { label: 'Audio Tracks', value: '3 Stems' },
      ],
      externalUrl: 'https://notion.so/project-studio/boss-encounter-spec',
    },
  ];

  const slides = object.presentationScreenData?.slides || defaultSlides;
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const currentSlide = slides[currentSlideIndex] || slides[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'KeyD') {
        setCurrentSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft' || e.key === 'KeyA') {
        setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex h-[90vh] max-h-[780px] w-full max-w-5xl flex-col rounded-xl border border-amber-500/40 bg-zinc-950 text-zinc-100 shadow-2xl shadow-amber-950/40 overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 items-center justify-center">
              <span className="absolute h-3 w-3 animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative h-2 w-2 rounded-full bg-amber-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
                  SHARED PRESENTATION DISPLAY
                </span>
                <span className="text-xs text-zinc-400">
                  Presenter: <strong className="text-zinc-200">{object.presentationScreenData?.presenterName || 'Alex Rivera (Lead Designer)'}</strong>
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide mt-0.5">
                {object.presentationScreenData?.deckTitle || 'Studio All-Hands: Sprint 14 & Alpha Readiness'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Slide Navigation controls */}
            <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1 text-xs">
              <button
                onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentSlideIndex === 0}
                className="rounded px-2.5 py-1 font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent"
                title="Slide Sebelumnya (Arrow Left / A)"
              >
                ◀ Prev
              </button>
              <span className="px-2 font-mono text-amber-400">
                {currentSlideIndex + 1} / {slides.length}
              </span>
              <button
                onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                disabled={currentSlideIndex === slides.length - 1}
                className="rounded px-2.5 py-1 font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent"
                title="Slide Berikutnya (Arrow Right / D)"
              >
                Next ▶
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg bg-zinc-800 p-2 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
              title="Tutup (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Slide Thumbnail Ribbon */}
        <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/40 px-6 py-2.5 overflow-x-auto">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition whitespace-nowrap ${
                idx === currentSlideIndex
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-medium'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <span className="font-mono text-[10px] opacity-70">#{idx + 1}</span>
              <span className="truncate max-w-[150px]">{slide.title}</span>
              <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[9px] uppercase tracking-wider text-zinc-400">
                {slide.type}
              </span>
            </button>
          ))}
        </div>

        {/* Main Display Canvas Body */}
        <div className="flex flex-1 flex-col overflow-y-auto p-6 bg-gradient-to-b from-zinc-950 via-zinc-900/50 to-zinc-950">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
            {/* Slide Header */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-inner">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300 border border-amber-500/30">
                      {currentSlide.type.toUpperCase()}
                    </span>
                    {currentSlide.subtitle && (
                      <span className="text-xs text-zinc-400">{currentSlide.subtitle}</span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    {currentSlide.title}
                  </h1>
                </div>
                {currentSlide.externalUrl && (
                  <a
                    href={currentSlide.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-amber-600/90 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-amber-500 hover:shadow-lg hover:shadow-amber-600/20 whitespace-nowrap"
                  >
                    <span>Buka Sumber Eksternal</span>
                    <span>↗</span>
                  </a>
                )}
              </div>

              {/* Main Content Preview */}
              <p className="mt-4 text-sm leading-relaxed text-zinc-300 bg-zinc-950/60 p-4 rounded-lg border border-zinc-800/80">
                {currentSlide.contentPreview}
              </p>
            </div>

            {/* Key Points & Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bullet Points (Left 2 cols) */}
              <div className="md:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                  <span>◈</span> Key Discussion Points
                </h3>
                {currentSlide.bulletPoints && currentSlide.bulletPoints.length > 0 ? (
                  <ul className="space-y-2.5">
                    {currentSlide.bulletPoints.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed text-zinc-300">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-zinc-500 italic">Tidak ada catatan poin khusus untuk slide ini.</p>
                )}
              </div>

              {/* Metrics / KPI Cards (Right 1 col) */}
              <div className="flex flex-col gap-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 flex-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                    <span>⚡</span> Key Metrics
                  </h3>
                  <div className="space-y-3">
                    {currentSlide.metrics && currentSlide.metrics.length > 0 ? (
                      currentSlide.metrics.map((metric, i) => (
                        <div key={i} className="rounded-lg bg-zinc-950/80 p-3 border border-zinc-800/70">
                          <div className="text-[11px] text-zinc-400">{metric.label}</div>
                          <div className="text-base font-bold text-white mt-0.5">{metric.value}</div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 italic">Tidak ada metrik untuk slide ini.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/90 px-6 py-3 text-xs text-zinc-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300 border border-zinc-700">← / A</kbd>
              <span>Slide Sebelumnya</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300 border border-zinc-700">→ / D</kbd>
              <span>Slide Berikutnya</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300 border border-zinc-700">Esc</kbd>
              <span>Tutup Display</span>
            </span>
          </div>
          <div className="text-zinc-500 text-[11px]">
            Layar Presentasi Konferensi Virtual • Mode Tampilan Bersama
          </div>
        </div>
      </div>
    </div>
  );
};
