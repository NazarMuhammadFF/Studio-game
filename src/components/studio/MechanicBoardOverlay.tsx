import React, { useState, useEffect } from 'react';
import { DesignMechanicItem, InteractiveObjectDef } from '../../studio/types';

interface MechanicBoardOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
}

export const MechanicBoardOverlay: React.FC<MechanicBoardOverlayProps> = ({
  object,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const mechanics: DesignMechanicItem[] = object.mechanicItems || [];
  const categories = ['all', 'Combat', 'Traversal', 'Progression', 'Economy', 'Narrative'];

  const filteredMechanics = selectedCategory === 'all'
    ? mechanics
    : mechanics.filter((m) => m.category === selectedCategory);

  const getStatusBadge = (status: DesignMechanicItem['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            ✓ Approved
          </span>
        );
      case 'In Balance':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
            ⚖ In Balance
          </span>
        );
      case 'Prototyped':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            ⚡ Prototyped
          </span>
        );
      case 'In Concept':
      default:
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
            ✎ In Concept
          </span>
        );
    }
  };

  const getReviewBadge = (reviewState: DesignMechanicItem['reviewState']) => {
    switch (reviewState) {
      case 'approved':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            Review: Approved
          </span>
        );
      case 'changes_requested':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-500/30">
            Review: Needs Changes
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-500/30">
            Review: Pending
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-slate-900/95 border border-emerald-500/40 rounded-2xl shadow-2xl shadow-emerald-950/50 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold text-lg">
              ⚙️
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-emerald-100">
                {object.name || 'Game Mechanics Matrix'}
              </h2>
              <p className="text-xs text-emerald-300/80">
                Core player verbs, state machines, and system interaction dependencies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex text-[11px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
              ESC to close
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wider">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all capitalize ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mechanics List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredMechanics.map((mech) => (
            <div
              key={mech.id}
              className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 hover:border-emerald-500/50 hover:bg-slate-800/90 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-300">
                    {mech.category}
                  </span>
                  <h3 className="text-base font-bold text-white truncate">
                    {mech.name}
                  </h3>
                  {getStatusBadge(mech.status)}
                  {getReviewBadge(mech.reviewState)}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {mech.description}
                </p>

                <div className="text-xs text-slate-400 flex items-center gap-2 pt-1">
                  <span>Owner: <strong className="text-slate-200">{mech.owner}</strong></span>
                  <span>•</span>
                  <span>Implementation: <strong className="text-emerald-400 font-mono">{mech.progress}%</strong></span>
                </div>
              </div>

              {/* Progress bar miniature */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                <div className="w-28 bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all"
                    style={{ width: `${mech.progress}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                  {mech.progress}% Done
                </span>
              </div>
            </div>
          ))}

          {filteredMechanics.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">No gameplay mechanics found in this category.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Game Mechanics Matrix Active</span>
          <span className="font-mono text-[11px] text-slate-500">
            Design Room Layer • StudioGame V1
          </span>
        </div>
      </div>
    </div>
  );
};
