import React, { useState, useEffect } from 'react';
import { MockChatParticipant, ROOM_COLLEAGUES } from '@/studio/chat/mockChatTypes';
import { WorkstationMemberData } from '@/studio/types';
import { useMockChat, mockChatStore } from '@/studio/chat/mockChatStore';
import { DirectChatView } from './DirectChatView';
import { RoomChatView } from './RoomChatView';
import { AddMemberModal } from './AddMemberModal';
import {
  X,
  Hash,
  MessageSquare,
  Users,
  Plus,
  Search,
  MessageSquarePlus,
  MapPin,
} from 'lucide-react';

interface StudioChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoomType: string;
  currentRoomName: string;
  nearbyMember?: WorkstationMemberData | null;
  initialConversationId?: string | null;
  onSelectMemberProfile?: (member: MockChatParticipant) => void;
  onUserSentMessage?: (message: string) => void;
}

export const StudioChatDrawer: React.FC<StudioChatDrawerProps> = ({
  isOpen,
  onClose,
  currentRoomType,
  currentRoomName,
  nearbyMember,
  initialConversationId,
  onSelectMemberProfile,
  onUserSentMessage,
}) => {
  const {
    participants,
    conversations,
    getConversation,
    getMessages,
    getRoomConversation,
    getOrCreateDirectConversation,
    createGroupConversation,
    addMemberToConversation,
    sendMessage,
    markAsRead,
  } = useMockChat();

  const [activeTab, setActiveTab] = useState<'room' | 'direct' | 'group'>('room');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [isNewDirectModalOpen, setIsNewDirectModalOpen] = useState(false);

  // Synchronize initialConversationId when opened externally (e.g. from avatar interaction)
  useEffect(() => {
    if (initialConversationId) {
      const conv = mockChatStore.getConversation(initialConversationId);
      if (conv) {
        setSelectedConversationId(conv.id);
        if (conv.type === 'room') setActiveTab('room');
        else if (conv.type === 'direct') setActiveTab('direct');
        else if (conv.type === 'group') setActiveTab('group');
      }
    }
  }, [initialConversationId, isOpen]);

  const selectedUnread = conversations.find(c => c.id === selectedConversationId)?.unreadCount;
  useEffect(() => {
    if (isOpen && selectedConversationId && selectedUnread) {
      mockChatStore.markAsRead(selectedConversationId);
    }
  }, [isOpen, selectedConversationId, selectedUnread]);

  // Handle ESC key to close or return
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (selectedConversationId && activeTab !== 'room') {
          setSelectedConversationId(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, selectedConversationId, activeTab, onClose]);

  if (!isOpen) return null;

  // Active room conversation
  const currentRoomConv = getRoomConversation(currentRoomType);

  // Active conversation if selected
  const activeConversation = selectedConversationId
    ? getConversation(selectedConversationId)
    : activeTab === 'room'
    ? currentRoomConv
    : null;

  const activeMessages = activeConversation ? getMessages(activeConversation.id) : [];

  // Rekan kerja yang valid untuk chat langsung: HANYA yang berada di dekatnya ATAU di ruangan yang sama
  const roomMemberIds = ROOM_COLLEAGUES[currentRoomType] || [];

  const checkColleagueEligibility = (participantId: string, participantName?: string) => {
    const isNearby = Boolean(
      nearbyMember &&
      (participantId === nearbyMember.assignedUserId ||
       (participantName && participantName.toLowerCase() === nearbyMember.name.toLowerCase()))
    );
    const participant=participants.find(p=>p.id===participantId);
    const isInSameRoom = participant?.isLive ? participant.currentRoom===currentRoomName : roomMemberIds.includes(participantId);
    return {
      isEligible: Boolean(participant?.isLive) || isNearby || isInSameRoom,
      isNearby,
      isInSameRoom,
    };
  };

  const eligibleDirectParticipants = participants.filter((p) => {
    if (p.isCurrentUser) return false;
    return checkColleagueEligibility(p.id, p.name).isEligible;
  });

  // Filter conversations by tab
  const directConversations = conversations.filter((c) => c.type === 'direct');
  const groupConversations = conversations.filter((c) => c.type === 'group');

  // HANYA tampilkan percakapan direct jika partner berada di dekatnya ATAU di ruangan yang sama
  const eligibleDirectConversations = directConversations.filter((conv) => {
    const partnerId = conv.participantIds.find((id) => id !== 'local_player') || '';
    const partner = participants.find((p) => p.id === partnerId);
    if (!partner) return false;
    return checkColleagueEligibility(partner.id, partner.name).isEligible;
  });

  const filteredDirect = eligibleDirectConversations.filter((c) =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredGroup = groupConversations.filter((c) =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Rekan yang hadir di ruangan ini / dekat tapi belum ada riwayat obrolan direct
  const activeChatPartnerIds = new Set(
    eligibleDirectConversations.map(
      (c) => c.participantIds.find((id) => id !== 'local_player') || ''
    )
  );
  const eligibleColleaguesWithoutChat = eligibleDirectParticipants.filter(
    (p) => !activeChatPartnerIds.has(p.id)
  );

  const handleStartDirectWith = (participantId: string) => {
    const conv = getOrCreateDirectConversation(participantId);
    setSelectedConversationId(conv.id);
    setActiveTab('direct');
    setIsNewDirectModalOpen(false);
  };

  const handleCreateGroupWith = (participantId: string) => {
    const participant = participants.find((p) => p.id === participantId);
    const newGroup = createGroupConversation(
      `Diskusi ${participant?.name || 'Tim'} & Anda`,
      [participantId],
      'Grup diskusi kolaborasi dibuat.'
    );
    setSelectedConversationId(newGroup.id);
    setActiveTab('group');
  };

  return (
    <div className="fixed top-3 bottom-3 right-3 w-96 z-[9999] pointer-events-auto flex flex-col bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-right-4 duration-200">
      {/* Drawer Top Navigation Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/80 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <MessageSquare className="w-4 h-4 text-sky-400" />
          <span>Komunikasi Studio</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Tutup Chat (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center p-1.5 bg-slate-950/50 border-b border-white/10 gap-1 shrink-0">
        <button
          type="button"
          onClick={() => {
            setActiveTab('room');
            setSelectedConversationId(currentRoomConv.id);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'room'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          <span>Ruangan</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('direct');
            if (activeConversation?.type !== 'direct') {
              setSelectedConversationId(null);
            }
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'direct'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Langsung</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('group');
            if (activeConversation?.type !== 'group') {
              setSelectedConversationId(null);
            }
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'group'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Grup</span>
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 min-h-0 relative">
        {/* TAB 1: ROOM CHAT */}
        {activeTab === 'room' && (
          <RoomChatView
            conversation={currentRoomConv}
            messages={getMessages(currentRoomConv.id)}
            roomTitle={currentRoomName}
            roomType={currentRoomType}
            allParticipants={participants}
            onSendMessage={(text) => {
              sendMessage(currentRoomConv.id, text);
              onUserSentMessage?.(text);
            }}
            onOpenDirectChat={(memberId) => handleStartDirectWith(memberId)}
          />
        )}

        {/* TAB 2: DIRECT CHAT (Hanya rekan di dekatnya atau dalam satu ruangan) */}
        {activeTab === 'direct' && (
          selectedConversationId && activeConversation?.type === 'direct' ? (
            (() => {
              const partnerId = activeConversation.participantIds.find((id) => id !== 'local_player') || '';
              const partner = participants.find((p) => p.id === partnerId);
              const eligibility = partner
                ? checkColleagueEligibility(partner.id, partner.name)
                : { isEligible: false, isNearby: false, isInSameRoom: false };

              return (
                <DirectChatView
                  conversation={activeConversation}
                  messages={activeMessages}
                  allParticipants={participants}
                  onBack={() => setSelectedConversationId(null)}
                  onSendMessage={(text) => {
                    void sendMessage(activeConversation.id, text);
                    if (!mockChatStore.isLiveConversation(activeConversation.id)) onUserSentMessage?.(text);
                  }}
                  onAddMember={(memberId) => {
                    const newGroup = addMemberToConversation(activeConversation.id, memberId);
                    if (newGroup) {
                      setSelectedConversationId(newGroup.id);
                      setActiveTab('group');
                    }
                  }}
                  onSelectMemberProfile={onSelectMemberProfile}
                  isEligibleToChat={eligibility.isEligible}
                  locationBadge={{
                    isNearby: eligibility.isNearby,
                    isInSameRoom: eligibility.isInSameRoom,
                    roomName: currentRoomName,
                  }}
                />
              );
            })()
          ) : (
            <div className="flex flex-col h-full bg-slate-950/70 p-3 space-y-3">
              {/* Contextual Status Bar: Hanya rekan di dekatnya atau satu ruangan yang dapat di-chat */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="text-slate-300 font-medium">
                    Ruangan: <strong className="text-white">{currentRoomName}</strong>
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 font-semibold">
                  {eligibleDirectParticipants.length} Rekan Relevan
                </span>
              </div>

              {/* Search & New Direct button */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-700/80 focus-within:border-sky-500 transition-colors">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Cari rekan di sekitar..."
                    className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full"
                  />
                </div>
                {eligibleDirectParticipants.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsNewDirectModalOpen(true)}
                    className="p-2 rounded-xl bg-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-slate-950 border border-sky-400/40 transition-colors"
                    title="Mulai Pesan Langsung Baru dengan Rekan di Sekitar"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Conversation & Eligible Member List */}
              <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                {filteredDirect.length === 0 && eligibleColleaguesWithoutChat.length === 0 ? (
                  <div className="py-10 px-3 text-center space-y-3 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shadow">
                      <Users className="w-6 h-6 text-slate-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-300">
                        Tidak Ada Rekan di Sekitar Anda
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed max-w-[260px] mx-auto">
                        Chat langsung (1-on-1) hanya dapat dilakukan dengan orang yang berada di dekat Anda atau berada dalam satu ruangan ({currentRoomName}).
                      </p>
                    </div>
                    <div className="inline-block px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[10.5px] text-sky-300 font-mono">
                      Dekati avatar rekan atau masuki ruang kerja mereka
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Active eligible conversations */}
                    {filteredDirect.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-1">
                          Obrolan Aktif di Ruangan Ini / Dekat Anda
                        </span>
                        {filteredDirect.map((conv) => {
                          const partnerId = conv.participantIds.find((id) => id !== 'local_player') || '';
                          const partner = participants.find((p) => p.id === partnerId);
                          const { isNearby } = partner
                            ? checkColleagueEligibility(partner.id, partner.name)
                            : { isNearby: false };

                          return (
                            <button
                              key={conv.id}
                              type="button"
                              onClick={() => {
                                setSelectedConversationId(conv.id);
                                markAsRead(conv.id);
                              }}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-left transition-all hover:border-slate-700 group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative shrink-0">
                                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-sky-300">
                                    {conv.name.slice(0, 2).toUpperCase()}
                                  </div>
                                  <span
                                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${
                                      partner?.status === 'in_flow'
                                        ? 'bg-emerald-400 animate-pulse'
                                        : partner?.status === 'busy'
                                        ? 'bg-amber-400'
                                        : 'bg-sky-400'
                                    }`}
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                                        {conv.name}
                                      </span>
                                      {isNearby && (
                                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                                          Dekat
                                        </span>
                                      )}
                                    </div>
                                    {conv.lastMessageTime && (
                                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                        {conv.lastMessageTime}
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                    {conv.lastMessage || 'Klik untuk membuka percakapan...'}
                                  </div>
                                </div>
                              </div>

                              {conv.unreadCount > 0 && (
                                <span className="ml-2 w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Colleagues present in room or nearby who have no active chat yet */}
                    {eligibleColleaguesWithoutChat.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-1">
                          Rekan Siap Chat 1-on-1 ({currentRoomName})
                        </span>
                        {eligibleColleaguesWithoutChat.map((participant) => {
                          const { isNearby } = checkColleagueEligibility(participant.id, participant.name);
                          return (
                            <button
                              key={participant.id}
                              type="button"
                              onClick={() => handleStartDirectWith(participant.id)}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-800 border border-slate-800/80 hover:border-sky-500/40 transition-all text-left group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-sky-300 shrink-0">
                                  {participant.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                                      {participant.name}
                                    </span>
                                    {isNearby ? (
                                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                                        Dekat Anda
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px] font-medium">
                                        Satu Ruangan
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10.5px] text-slate-400 truncate">
                                    {participant.roleTitle}
                                  </div>
                                </div>
                              </div>

                              <span className="px-2 py-1 rounded-lg bg-sky-500/20 group-hover:bg-sky-500 text-sky-300 group-hover:text-slate-950 font-bold text-[10px] transition-colors shrink-0">
                                Chat
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        )}

        {/* TAB 3: GROUP CHAT */}
        {activeTab === 'group' && (
          selectedConversationId && activeConversation?.type === 'group' ? (
            <DirectChatView
              conversation={activeConversation}
              messages={activeMessages}
              allParticipants={participants}
              onBack={() => setSelectedConversationId(null)}
              onSendMessage={(text) => {
                void sendMessage(activeConversation.id, text);
                if (!mockChatStore.isLiveConversation(activeConversation.id)) onUserSentMessage?.(text);
              }}
              onAddMember={(memberId) => {
                addMemberToConversation(activeConversation.id, memberId);
              }}
              onSelectMemberProfile={onSelectMemberProfile}
            />
          ) : (
            <div className="flex flex-col h-full bg-slate-950/70 p-3 space-y-3">
              {/* Search & New Group button */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-700/80 focus-within:border-purple-500 transition-colors">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Cari grup diskusi..."
                    className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewDirectModalOpen(true)}
                  className="p-2 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500 hover:text-slate-950 border border-purple-400/40 transition-colors"
                  title="Buat Grup Baru"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Group List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 no-scrollbar">
                {filteredGroup.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                    <p>Belum ada grup obrolan yang dibuat.</p>
                    <button
                      type="button"
                      onClick={() => setIsNewDirectModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-purple-300 border border-slate-700 text-xs font-semibold hover:bg-slate-700 transition-colors"
                    >
                      Mulai Grup Baru
                    </button>
                  </div>
                ) : (
                  filteredGroup.map((conv) => (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => {
                        setSelectedConversationId(conv.id);
                        markAsRead(conv.id);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-left transition-all hover:border-slate-700 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                          <Users className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                              {conv.name}
                            </span>
                            {conv.lastMessageTime && (
                              <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                {conv.lastMessageTime}
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {conv.lastMessageSenderName && (
                              <span className="font-semibold text-slate-300">
                                {conv.lastMessageSenderName}:{' '}
                              </span>
                            )}
                            {conv.lastMessage || 'Grup siap digunakan...'}
                          </div>
                        </div>
                      </div>

                      {conv.unreadCount > 0 && (
                        <span className="ml-2 w-5 h-5 rounded-full bg-purple-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* Modal to pick a member to start direct / group chat */}
      <AddMemberModal
        isOpen={isNewDirectModalOpen}
        onClose={() => setIsNewDirectModalOpen(false)}
        availableParticipants={activeTab === 'direct' ? eligibleDirectParticipants : participants}
        existingParticipantIds={['local_player']}
        onAddMember={(participantId) => {
          if (activeTab === 'group') {
            handleCreateGroupWith(participantId);
          } else {
            handleStartDirectWith(participantId);
          }
        }}
      />
    </div>
  );
};
