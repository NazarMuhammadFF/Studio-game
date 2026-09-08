import React, { useState, useEffect } from 'react';
import {
  RotateCw,
  Lock,
  Unlock,
  Check,
  RotateCcw,
  Compass,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowLeft,
  X,
  Layers,
  Sparkles,
  MousePointer,
} from 'lucide-react';
import { ROOMS } from '@/studio/layout';
import { FurnitureDirection, RoomFurnitureItem, StudioRoomType } from '@/studio/types';
import { roomLayoutStore } from '@/studio/roomLayoutStore';

export interface RoomLayoutDockProps {
  roomType: StudioRoomType;
  projectId: string;
  isLocked: boolean;
  selectedFurnitureId: string | null;
  onSelectFurniture: (id: string | null) => void;
  onRotateFurniture: (id: string, targetRotation?: FurnitureDirection) => void;
  onToggleLock: () => void;
  onResetLayout: () => void;
  onClose: () => void;
}

const ROTATION_OPTIONS: Array<{
  direction: FurnitureDirection;
  label: string;
  icon: React.ReactNode;
  hint: string;
}> = [
  { direction: 0, label: 'Depan', icon: <ArrowDown className="w-3.5 h-3.5" />, hint: 'Menghadap Depan / Bawah' },
  { direction: 90, label: 'Kanan', icon: <ArrowRight className="w-3.5 h-3.5" />, hint: 'Menghadap Kanan' },
  { direction: 180, label: 'Belakang', icon: <ArrowUp className="w-3.5 h-3.5" />, hint: 'Menghadap Belakang / Atas' },
  { direction: 270, label: 'Kiri', icon: <ArrowLeft className="w-3.5 h-3.5" />, hint: 'Menghadap Kiri' },
];

