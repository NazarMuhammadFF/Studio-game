import React, { useState, useRef, useEffect } from 'react';
import {
  MockConversation,
  MockChatMessage,
  MockChatParticipant,
  ROOM_COLLEAGUES,
} from '@/studio/chat/mockChatTypes';
import { DisciplineBadge } from '@/components/profile/DisciplineBadge';
import { Send, Users, Hash, MapPin, MessageSquarePlus } from 'lucide-react';

interface RoomChatViewProps {
  conversation: MockConversation;
  messages: MockChatMessage[];
  roomTitle: string;
  roomType: string;
  allParticipants: MockChatParticipant[];
  onSendMessage: (content: string) => void;
  onOpenDirectChat?: (participantId: string) => void;
}

export const RoomChatView: React.FC<RoomChatViewProps> = ({
  conversation,
  messages,
  roomTitle,
  roomType,
  allParticipants,
  onSendMessage,
  onOpenDirectChat,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  // Filter participants belonging to this room
  const allowedMemberIds = ROOM_COLLEAGUES[roomType] || [];
  const presentMembers = allParticipants.filter((p) => {
    if (p.isCurrentUser) return true;
    return allowedMemberIds.includes(p.id);
  });

  // Nama obrolan aktif ruangan berdasarkan orang-orang di dalam room chat
  const colleagueMembers = presentMembers.filter((p) => !p.isCurrentUser);
  const roomChatName =
    conversation.name ||
    (colleagueMembers.length > 0
      ? colleagueMembers.map((p) => p.name).join(', ')
      : 'Hanya Anda (Ruangan Kosong)');

  return (
    <div className="flex flex-col h-full bg-slate-950/70 select-none">
      {/* Room Header */}
      <div className="p-3 bg-slate-900/90 border-b border-white/10 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5" title={roomChatName}>
                <span className="truncate max-w-[210px]">{roomChatName}</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                <span className="truncate max-w-[210px]">Saluran Ruangan • #{roomTitle}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10.5px] font-mono text-slate-300">
            <Users className="w-3 h-3 text-emerald-400" />
            <span>{presentMembers.length} Hadir</span>
          </div>
        </div>

        {/* Present Members Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {presentMembers.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => {
                if (!member.isCurrentUser && onOpenDirectChat) {
                  onOpenDirectChat(member.id);
                }
              }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[10px] text-slate-300 hover:text-white border border-slate-700/60 transition-colors shrink-0"
              title={member.isCurrentUser ? 'Anda' : `Buka Direct Chat dengan ${member.name}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  member.status === 'in_flow'
                    ? 'bg-emerald-400 animate-pulse'
                    : member.status === 'busy'
                    ? 'bg-amber-400'
                    : 'bg-sky-400'
                }`}
              />
              <span>{member.name}</span>
              {!member.isCurrentUser && (
                <MessageSquarePlus className="w-2.5 h-2.5 text-sky-400 ml-0.5" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {messages.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-1">
            <p>Belum ada obrolan di ruangan ini.</p>
            <p className="text-[11px] text-slate-600">
              Kirim pesan untuk berdiskusi dengan semua anggota di {roomTitle}!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === 'local_player';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}
              >
                {!isMe && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                    <span className="font-semibold text-slate-300">{msg.senderName}</span>
                    {msg.senderDiscipline && (
                      <DisciplineBadge discipline={msg.senderDiscipline} size="sm" />
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-slate-900/90 border-t border-white/10 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          autoFocus
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
          placeholder={
            colleagueMembers.length > 0
              ? `Kirim pesan ke ${roomChatName}...`
              : `Kirim pesan di #${roomTitle}...`
          }
          maxLength={150}
          className="flex-1 px-3.5 py-2 text-xs bg-slate-950 border border-slate-700/80 focus:border-sky-500 rounded-xl text-white placeholder-slate-500 outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:hover:bg-sky-500 text-slate-950 font-bold transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
