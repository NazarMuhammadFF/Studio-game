import React, { useState } from 'react';
import { MockChatParticipant } from '@/studio/chat/mockChatTypes';
import { DisciplineBadge } from '@/components/profile/DisciplineBadge';
import { X, UserPlus, Search, Check } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableParticipants: MockChatParticipant[];
  existingParticipantIds: string[];
  onAddMember: (participantId: string) => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  availableParticipants,
  existingParticipantIds,
  onAddMember,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const candidates = availableParticipants.filter(
    (p) =>
      !p.isCurrentUser &&
      !existingParticipantIds.includes(p.id) &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.discipline.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <UserPlus className="w-4 h-4 text-sky-400" />
            <span>Tambah Anggota ke Diskusi</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-700 focus-within:border-sky-500 transition-colors">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau divisi tim..."
              className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full"
            />
          </div>
        </div>

        {/* Member Candidate List */}
        <div className="max-h-64 overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/40">
          {candidates.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Tidak ada anggota tim yang dapat ditambahkan
            </div>
          ) : (
            candidates.map((participant) => (
              <button
                key={participant.id}
                type="button"
                onClick={() => {
                  onAddMember(participant.id);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-sky-300">
                    {participant.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                      {participant.name}
                    </div>
                    <div className="text-[10.5px] text-slate-400">
                      {participant.roleTitle}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DisciplineBadge discipline={participant.discipline} size="sm" />
                  <span className="p-1 rounded-lg bg-sky-500/10 text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[10px] text-slate-400 text-center">
          Menambahkan anggota baru akan otomatis membuat grup diskusi baru tanpa menghapus riwayat direct chat asli.
        </div>
      </div>
    </div>
  );
};
