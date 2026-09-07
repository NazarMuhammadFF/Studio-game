import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { StudioCanvas } from './StudioCanvas';
import { ObjectInteractionModal } from './ObjectInteractionModal';
import { MemberInteractionModal } from './MemberInteractionModal';
import { WorkstationOverlay } from './WorkstationOverlay';
import { MemberContextualOverlay } from './MemberContextualOverlay';
import { MoodboardOverlay } from './MoodboardOverlay';
import { ArtReviewBoardOverlay } from './ArtReviewBoardOverlay';
import { ArtDirectorOverlay } from './ArtDirectorOverlay';
import { MechanicBoardOverlay } from './MechanicBoardOverlay';
import { LevelFlowBoardOverlay } from './LevelFlowBoardOverlay';
import { BalancingBoardOverlay } from './BalancingBoardOverlay';
import { LeadDesignerOverlay } from './LeadDesignerOverlay';
import { AudioDirectionBoardOverlay } from './AudioDirectionBoardOverlay';
import { LeadAudioOverlay } from './LeadAudioOverlay';
import { AudioListeningStationOverlay } from './AudioListeningStationOverlay';
import { MusicWorkstationOverlay } from './MusicWorkstationOverlay';
import { SfxWorkstationOverlay } from './SfxWorkstationOverlay';
import { PresentationScreenOverlay } from './PresentationScreenOverlay';
import { MeetingBoardOverlay } from './MeetingBoardOverlay';
import { ProjectSummaryBoardOverlay } from './ProjectSummaryBoardOverlay';
import { MeetingLeaderOverlay } from './MeetingLeaderOverlay';
import { StudioDirectoryOverlay } from './StudioDirectoryOverlay';
import { TeamPresenceBoardOverlay } from './TeamPresenceBoardOverlay';
import { AnnouncementBoardOverlay } from './AnnouncementBoardOverlay';
import { PlazaProjectStatusOverlay } from './PlazaProjectStatusOverlay';
import { StudioChatDrawer } from './chat/StudioChatDrawer';
import { NearbyDiscussionPrompt } from './chat/NearbyDiscussionPrompt';
import { useMockChat } from '@/studio/chat/mockChatStore';
import { NearbyDiscussionCluster } from '@/studio/chat/mockChatTypes';
import {
  InteractiveObjectDef,
  PlayerNetworkState,
  RoomDefinition,
  StudioRoomType,
  WorkstationMemberData,
} from '@/studio/types';
import { ROOMS } from '@/studio/StudioScene';
import {
  Gamepad2,
  Compass,
  Code,
  Palette,
  Coffee,
  Users,
  Volume2,
  MessageSquare,
} from 'lucide-react';

