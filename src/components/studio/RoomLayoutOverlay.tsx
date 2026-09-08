import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Lock,
  Unlock,
  RotateCw,
  Move,
  Compass,
  Layers,
  Check,
  RefreshCw,
  Sliders,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { ROOMS } from '../../studio/layout';
import { FurnitureDirection, InteractiveObjectDef, RoomFurnitureItem, StudioRoomType } from '../../studio/types';
import { getRoomBounds, roomLayoutStore } from '../../studio/roomLayoutStore';

interface RoomLayoutOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
  projectId?: string;
}

const ROTATION_LABELS: Record<FurnitureDirection, { label: string; arrow: string; desc: string }> = {
  0: { label: '0° (Bawah / Depan)', arrow: '↓', desc: 'Menghadap ke bawah / kamera' },
  90: { label: '90° (Kanan)', arrow: '→', desc: 'Menghadap ke sisi kanan' },
  180: { label: '180° (Atas / Belakang)', arrow: '↑', desc: 'Menghadap ke atas / dinding' },
  270: { label: '270° (Kiri)', arrow: '←', desc: 'Menghadap ke sisi kiri' },
};

export const RoomLayoutOverlay: React.FC<RoomLayoutOverlayProps> = ({ object, onClose, projectId }) => {
  const roomType: StudioRoomType = object.roomType || 'programming';
  const roomDef = ROOMS.find((r) => r.type === roomType) || ROOMS[0];
  const bounds = getRoomBounds(roomType);

  const [layoutConfig, setLayoutConfig] = useState(() => {
    if (projectId) roomLayoutStore.setProjectId(projectId);
    return roomLayoutStore.getRoomLayout(roomType);
  });

  const [items, setItems] = useState<RoomFurnitureItem[]>(layoutConfig.items);
  const [isLocked, setIsLocked] = useState<boolean>(layoutConfig.isLocked);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [nudgeStep, setNudgeStep] = useState<number>(10);

  // Dragging state on mini-map canvas
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sync with store on mount
  useEffect(() => {
    if (projectId) roomLayoutStore.setProjectId(projectId);
    const initial = roomLayoutStore.getRoomLayout(roomType);
    setLayoutConfig(initial);
    setItems(initial.items);
    setIsLocked(initial.isLocked);
    if (initial.items.length > 0) {
      setSelectedItemId(initial.items[0].id);
    }
  }, [roomType, projectId]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const selectedItem = items.find((it) => it.id === selectedItemId) || null;

  // Reposition helper
  const handleUpdatePosition = (id: string, newX: number, newY: number) => {
    if (isLocked) return;
    const clampedX = Math.round(Math.max(bounds.minX, Math.min(bounds.maxX, newX)));
    const clampedY = Math.round(Math.max(bounds.minY, Math.min(bounds.maxY, newY)));

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, x: clampedX, y: clampedY } : item))
    );

    // Live real-time sync with scene
    roomLayoutStore.updateFurniturePosition(roomType, id, clampedX, clampedY);
  };

  // Rotation helper
  const handleRotate = (id: string, targetRotation?: FurnitureDirection) => {
    if (isLocked) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextRot =
            targetRotation !== undefined
              ? targetRotation
              : (((item.rotation + 90) % 360) as FurnitureDirection);
          return { ...item, rotation: nextRot };
        }
        return item;
      })
    );

    // Live real-time sync with scene
    roomLayoutStore.rotateFurniture(roomType, id, targetRotation);
  };

  // Toggle Lock
  const handleToggleLock = () => {
    const nextLocked = !isLocked;
    setIsLocked(nextLocked);
    roomLayoutStore.toggleRoomLock(roomType, nextLocked);
  };

  // Reset to room defaults
  const handleReset = () => {
    const fresh = roomLayoutStore.resetRoomLayout(roomType);
    setLayoutConfig(fresh);
    setItems(fresh.items);
    setIsLocked(fresh.isLocked);
    if (fresh.items.length > 0) {
      setSelectedItemId(fresh.items[0].id);
    }
  };

  // Explicit Save button feedback
  const handleSave = () => {
    roomLayoutStore.saveRoomLayout(roomType, items, isLocked);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Mini-map scaling
  // Room coordinates: roomDef.x..roomDef.x + roomDef.width, roomDef.y..roomDef.y + roomDef.height
  const mapWidth = 520;
  const mapHeight = 440;
  const scaleX = mapWidth / roomDef.width;
  const scaleY = mapHeight / roomDef.height;

  const toMapX = (worldX: number) => (worldX - roomDef.x) * scaleX;
  const toMapY = (worldY: number) => (worldY - roomDef.y) * scaleY;

  const toWorldX = (mapLocalX: number) => roomDef.x + mapLocalX / scaleX;
  const toWorldY = (mapLocalY: number) => roomDef.y + mapLocalY / scaleY;

  // Mini-map Mouse Interactions
  const handleMapMouseDown = (e: React.MouseEvent<HTMLDivElement>, itemId: string) => {
    if (isLocked) {
      setSelectedItemId(itemId);
      return;
    }
    e.stopPropagation();
    setSelectedItemId(itemId);
    setIsDragging(true);

    const target = items.find((it) => it.id === itemId);
    if (target && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseMapX = e.clientX - rect.left;
      const mouseMapY = e.clientY - rect.top;
      const itemMapX = toMapX(target.x);
      const itemMapY = toMapY(target.y);
      setDragOffset({ x: mouseMapX - itemMapX, y: mouseMapY - itemMapY });
    }
  };

  const handleMapMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !selectedItemId || isLocked || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseMapX = e.clientX - rect.left - dragOffset.x;
    const mouseMapY = e.clientY - rect.top - dragOffset.y;

    const rawWorldX = toWorldX(mouseMapX);
    const rawWorldY = toWorldY(mouseMapY);
    handleUpdatePosition(selectedItemId, rawWorldX, rawWorldY);
  };

  const handleMapMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onMouseUp={handleMapMouseUp}
    >
      <div className="relative flex flex-col w-full max-w-5xl h-[88vh] max-h-[780px] bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Pengatur Tata Ruang & Furniture
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
                  {roomDef.name}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Posisikan furniture, putar arah orientasi 4 arah, dan atur status kunci layout ruangan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Lock / Unlock Mode Toggle Button */}
            <button
              type="button"
              onClick={handleToggleLock}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isLocked
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 ring-2 ring-emerald-500/20'
              }`}
            >
              {isLocked ? (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Layout Terkunci (Locked)</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <span>Mode Edit Aktif (Unlocked)</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body - Split Blueprint Canvas & Controls Inspector */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left / Center: Interactive Room Blueprint Mini-Map */}
          <div className="flex-1 flex flex-col p-5 bg-slate-950/40 border-r border-white/10 overflow-hidden">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Denah Interaktif Ruangan ({roomDef.name})</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                <span>Total: {items.length} Furniture</span>
                <span className="text-slate-600">•</span>
                <span className={isLocked ? 'text-amber-400' : 'text-emerald-400 font-semibold'}>
                  {isLocked ? '🔒 Terkunci (Klik untuk pilih)' : '🔓 Drag furniture untuk memindahkan'}
                </span>
              </div>
            </div>

            {/* Blueprint Grid Container */}
            <div className="flex-1 flex items-center justify-center p-2 rounded-xl bg-slate-950/80 border border-white/10 overflow-hidden select-none">
              <div
                ref={canvasRef}
                onMouseMove={handleMapMouseMove}
                className="relative rounded-lg border-2 border-blue-500/40 shadow-inner overflow-hidden cursor-crosshair"
                style={{
                  width: `${mapWidth}px`,
                  height: `${mapHeight}px`,
                  backgroundColor: '#0c1322',
                  backgroundImage: `
                    linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px',
                }}
              >
                {/* Room Center Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold uppercase tracking-widest text-white/[0.04] font-mono">
                    {roomDef.type}
                  </span>
                </div>

                {/* Furniture Nodes on Blueprint */}
                {items.map((item) => {
                  const isSelected = item.id === selectedItemId;
                  const itemMapX = toMapX(item.x);
                  const itemMapY = toMapY(item.y);
                  const itemW = Math.max(28, item.width * scaleX);
                  const itemH = Math.max(28, item.height * scaleY);
                  const rotInfo = ROTATION_LABELS[item.rotation] || ROTATION_LABELS[0];

                  return (
                    <div
                      key={item.id}
                      onMouseDown={(e) => handleMapMouseDown(e, item.id)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/40 border-blue-400 ring-2 ring-blue-400/60 shadow-lg shadow-blue-500/30 z-20 scale-105'
                          : 'bg-slate-800/90 border-slate-600/70 hover:border-slate-400 hover:bg-slate-700/80 z-10'
                      }`}
                      style={{
                        left: `${itemMapX}px`,
                        top: `${itemMapY}px`,
                        width: `${itemW}px`,
                        height: `${itemH}px`,
                        transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                      }}
                      title={`${item.name} (${rotInfo.label})`}
                    >
                      {/* Direction Pointer Arrow */}
                      <span className="text-xs font-bold text-sky-300 pointer-events-none">
                        {rotInfo.arrow}
                      </span>
                      <span
                        className="text-[8px] font-mono text-white/90 truncate max-w-full px-1 pointer-events-none"
                        style={{ transform: `rotate(-${item.rotation}deg)` }}
                      >
                        {item.name.split('—')[0].replace('Workstation', 'WS').slice(0, 10)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Blueprint Legend */}
            <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 shrink-0">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500 border border-blue-300" />
                  <span>Dipilih (Active)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-600" />
                  <span>Furniture</span>
                </span>
                <span className="flex items-center gap-1.5 font-mono text-sky-400">
                  <span>Panah (↓ → ↑ ←) = Orientasi Arah</span>
                </span>
              </div>
              <span className="font-mono text-slate-400">
                Grid Spanning: {roomDef.width} x {roomDef.height} px
              </span>
            </div>
          </div>

          {/* Right Sidebar: Selected Furniture Inspector & Quick List */}
          <div className="w-[380px] flex flex-col p-5 bg-slate-900 overflow-y-auto space-y-5 shrink-0">
            {/* Active Selected Furniture Inspector Card */}
            {selectedItem ? (
              <div className="flex flex-col p-4 rounded-xl bg-slate-950/70 border border-blue-500/30 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Inspektur Furniture
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {selectedItem.type}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{selectedItem.name}</h3>
                  {selectedItem.title && (
                    <p className="text-xs text-slate-300 mt-0.5">{selectedItem.title}</p>
                  )}
                </div>

                {/* 4-Direction Rotation Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5 text-sky-400" />
                      Orientasi Arah (4 Arah)
                    </span>
                    <span className="font-mono text-sky-300 font-bold text-[11px]">
                      {ROTATION_LABELS[selectedItem.rotation]?.label}
                    </span>
                  </div>

                  {/* 4 Direction Quick Buttons */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {([0, 90, 180, 270] as FurnitureDirection[]).map((deg) => {
                      const isActive = selectedItem.rotation === deg;
                      const rInfo = ROTATION_LABELS[deg];
                      return (
                        <button
                          key={deg}
                          type="button"
                          disabled={isLocked}
                          onClick={() => handleRotate(selectedItem.id, deg)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/40 ring-2 ring-blue-400'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10'
                          }`}
                        >
                          <span className="text-sm">{rInfo.arrow}</span>
                          <span className="text-[10px] mt-0.5">{deg}°</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Rotate +90deg Cycle Button */}
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => handleRotate(selectedItem.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 text-blue-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Putar 90° Searah Jarum Jam</span>
                  </button>
                </div>

                {/* Coordinate Position & Nudge D-Pad Controls */}
                <div className="space-y-2 border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5 text-emerald-400" />
                      Posisi Koordinat Spasial
                    </span>
                    <span className="font-mono text-emerald-300 text-[11px]">
                      X: {selectedItem.x} • Y: {selectedItem.y}
                    </span>
                  </div>

                  {/* Direct Coordinate Inputs */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10">
                      <span className="text-[11px] font-mono text-slate-400">X:</span>
                      <input
                        type="number"
                        disabled={isLocked}
                        value={selectedItem.x}
                        onChange={(e) =>
                          handleUpdatePosition(selectedItem.id, Number(e.target.value), selectedItem.y)
                        }
                        className="w-full bg-transparent text-xs font-mono text-white focus:outline-none disabled:opacity-50"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10">
                      <span className="text-[11px] font-mono text-slate-400">Y:</span>
                      <input
                        type="number"
                        disabled={isLocked}
                        value={selectedItem.y}
                        onChange={(e) =>
                          handleUpdatePosition(selectedItem.id, selectedItem.x, Number(e.target.value))
                        }
                        className="w-full bg-transparent text-xs font-mono text-white focus:outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Nudge D-Pad Controller */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/90 border border-white/10">
                    <div className="flex items-center justify-between w-full px-2 mb-1.5 text-[10px] text-slate-400 font-mono">
                      <span>Nudge Controller</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setNudgeStep(5)}
                          className={`px-1.5 py-0.5 rounded text-[9px] ${
                            nudgeStep === 5 ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'
                          }`}
                        >
                          5px
                        </button>
                        <button
                          type="button"
                          onClick={() => setNudgeStep(15)}
                          className={`px-1.5 py-0.5 rounded text-[9px] ${
                            nudgeStep === 15 ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'
                          }`}
                        >
                          15px
                        </button>
                      </div>
                    </div>

                    {/* D-Pad Buttons */}
                    <div className="grid grid-cols-3 gap-1 w-28">
                      <div />
                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={() =>
                          handleUpdatePosition(selectedItem.id, selectedItem.x, selectedItem.y - nudgeStep)
                        }
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center disabled:opacity-50"
                        title="Geser ke Atas"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <div />

                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={() =>
                          handleUpdatePosition(selectedItem.id, selectedItem.x - nudgeStep, selectedItem.y)
                        }
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center disabled:opacity-50"
                        title="Geser ke Kiri"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="flex items-center justify-center text-[10px] font-mono text-slate-400">
                        {nudgeStep}
                      </div>
                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={() =>
                          handleUpdatePosition(selectedItem.id, selectedItem.x + nudgeStep, selectedItem.y)
                        }
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center disabled:opacity-50"
                        title="Geser ke Kanan"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <div />
                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={() =>
                          handleUpdatePosition(selectedItem.id, selectedItem.x, selectedItem.y + nudgeStep)
                        }
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center disabled:opacity-50"
                        title="Geser ke Bawah"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <div />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-950/40 border border-dashed border-white/10 text-center">
                <Info className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400">
                  Pilih furniture pada denah atau daftar di bawah untuk mengatur posisi dan arah.
                </p>
              </div>
            )}

            {/* Room Furniture Quick List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Daftar Furniture Ruangan ({items.length})
              </span>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto no-scrollbar">
                {items.map((item) => {
                  const isSelected = item.id === selectedItemId;
                  const rotInfo = ROTATION_LABELS[item.rotation] || ROTATION_LABELS[0];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedItemId(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/30 border border-blue-500/60 text-white font-bold'
                          : 'bg-slate-950/40 hover:bg-white/5 border border-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-sky-400 shrink-0 font-mono">
                          {rotInfo.arrow}
                        </span>
                        <span className="text-xs truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px] text-slate-400">
                        <span>{item.rotation}°</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/10 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Setiap perubahan posisi & rotasi tersinkronisasi langsung ke dunia visual game.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isLocked}
              onClick={handleReset}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Terapkan & Simpan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