export const RoomLayoutDock: React.FC<RoomLayoutDockProps> = ({
  roomType,
  projectId,
  isLocked,
  selectedFurnitureId,
  onSelectFurniture,
  onRotateFurniture,
  onToggleLock,
  onResetLayout,
  onClose,
}) => {
  const roomDef = ROOMS.find((r) => r.type === roomType) || ROOMS[0];

  const [layoutConfig, setLayoutConfig] = useState(() => {
    if (projectId) roomLayoutStore.setProjectId(projectId);
    return roomLayoutStore.getRoomLayout(roomType);
  });

  const [entryLayout] = useState(() => structuredClone(roomLayoutStore.getRoomLayout(roomType)));
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync with store updates
  useEffect(() => {
    if (projectId) roomLayoutStore.setProjectId(projectId);
    const cfg = roomLayoutStore.getRoomLayout(roomType);
    setLayoutConfig(cfg);

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ roomType: StudioRoomType }>;
      if (customEvent.detail && customEvent.detail.roomType === roomType) {
        setLayoutConfig(roomLayoutStore.getRoomLayout(roomType));
      }
    };

    window.addEventListener('studio-room-layout-updated', handleUpdate);
    return () => window.removeEventListener('studio-room-layout-updated', handleUpdate);
  }, [roomType, projectId]);

  // Handle ESC key to finish and close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        roomLayoutStore.toggleRoomLock(roomType, true);
        if (!roomLayoutStore.storageError) onClose();
        else setSaveError(roomLayoutStore.storageError);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, roomType]);

  const items = layoutConfig.items || [];
  const selectedItem: RoomFurnitureItem | null =
    items.find((it) => it.id === selectedFurnitureId) || null;

  const handleRotateClick = (targetRot?: FurnitureDirection) => {
    if (!selectedItem || isLocked) return;
    onRotateFurniture(selectedItem.id, targetRot);
  };

  const handleSaveAndClose = () => {
    roomLayoutStore.saveRoomLayout(roomType, items, true);
    if (roomLayoutStore.storageError) { setSaveError(roomLayoutStore.storageError); return; }
    onClose();
  };

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 pointer-events-auto select-none w-[94%] max-w-5xl animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex flex-col rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-sky-500/30 shadow-2xl shadow-slate-950/80 text-white overflow-hidden ring-1 ring-white/10">
        
        {/* 1. Header Bar: Room Info, Mode Status, Lock, Finish Button */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/70 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  Penataan Ruang: {roomDef.name}
                </span>
                <span
                  className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                    isLocked
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {isLocked ? <Lock className="w-2.5 h-2.5" /> : <Sparkles className="w-2.5 h-2.5" />}
                  {isLocked ? 'Terkunci' : 'Mode Edit Aktif'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {isLocked
                  ? 'Layout terkunci. Klik tombol "Buka Kunci" untuk menggeser atau mengubah arah furniture.'
                  : 'Klik objek di studio atau di daftar bawah. Tarik objek untuk memindah • Pilih arah hadap • ESC untuk selesai.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleLock}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                isLocked
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10'
              }`}
            >
              {isLocked ? <Unlock className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isLocked ? 'Buka Kunci' : 'Kunci'}</span>
            </button>

            <button
              type="button"
              onClick={onResetLayout}
              disabled={isLocked}
              title="Kembalikan posisi semua furniture di ruangan ini ke default"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-white/10 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndClose}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-950/40 transition-all active:scale-95 hover:scale-105"
            >
              <Check className="w-4 h-4" />
              <span>Selesai</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndClose}
              title="Tutup Panel (ESC)"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-1 text-[10px] text-slate-400">
          <span>{saveError || roomLayoutStore.storageError || 'Tersimpan otomatis di browser ini • Posisi mengikuti grid halus'}</span>
          <button type="button" className="text-amber-300 hover:underline" onClick={() => {roomLayoutStore.saveRoomLayout(roomType, entryLayout.items, entryLayout.isLocked); if (!roomLayoutStore.storageError) onClose(); else setSaveError(roomLayoutStore.storageError);}}>Batalkan perubahan sesi ini</button>
        </div>
        {/* 2. Furniture Carousel / Item Selection Strip */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-900/90 border-b border-white/5 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Furniture:</span>
          </div>

          {items.map((item) => {
            const isSelected = selectedItem?.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectFurniture(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? 'bg-sky-500/25 text-sky-300 border border-sky-400 shadow-sm shadow-sky-950/50 scale-102 font-semibold'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-white/10 hover:border-white/20'
                }`}
              >
                <span>{item.name}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                    isSelected ? 'bg-sky-400/30 text-sky-200' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {ROTATION_OPTIONS.find(o => o.direction === item.rotation)?.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. Active Furniture Action Controls Dock */}
        {selectedItem ? (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950/80">
            {/* Selected Item Info & Coordinates */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-400 shrink-0">
                <MousePointer className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    {selectedItem.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-800 border border-white/10 text-slate-300">
                    X: {selectedItem.x}, Y: {selectedItem.y}
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-0.5">
                  Orientasi saat ini: <span className="text-sky-300 font-semibold">{ROTATION_OPTIONS.find((r) => r.direction === (selectedItem.rotation || 0))?.hint}</span>
                </p>
              </div>
            </div>

            {/* Quick 1-Click Rotate & 4-Direction Control Buttons */}
            <div className="flex items-center gap-2">
              {/* Big 1-Click +90° Spin Button */}
              <button
                type="button"
                onClick={() => handleRotateClick()}
                disabled={isLocked}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-950/40 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                <RotateCw className="w-4 h-4" />
                <span>Ganti arah</span>
              </button>

              {/* 4 Instant Direction Chips */}
              <div className="flex items-center rounded-xl bg-slate-900 border border-white/10 p-0.5 gap-0.5">
                {ROTATION_OPTIONS.map((opt) => {
                  const isActive = (selectedItem.rotation || 0) === opt.direction;
                  return (
                    <button
                      key={opt.direction}
                      type="button"
                      onClick={() => handleRotateClick(opt.direction)}
                      disabled={isLocked}
                      aria-pressed={isActive}
                      title={`${opt.label}: ${opt.hint}`}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-sky-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      } disabled:opacity-40 disabled:pointer-events-none`}
                    >
                      {opt.icon}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-4 text-xs text-slate-400">
            <span>Tidak ada furniture yang dipilih di ruangan ini.</span>
          </div>
        )}
      </div>
    </div>
  );
};
