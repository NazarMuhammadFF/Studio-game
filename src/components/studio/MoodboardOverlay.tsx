import React, { useState, useEffect } from 'react';
import { ArtMoodboardItem, InteractiveObjectDef } from '../../studio/types';

interface MoodboardOverlayProps {
  object: InteractiveObjectDef;
  onClose: () => void;
}

export const MoodboardOverlay: React.FC<MoodboardOverlayProps> = ({ object, onClose }) => {
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

  const items: ArtMoodboardItem[] = object.moodboardItems || [];
  const categories = ['all', ...Array.from(new Set(items.map((it) => it.category)))];

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter((it) => it.category === selectedCategory);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-slate-900/95 border border-purple-500/40 rounded-2xl shadow-2xl shadow-purple-950/50 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 font-bold text-lg">
              🎨
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-purple-100">
                {object.name || 'Art Reference Wall & Moodboard'}
              </h2>
              <p className="text-xs text-purple-300/80">
                Visual inspirations, lighting scripts, and styleguides
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
            Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all capitalize ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Moodboard Grid Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 hover:border-purple-500/50 hover:bg-slate-800/90 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider text-purple-300 bg-purple-950/80 border border-purple-500/30"
                      style={
                        item.colorAccent
                          ? { borderColor: item.colorAccent, color: item.colorAccent }
                          : undefined
                      }
                    >
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Ref #{item.id}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-400 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {item.externalUrl && (
                    <a
                      href={item.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white transition-all shrink-0"
                    >
                      <span>Figma Board</span>
                      <span>↗</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">No reference items found for this filter.</p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>Interactive Art Production Moodboard</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            Art Room Layer • StudioGame V1
          </span>
        </div>
      </div>
    </div>
  );
};
