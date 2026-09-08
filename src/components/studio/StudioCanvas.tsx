import React, { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';
import { StudioScene } from '@/studio/StudioScene';
import { StudioNetwork, DirectChatPokePayload } from '@/lib/studioNetwork';
import {
  InteractiveObjectDef,
  PlayerNetworkState,
  RoomDefinition,
  StudioRoomType,
  WorkstationMemberData,
} from '@/studio/types';
import { NearbyDiscussionCluster } from '@/studio/chat/mockChatTypes';
import { mockChatStore } from '@/studio/chat/mockChatStore';
import { Profile } from '@/types/database.types';

export interface StudioCanvasProps {
  projectId: string;
  userProfile: Profile;
  onRoomChange: (room: RoomDefinition) => void;
  onZoneChange?: (zoneName: string | null) => void;
  onObjectInteract: (object: InteractiveObjectDef) => void;
  onNearbyObjectChange?: (object: InteractiveObjectDef | null) => void;
  onNearbyMemberChange?: (member: WorkstationMemberData | null) => void;
  onNearbyMembersListChange?: (members: WorkstationMemberData[]) => void;
  selectedNearbyMember?: WorkstationMemberData | null;
  onMemberInspect?: (member: WorkstationMemberData) => void;
  onNearbyDiscussionChange?: (cluster: NearbyDiscussionCluster | null) => void;
  onPlayerClick: (player: PlayerNetworkState) => void;
  onPresenceUpdate: (members: PlayerNetworkState[]) => void;
  onWorkstationSit?: (workstation: InteractiveObjectDef) => void;
  onWorkstationLeave?: () => void;
  teleportRequest?: StudioRoomType | null;
  onTeleportComplete?: () => void;
  seatedWorkstationRequest?: InteractiveObjectDef | null;
  onSeatedWorkstationComplete?: () => void;
  chatMessageToSend?: string | null;
  onChatSent?: () => void;
  directChatPokeToSend?: { targetUserId: string; targetUserName: string } | null;
  onDirectChatPokeSent?: () => void;
  onIncomingDirectChatPoke?: (poke: DirectChatPokePayload) => void;
  isInputLocked?: boolean;
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  projectId,
  userProfile,
  onRoomChange,
  onZoneChange,
  onObjectInteract,
  onNearbyObjectChange,
  onNearbyMemberChange,
  onNearbyMembersListChange,
  selectedNearbyMember,
  onMemberInspect,
  onNearbyDiscussionChange,
  onPlayerClick,
  onPresenceUpdate,
  onWorkstationSit,
  onWorkstationLeave,
  teleportRequest,
  onTeleportComplete,
  seatedWorkstationRequest,
  onSeatedWorkstationComplete,
  chatMessageToSend,
  onChatSent,
  directChatPokeToSend,
  onDirectChatPokeSent,
  onIncomingDirectChatPoke,
  isInputLocked = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<StudioScene | null>(null);
  const networkRef = useRef<StudioNetwork | null>(null);
  const externalUiLockRef = useRef(false);
  const inputLockRef = useRef(isInputLocked);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    let ready = false;
    let disposed = false;
    setSceneReady(false);
    const scene = new StudioScene();
    sceneRef.current = scene;

    const stopLiveChat = mockChatStore.startLiveSession(userProfile, projectId);

    // 1. Initialize Realtime Studio Network Sync
    const initialPlayerState: PlayerNetworkState = {
      userId: userProfile.id,
      displayName: userProfile.display_name,
      username: userProfile.username,
      discipline: userProfile.discipline,
      avatarConfig: userProfile.avatar_config,
      x: 640,
      y: 650,
      vx: 0,
      vy: 0,
      direction: 'down',
      isMoving: false,
      currentRoom: 'Central Plaza & Lobby',
      lastUpdated: Date.now(),
    };

    const network = new StudioNetwork(projectId, initialPlayerState, {
      onRemotePlayerUpdate: (remoteState) => {
        if (disposed) return;
        mockChatStore.upsertLiveParticipant(remoteState);
        if (ready && !disposed) {
          scene.updateRemotePlayerState(remoteState);
        }
      },
      onRemotePlayerLeave: (remoteUserId) => {
        if (disposed) return;
        mockChatStore.markLiveOffline(remoteUserId);
        if (ready && !disposed) {
          scene.removeRemotePlayer(remoteUserId);
        }
      },
      onPresenceSync: (members) => {
        if (disposed) return;
        members.forEach(member => mockChatStore.upsertLiveParticipant(member));
        // Presence supplies the latest state for users who were already in
        // the room before this client subscribed. Render them immediately;
        // do not wait for their next movement broadcast.
        if (ready && !disposed) members.forEach((member) => scene.updateRemotePlayerState(member));
        onPresenceUpdate(members);
      },
      onDirectChatPoke: (poke) => {
        if (disposed) return;
        if (ready && !disposed) {
          scene.handleIncomingDirectChatPoke(poke);
        }
        onIncomingDirectChatPoke?.(poke);
      },
    });

    network.connect();
    networkRef.current = network;

    // Connect Mock Chat Colleague Speech Bubble trigger to Phaser Scene
    mockChatStore.setSpeechBubbleCallback((memberId: string, message: string) => {
      if (ready && !disposed) {
        scene.showColleagueSpeechBubble(memberId, message);
      }
    });

    // 2. Setup Phaser Game Configuration with reliable FIT mode (1280x720 base)
    const bridgeEvents = {
      onRoomChange,
      onZoneChange,
      onObjectInteract,
      onNearbyObjectChange,
      onNearbyMemberChange,
      onNearbyMembersListChange,
      onMemberInspect,
      onNearbyDiscussionChange,
      onPlayerClick,
      onWorkstationSit,
      onWorkstationLeave,
      onNetworkBroadcast: (state: PlayerNetworkState) => {
        network.sendMovement(state);
      },
      onPlayerChat: (message: string) => {
        network.sendChat(message);
      },
      onSceneReady: () => {
        if (disposed) return;
        ready = true;
        setSceneReady(true);
        scene.setInputLocked(externalUiLockRef.current || inputLockRef.current);
        // Scene has fully initialized! Immediately render all known remote players
        const knownMembers = network.getKnownMembers();
        knownMembers.forEach((member) => {
          scene.updateRemotePlayerState(member);
        });
        // The scene already published its actual spawn position before readiness.
      },
    };

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 1280,
      height: 720,
      backgroundColor: '#06090e',
      pixelArt: false,
      antialias: true,
      antialiasGL: true,
      roundPixels: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
          x: 0,
          y: 0,
          width: 1280,
          height: 880,
        },
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Start scene with userProfile and bridgeEvents immediately passed to init()
    // add() returns null while Phaser is booting; retain the explicit instance.
    game.scene.add('StudioScene', scene, true, { profile: userProfile, bridgeEvents });

    // This listener is intentionally attached next to the Phaser scene so a
    // product modal can stop canvas input immediately, before React effects
    // propagate a new isInputLocked prop.
    const handleExternalUiLock = (event: Event) => {
      externalUiLockRef.current = Boolean((event as CustomEvent<boolean>).detail);
      scene.setInputLocked(externalUiLockRef.current || inputLockRef.current);
    };
    window.addEventListener('studio-ui-input-lock', handleExternalUiLock);

    // Cleanup on unmount
    return () => {
      disposed = true;
      ready = false;
      mockChatStore.setSpeechBubbleCallback(() => {});
      window.removeEventListener('studio-ui-input-lock', handleExternalUiLock);
      network.disconnect();
      stopLiveChat();
      networkRef.current = null;
      sceneRef.current = null;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [projectId, userProfile.id]);

  // Handle Teleport request if needed
  useEffect(() => {
    if (sceneReady && teleportRequest && sceneRef.current) {
      sceneRef.current.teleportToRoom(teleportRequest);
      if (onTeleportComplete) onTeleportComplete();
    }
  }, [sceneReady, teleportRequest, onTeleportComplete]);

  // Handle Seated Workstation request
  useEffect(() => {
    if (sceneReady && seatedWorkstationRequest && sceneRef.current) {
      sceneRef.current.sitAtWorkstation(seatedWorkstationRequest);
      if (onSeatedWorkstationComplete) onSeatedWorkstationComplete();
    }
  }, [sceneReady, seatedWorkstationRequest, onSeatedWorkstationComplete]);

  // Handle Chat Message Request from UI (renders speech bubble at topmost depth 99999)
  useEffect(() => {
    if (sceneReady && chatMessageToSend && sceneRef.current) {
      sceneRef.current.showPlayerSpeechBubble(chatMessageToSend);
      if (onChatSent) onChatSent();
    }
  }, [sceneReady, chatMessageToSend, onChatSent]);

  // Handle Outgoing Direct Chat Poke to target player
  useEffect(() => {
    if (sceneReady && directChatPokeToSend && networkRef.current && sceneRef.current) {
      networkRef.current.sendDirectChatPoke(
        directChatPokeToSend.targetUserId,
        directChatPokeToSend.targetUserName
      );
      sceneRef.current.handleOutgoingDirectChatPoke(directChatPokeToSend.targetUserName);
      if (onDirectChatPokeSent) onDirectChatPokeSent();
    }
  }, [sceneReady, directChatPokeToSend, onDirectChatPokeSent]);

  // Handle Direct Selected Nearby Member update from UI (e.g. multi-player HUD target selector)
  useEffect(() => {
    if (sceneReady && sceneRef.current && selectedNearbyMember !== undefined) {
      sceneRef.current.setSelectedNearbyMember(selectedNearbyMember);
    }
  }, [sceneReady, selectedNearbyMember]);

  // Handle Input Lock (e.g., when workstation overlay or dialog is active)
  useEffect(() => {
    inputLockRef.current = Boolean(isInputLocked);
    if (sceneRef.current) {
      sceneRef.current.setInputLocked(externalUiLockRef.current || inputLockRef.current);
    }
  }, [isInputLocked]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#06090e]">
      <div ref={containerRef} className="w-full h-full absolute inset-0" />
    </div>
  );
};
