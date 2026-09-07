import React, { useState, useEffect } from 'react';
import { DesignBalancingItem, InteractiveObjectDef } from '../../studio/types';

interface BalancingBoardOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
}

export const BalancingBoardOverlay: React.FC<BalancingBoardOverlayProps> = ({
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

  const items: DesignBalancingItem[] = object.balancingItems || [];
  const categories = ['all', 'Player Combat', 'Enemy Stats', 'Economy Drop', 'Difficulty Curve'];

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter((it) => it.category === selectedCategory);

  const getReviewBadge = (state: DesignBalancingItem['reviewState']) => {
    switch (state) {
      case 'approved':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            ✓ Tuned & Approved
          </span>
        );
      case 'changes_requested':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
            ↺ Needs Retuning
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
            ⏳ Pending Playtest
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
        className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-slate-900/95 border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-950/50 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold text-lg">
              ⚖️
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-amber-100">
                {object.name || 'Combat & Economy Balancing Board'}
              </h2>
              <p className="text-xs text-amber-300/80">
                Damage values, health pools, resource drop curves, and difficulty baselines
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

        {/* Category Tabs */}
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
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Parameter List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 hover:border-amber-500/50 hover:bg-slate-800/90 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 text-amber-300">
                    {item.category}
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {item.parameterName}
                  </h3>
                  {getReviewBadge(item.reviewState)}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.notes}
                </p>
              </div>

              {/* Values Card */}
              <div className="flex items-center gap-4 bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    Current Tuned
                  </span>
                  <span className="text-sm font-bold font-mono text-amber-400">
                    {item.currentValue}
                  </span>
                </div>

                <div className="w-px h-8 bg-slate-800" />

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    Target Baseline
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-300">
                    {item.targetBaseline}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">No balancing parameters found in this category.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Game Balancing Matrix Active</span>
          <span className="font-mono text-[11px] text-slate-500">
            Design Room Layer • StudioGame V1
          </span>
        </div>
      </div>
    </div>
  );
};