export const StudioView: React.FC = () => {
  const { profile } = useAuth();
  const { currentProject } = useWorkspace();

  const {
    totalUnreadCount,
    getOrCreateDirectConversation,
    createGroupConversation,
    getRoomConversation,
  } = useMockChat();

  const [currentRoom, setCurrentRoom] = useState<RoomDefinition>(ROOMS[0]);
  const [currentZone, setCurrentZone] = useState<string | null>(null);
  const [showRoomNotification, setShowRoomNotification] = useState<boolean>(true);
  const roomNotificationTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedObject, setSelectedObject] = useState<InteractiveObjectDef | null>(null);
  const [nearbyObject, setNearbyObject] = useState<InteractiveObjectDef | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerNetworkState | null>(null);
  const [selectedMember, setSelectedMember] = useState<WorkstationMemberData | null>(null);
  const [nearbyMember, setNearbyMember] = useState<WorkstationMemberData | null>(null);
  const [nearbyCluster, setNearbyCluster] = useState<NearbyDiscussionCluster | null>(null);
  const [onlineMembers, setOnlineMembers] = useState<PlayerNetworkState[]>([]);

  // Chat System State
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);
  const [activeChatConvId, setActiveChatConvId] = useState<string | null>(null);
  const [chatMessageToSend, setChatMessageToSend] = useState<string | null>(null);
  const [isExternalUiOpen, setIsExternalUiOpen] = useState(false);

  // Show room notification briefly (3.5s) when initially entering studio or switching rooms
  const handleRoomChange = React.useCallback((room: RoomDefinition) => {
    setCurrentRoom((prev) => {
      if (prev.id !== room.id) {
        setShowRoomNotification(true);
        if (roomNotificationTimerRef.current) {
          clearTimeout(roomNotificationTimerRef.current);
        }
        roomNotificationTimerRef.current = setTimeout(() => {
          setShowRoomNotification(false);
        }, 3500);
        return room;
      }
      return prev;
    });
  }, []);

  React.useEffect(() => {
    roomNotificationTimerRef.current = setTimeout(() => {
      setShowRoomNotification(false);
    }, 3500);
    return () => {
      if (roomNotificationTimerRef.current) {
        clearTimeout(roomNotificationTimerRef.current);
      }
    };
  }, []);

  // Workstation Seating State
  const [seatedWorkstation, setSeatedWorkstation] = useState<InteractiveObjectDef | null>(null);
  const [seatedWorkstationRequest, setSeatedWorkstationRequest] = useState<InteractiveObjectDef | null>(null);
  const [isSittingAtDesk, setIsSittingAtDesk] = useState<boolean>(false);

  // Lock gameplay input if any modal, overlay, or chat drawer input is active
  const isInputLocked = Boolean(
    selectedObject || selectedPlayer || selectedMember || isChatDrawerOpen || isExternalUiOpen
  );

  // Product-level modals such as Team are rendered above StudioView by AppShell.
  // Their open state must still disable Phaser interaction underneath them.
  React.useEffect(() => {
    const handleExternalUiLock = (event: Event) => {
      setIsExternalUiOpen((event as CustomEvent<boolean>).detail);
    };
    window.addEventListener('studio-ui-input-lock', handleExternalUiLock);
    return () => window.removeEventListener('studio-ui-input-lock', handleExternalUiLock);
  }, []);

  // Keyboard shortcut: Press Enter to toggle Chat Drawer, Esc to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isInputLocked && !selectedObject && !selectedPlayer && !selectedMember) {
        e.preventDefault();
        setIsChatDrawerOpen(true);
      } else if (e.key === 'Escape' && isChatDrawerOpen) {
        setIsChatDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInputLocked, isChatDrawerOpen, selectedObject, selectedPlayer, selectedMember]);

  const getRoomIcon = (type: StudioRoomType) => {
    switch (type) {
      case 'programming':
        return <Code className="w-3.5 h-3.5 text-blue-400" />;
      case 'art':
        return <Palette className="w-3.5 h-3.5 text-purple-400" />;
      case 'design':
        return <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'meeting':
        return <Users className="w-3.5 h-3.5 text-amber-400" />;
      case 'lounge':
        return <Coffee className="w-3.5 h-3.5 text-orange-400" />;
      case 'audio':
        return <Volume2 className="w-3.5 h-3.5 text-fuchsia-400" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  if (!profile || !currentProject) return null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#06090e]">
      {/* 1. Full Viewport Phaser Canvas */}
      <StudioCanvas
        projectId={currentProject.id}
        userProfile={profile}
        onRoomChange={handleRoomChange}
        onZoneChange={(zone) => setCurrentZone(zone)}
        onObjectInteract={(obj) => setSelectedObject(obj)}
        onNearbyObjectChange={(obj) => setNearbyObject(obj)}
        onNearbyMemberChange={(member) => setNearbyMember(member)}
        onMemberInspect={(member) => {
          const memberKey = member.assignedUserId || member.name;
          const directConv = getOrCreateDirectConversation(memberKey);
          setActiveChatConvId(directConv.id);
          setIsChatDrawerOpen(true);
        }}
        onNearbyDiscussionChange={(cluster) => setNearbyCluster(cluster)}
        onPlayerClick={(player) => setSelectedPlayer(player)}
        onPresenceUpdate={(members) => setOnlineMembers(members)}
        onWorkstationSit={(ws) => {
          setIsSittingAtDesk(true);
          setSeatedWorkstation(ws);
        }}
        onWorkstationLeave={() => {
          setIsSittingAtDesk(false);
          setSeatedWorkstation(null);
        }}
        seatedWorkstationRequest={seatedWorkstationRequest}
        onSeatedWorkstationComplete={() => setSeatedWorkstationRequest(null)}
        chatMessageToSend={chatMessageToSend}
        onChatSent={() => setChatMessageToSend(null)}
        isInputLocked={isInputLocked}
      />

      {/* 2. Banner Nama Ruangan di Pojok Layar: Muncul HANYA SESAAT ketika baru memasuki area ruangan */}
      {showRoomNotification && (
        <div className="absolute top-4 left-4 z-30 pointer-events-auto flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-3 duration-300 select-none">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/15 shadow-2xl text-studio-text">
            <span className="p-1.5 rounded-lg bg-white/10 border border-white/10 shadow-sm">
              {getRoomIcon(currentRoom.type)}
            </span>
            <div className="flex flex-col">
              <span className="text-[9.5px] font-bold tracking-wider text-studio-muted uppercase">
                Memasuki Area
              </span>
              <span className="text-xs font-bold tracking-wide text-white">
                {currentRoom.name}
              </span>
            </div>
          </div>

          {currentZone && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-studio-primary/25 backdrop-blur-md border border-studio-primary/40 text-studio-accent text-[11px] font-medium shadow animate-slide-in-left">
              <span className="w-1.5 h-1.5 rounded-full bg-studio-accent animate-pulse" />
              <span>Zone: {currentZone}</span>
            </div>
          )}
        </div>
      )}

      {/* 3. Lightweight Overlay: Seated Status Indicator (Top-Center) */}
      {isSittingAtDesk && seatedWorkstation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-950/90 backdrop-blur-md border border-blue-500/50 shadow-2xl text-white animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold">
            Using Workstation: <span className="text-sky-300">{seatedWorkstation.name}</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30">
            Press WASD or ESC to stand
          </span>
        </div>
      )}

      {/* 4. Lightweight Overlay: Online Presence Counter (Top-Right) */}
      <div className="absolute top-4 right-4 z-10 pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-studio-surface/85 backdrop-blur-md border border-white/10 shadow-lg text-xs font-mono text-studio-muted">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-studio-text font-semibold">{onlineMembers.length + 1}</span>
        <span>online</span>
      </div>

      {/* 5. Lightweight Overlay: Interaction Prompt (Bottom-Center) */}
      {!isSittingAtDesk && nearbyMember && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-600/90 backdrop-blur-md border border-emerald-400/50 shadow-2xl text-white animate-bounce select-none">
          <kbd className="px-2 py-0.5 text-xs font-mono font-bold bg-white text-emerald-900 rounded shadow">
            E
          </kbd>
          <span className="text-xs font-semibold">
            Chat dengan {nearbyMember.name} ({nearbyMember.roleTitle})
          </span>
        </div>
      )}

      {!isSittingAtDesk && !nearbyMember && nearbyObject && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-xl bg-blue-600/90 backdrop-blur-md border border-blue-400/50 shadow-2xl text-white animate-bounce select-none">
          <kbd className="px-2 py-0.5 text-xs font-mono font-bold bg-white text-blue-900 rounded shadow">
            E
          </kbd>
          <span className="text-xs font-semibold">
            Interact with {nearbyObject.name}
          </span>
        </div>
      )}

      {/* 6. Lightweight Overlay: Minimal Movement Hint (Bottom-Left) */}
      <div className="absolute bottom-3 left-4 z-10 pointer-events-none text-[10px] font-mono text-studio-muted/50 select-none">
        {isChatDrawerOpen
          ? 'Mode Chat Aktif • Kontrol avatar dinonaktifkan • Tekan ESC untuk menutup'
          : isSittingAtDesk
          ? 'Seated Mode • WASD / ESC to stand up'
          : 'WASD / Arrows to move • E to interact • Enter to chat'}
      </div>

      {/* 7. Nearby Discussion Trigger Bubble (Prompt saat mendekati kerumunan avatar) */}
      {nearbyCluster && !isChatDrawerOpen && (
        <NearbyDiscussionPrompt
          cluster={nearbyCluster}
          onJoin={(cluster) => {
            const newGroup = createGroupConversation(
              `Diskusi: ${cluster.topic}`,
              cluster.participantIds,
              `Anda bergabung ke obrolan terdekat: ${cluster.topic}`
            );
            setActiveChatConvId(newGroup.id);
            setIsChatDrawerOpen(true);
          }}
        />
      )}

      {/* 8. Sleek Chat Launcher Dock (Bottom-Right) */}
      <div className="absolute bottom-4 right-4 z-40 pointer-events-auto flex items-center gap-2 select-none">
        <button
          type="button"
          onClick={() => setIsChatDrawerOpen((prev) => !prev)}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl backdrop-blur-md border shadow-2xl transition-all duration-200 ${
            isChatDrawerOpen
              ? 'bg-sky-500/20 border-sky-400/60 text-sky-200 shadow-sky-950/40'
              : 'bg-slate-900/90 hover:bg-slate-800/95 border-white/15 text-slate-200 hover:text-white hover:scale-105'
          }`}
          title="Buka / Tutup Komunikasi Studio (Enter)"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-sky-400" />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[15px] h-[15px] px-1 text-[9px] font-bold text-white bg-rose-500 rounded-full border border-slate-900 animate-pulse">
                {totalUnreadCount}
              </span>
            )}
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span
              className="text-[11px] font-bold truncate max-w-[140px]"
              title={getRoomConversation(currentRoom.type).name}
            >
              {getRoomConversation(currentRoom.type).name}
            </span>
            <span className="text-[9px] text-slate-400 font-medium truncate max-w-[140px]">
              #{currentRoom.name}
            </span>
          </div>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-white/10 rounded border border-white/20 text-slate-300 ml-1">
            Enter
          </kbd>
        </button>
      </div>

      {/* 9. Comprehensive Studio Chat Drawer (Ruangan, Langsung, Grup) */}
      <StudioChatDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => {
          setIsChatDrawerOpen(false);
          setActiveChatConvId(null);
        }}
        currentRoomType={currentRoom.type}
        currentRoomName={currentRoom.name}
        nearbyMember={nearbyMember}
        initialConversationId={activeChatConvId}
        onSelectMemberProfile={(participant) => {
          setSelectedMember({
            name: participant.name,
            discipline: participant.discipline,
            roleTitle: participant.roleTitle,
            status: 'In Flow',
            currentGoal: participant.statusMessage || 'Aktif dalam pengembangan sprint studio saat ini.',
            currentTaskTitle: participant.statusMessage || 'Fitur Studio',
            progressPercentage: 85,
            assignedUserId: participant.id,
            isAssigned: true,
            isOnline: participant.status !== 'offline',
          });
        }}
        onUserSentMessage={(text) => {
          setChatMessageToSend(text);
        }}
      />

      {/* Modals & Overlays for World & Player Interaction */}
      {selectedMember && (
        <MemberContextualOverlay
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onStartChat={(member) => {
            const memberKey =
              'assignedUserId' in member && member.assignedUserId
                ? member.assignedUserId
                : 'name' in member
                ? member.name
                : member.displayName || 'colleague';
            const conv = getOrCreateDirectConversation(memberKey);
            setActiveChatConvId(conv.id);
            setIsChatDrawerOpen(true);
          }}
        />
      )}

      {selectedObject?.type === 'moodboard' ? (
        <MoodboardOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      ) : selectedObject?.type === 'art_review' ? (
        <ArtReviewBoardOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      ) : selectedObject?.type === 'art_director' ? (
        <ArtDirectorOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      ) : selectedObject?.type === 'mechanic_board' ? (
        <MechanicBoardOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      ) : selectedObject?.type === 'flow_board' ? (
        <LevelFlowBoardOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      ) : selectedObject?.type === 'balancing_board' ? (
        <BalancingBoardOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      ) : selectedObject?.type === 'lead_designer' ? (
        <LeadDesignerOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      ) : selectedObject?.type === 'audio_direction' ? (
        <AudioDirectionBoardOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      ) : selectedObject?.type === 'lead_audio' ? (
        <LeadAudioOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
          onSitAtWorkstation={(ws) => setSeatedWorkstationRequest(ws)}
        />
      ) : selectedObject?.type === 'audio_listening' ? (
        <AudioListeningStationOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      ) : selectedObject?.type === 'music_workstation' ? (
        <MusicWorkstationOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
          onSitAtWorkstation={(ws) => setSeatedWorkstationRequest(ws)}
        />
      ) : selectedObject?.type === 'sfx_workstation' ? (
        <SfxWorkstationOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
          onSitAtWorkstation={(ws) => setSeatedWorkstationRequest(ws)}
        />
      ) : selectedObject?.type === 'presentation_screen' ? (
        <PresentationScreenOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      ) : selectedObject?.type === 'meeting_board' ? (
        <MeetingBoardOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      ) : selectedObject?.type === 'project_summary_board' ? (
        <ProjectSummaryBoardOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      ) : selectedObject?.type === 'meeting_leader' ? (
        <MeetingLeaderOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      ) : selectedObject?.type === 'directory' || selectedObject?.type === 'studio_directory' ? (
        <StudioDirectoryOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      ) : selectedObject?.type === 'team_presence' ? (
        <TeamPresenceBoardOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      ) : selectedObject?.type === 'announcement_board' ? (
        <AnnouncementBoardOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      ) : selectedObject?.type === 'plaza_project_status' ? (
        <PlazaProjectStatusOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      ) : selectedObject?.workstationData ? (
        <WorkstationOverlay
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
          onSitAtWorkstation={(ws) => setSeatedWorkstationRequest(ws)}
        />
      ) : selectedObject ? (
        <ObjectInteractionModal
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      ) : null}

      <MemberInteractionModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        onStartChat={(player) => {
          setSelectedPlayer(null);
          const directConv = getOrCreateDirectConversation(player.userId);
          setActiveChatConvId(directConv.id);
          setIsChatDrawerOpen(true);
        }}
      />
    </div>
  );
};
