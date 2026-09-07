import React, { useState, useEffect } from 'react';
import { ArtReviewItem, InteractiveObjectDef } from '../../studio/types';

interface ArtReviewBoardOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
}

export const ArtReviewBoardOverlay: React.FC<ArtReviewBoardOverlayProps> = ({
  object,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'changes_requested'>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const reviewItems: ArtReviewItem[] = object.reviewItems || [];

  const pendingCount = reviewItems.filter((i) => i.reviewState === 'pending').length;
  const approvedCount = reviewItems.filter((i) => i.reviewState === 'approved').length;
  const changesCount = reviewItems.filter((i) => i.reviewState === 'changes_requested').length;

  const filteredItems = reviewItems.filter((item) => {
    if (activeTab === 'all') return true;
    return item.reviewState === activeTab;
  });

  const getStatusBadge = (state: ArtReviewItem['reviewState']) => {
    switch (state) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <span>✓</span> Approved
          </span>
        );
      case 'changes_requested':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <span>↺</span> Needs Changes
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <span>⏳</span> Pending Review
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
        className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-slate-900/95 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 font-bold text-lg">
              📋
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-cyan-100">
                {object.name || 'Shared Art Review Board'}
              </h2>
              <p className="text-xs text-cyan-300/80">
                Production review queue, turnaround critiques, and approvals
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

        {/* KPI Counter Row */}
        <div className="grid grid-cols-4 gap-2 px-6 py-3 border-b border-slate-800 bg-slate-950/40">
          <div
            onClick={() => setActiveTab('all')}
            className={`cursor-pointer px-3 py-2 rounded-xl border text-center transition-all ${
              activeTab === 'all'
                ? 'bg-slate-800 border-cyan-400/60 shadow'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-lg font-bold text-white">{reviewItems.length}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Total Assets
            </div>
          </div>

          <div
            onClick={() => setActiveTab('pending')}
            className={`cursor-pointer px-3 py-2 rounded-xl border text-center transition-all ${
              activeTab === 'pending'
                ? 'bg-amber-950/40 border-amber-400/60 shadow'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-lg font-bold text-amber-400">{pendingCount}</div>
            <div className="text-[10px] text-amber-300/80 uppercase tracking-wider font-semibold">
              Pending
            </div>
          </div>

          <div
            onClick={() => setActiveTab('approved')}
            className={`cursor-pointer px-3 py-2 rounded-xl border text-center transition-all ${
              activeTab === 'approved'
                ? 'bg-emerald-950/40 border-emerald-400/60 shadow'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-lg font-bold text-emerald-400">{approvedCount}</div>
            <div className="text-[10px] text-emerald-300/80 uppercase tracking-wider font-semibold">
              Approved
            </div>
          </div>

          <div
            onClick={() => setActiveTab('changes_requested')}
            className={`cursor-pointer px-3 py-2 rounded-xl border text-center transition-all ${
              activeTab === 'changes_requested'
                ? 'bg-rose-950/40 border-rose-400/60 shadow'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-lg font-bold text-rose-400">{changesCount}</div>
            <div className="text-[10px] text-rose-300/80 uppercase tracking-wider font-semibold">
              Needs Changes
            </div>
          </div>
        </div>

        {/* Asset List Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 hover:border-cyan-500/50 hover:bg-slate-800/90 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                    {item.category}
                  </span>
                  <h3 className="text-base font-bold text-white truncate">
                    {item.assetName}
                  </h3>
                  {getStatusBadge(item.reviewState)}
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>Artist: <strong className="text-slate-200">{item.ownerName}</strong></span>
                  <span>•</span>
                  <span>Progress: <strong className="text-cyan-400 font-mono">{item.progressPercentage}%</strong></span>
                </div>

                {item.feedbackNotes && (
                  <div className="text-xs bg-slate-900/80 rounded-lg p-2.5 text-slate-300 border-l-2 border-cyan-400 mt-2">
                    <span className="text-[11px] font-semibold text-cyan-300 block mb-0.5">
                      Feedback / Review Notes:
                    </span>
                    {item.feedbackNotes}
                  </div>
                )}
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                {/* Progress bar miniature */}
                <div className="w-28 bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all"
                    style={{ width: `${item.progressPercentage}%` }}
                  />
                </div>

                {item.externalAssetUrl && (
                  <a
                    href={item.externalAssetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600 hover:text-white transition-all"
                  >
                    <span>Inspect Asset</span>
                    <span>↗</span>
                  </a>
                )}
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">No items in this review tab.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Art Review Pipeline Active</span>
          <span className="font-mono text-[11px] text-slate-500">
            Art Room Layer • StudioGame V1
          </span>
        </div>
      </div>
    </div>
  );
};
