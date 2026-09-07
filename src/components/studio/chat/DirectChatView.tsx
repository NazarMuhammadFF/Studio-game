import { mockChatStore } from '@/studio/chat/mockChatStore';
import React, { useState, useRef, useEffect } from 'react';
import {
  MockConversation,
  MockChatMessage,
  MockChatParticipant,
} from '@/studio/chat/mockChatTypes';
import { DisciplineBadge } from '@/components/profile/DisciplineBadge';
import { AddMemberModal } from './AddMemberModal';
import {
  Send,
  UserPlus,
  ArrowLeft,
  Users,
  Sparkles,
} from 'lucide-react';

interface DirectChatViewProps {
  conversation: MockConversation;
  messages: MockChatMessage[];
  allParticipants: MockChatParticipant[];
  onBack: () => void;
  onSendMessage: (content: string) => void;
  onAddMember: (memberId: string) => void;
  onSelectMemberProfile?: (member: MockChatParticipant) => void;
  isEligibleToChat?: boolean;
  locationBadge?: {
    isNearby: boolean;
    isInSameRoom: boolean;
    roomName?: string;
  };
}

export const DirectChatView: React.FC<DirectChatViewProps> = ({
  conversation,
  messages,
  allParticipants,
  onBack,
  onSendMessage,
  onAddMember,
  onSelectMemberProfile,
  isEligibleToChat = true,
  locationBadge,
}) => {
  const [inputText, setInputText] = useState('');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom upon new message or typing state change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, conversation.isTyping]);

  const otherParticipants = allParticipants.filter(
    (p) => conversation.participantIds.includes(p.id) && !p.isCurrentUser
  );

  const isGroup = conversation.type === 'group';
  const directPartner = !isGroup ? otherParticipants[0] : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'in_flow':
        return (
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            In Flow
          </span>
        );
      case 'busy':
        return (
          <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Sibuk
          </span>
        );
      case 'offline':
        return (
          <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Offline
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] text-sky-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Online
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/70 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3 bg-slate-900/90 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Kembali ke Daftar Obrolan"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {isGroup ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{conversation.name}</span>
                  <span className="text-[10px] font-normal text-slate-400">
                    ({conversation.participantIds.length} anggota)
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
                  {otherParticipants.map((p) => p.name).join(', ')}
                </div>
              </div>
            </div>
          ) : directPartner ? (
            <div
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onSelectMemberProfile?.(directPartner)}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-sky-300">
                  {directPartner.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 bg-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>{directPartner.name}</span>
                  <DisciplineBadge discipline={directPartner.discipline} size="sm" />
                  {locationBadge && (
                    locationBadge.isNearby ? (
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                        Dekat Anda
                      </span>
                    ) : locationBadge.isInSameRoom ? (
                      <span className="px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[9px] font-bold">
                        Satu Ruangan
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                        Beda Ruangan
                      </span>
                    )
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(directPartner.status)}
                  <span className="text-[10px] text-slate-500">• {directPartner.currentRoom}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs font-bold text-white">{conversation.name}</div>
          )}
        </div>

        {/* Add Member action */}
        <button
          type="button"
          onClick={() => setIsAddMemberOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-[11px] font-semibold transition-colors"
          title={directPartner?.isLive ? "Grup realtime belum tersedia" : "Tambah anggota untuk buat grup obrolan"}
          disabled={Boolean(directPartner?.isLive)}
        >
          <UserPlus className="w-3.5 h-3.5 text-sky-400" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {/* Intro banner */}
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400">
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>{directPartner?.isLive ? 'Pesan pribadi • Tersimpan untuk pengirim dan penerima' : 'Simulasi komunikasi lokal • Pesan memicu balon ucapan in-game'}</span>
          </div>
        </div>

        {directPartner?.isLive && mockChatStore.chatError && <p role="alert" className="text-xs text-amber-300">{mockChatStore.chatError}</p>}
        {messages.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-1">
            <p>Belum ada pesan di percakapan ini.</p>
            <p className="text-[11px] text-slate-600">Ketik pesan di bawah untuk memulai obrolan.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === 'local_player';

            if (msg.isSystem) {
              return (
                <div key={msg.id} className="text-center py-1">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800/80">
                    {msg.content}
                  {msg.delivery && <div className="mt-1 text-[10px] opacity-80" role={msg.delivery==='failed' ? 'alert' : undefined}>{msg.delivery==='sending' ? 'Mengirim…' : msg.delivery==='failed' ? msg.error : 'Terkirim'}</div>}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}
              >
                {!isMe && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                    <span className="font-semibold text-slate-300">{msg.senderName}</span>
                    {msg.senderDiscipline && (
                      <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 font-mono">
                        {msg.senderDiscipline}
                      </span>
                    )}
                    <span className="text-[9px] text-slate-500">{msg.createdAt}</span>
                  </div>
                )}

                <div
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-sky-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>

                {isMe && (
                  <span className="text-[9px] text-slate-500 px-1">{msg.createdAt}</span>
                )}
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {conversation.isTyping && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/50 w-fit animate-in fade-in">
            <span className="text-[10px] text-sky-400 font-medium">
              {conversation.typingParticipantName || 'Rekan'} sedang mengetik
            </span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Eligibility Notice when not nearby or in the same room */}
      {!isEligibleToChat && (
        <div className="px-3.5 py-2 bg-amber-950/40 border-t border-amber-500/30 flex items-center gap-2 text-[11px] text-amber-200 shrink-0">
          <span className="text-sm">⚠️</span>
          <span>
            Chat 1-on-1 hanya aktif jika Anda berada di dekat rekan ini atau berada dalam satu ruangan.
          </span>
        </div>
      )}

      {/* Message Input Box */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-slate-900/90 border-t border-white/10 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          autoFocus={isEligibleToChat}
          disabled={!isEligibleToChat}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
          onKeyUp={(e) => {
            e.stopPropagation();
          }}
          placeholder={
            isEligibleToChat
              ? `Kirim pesan ke ${conversation.name}...`
              : `Dekati ${conversation.name} atau masuki ruangannya untuk chat...`
          }
          maxLength={150}
          className={`flex-1 px-3.5 py-2 text-xs bg-slate-950 border rounded-xl text-white placeholder-slate-500 outline-none transition-colors ${
            !isEligibleToChat
              ? 'border-slate-850 opacity-50 cursor-not-allowed bg-slate-900/50'
              : 'border-slate-700/80 focus:border-sky-500'
          }`}
        />
        <button
          type="submit"
          disabled={!isEligibleToChat || !inputText.trim()}
          className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:hover:bg-sky-500 text-slate-950 font-bold transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        availableParticipants={allParticipants}
        existingParticipantIds={conversation.participantIds}
        onAddMember={onAddMember}
      />
    </div>
  );
};
