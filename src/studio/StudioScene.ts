import * as Phaser from 'phaser';
import { loadStudioAssets, STUDIO_ASSETS, applyAssetBody } from './assets/registry';
import { createAvatarTextures, AVATAR_SPEC } from './assets/characters/avatar';
import { getColleaguePalette } from './assets/characters/variants';
import { WORLD_WIDTH, WORLD_HEIGHT, DOORWAYS, ROOMS, INTERACTIVE_OBJECTS, SHARED_DECORATIONS } from './layout';
export { WORLD_WIDTH, WORLD_HEIGHT, DOORWAYS, ROOMS, INTERACTIVE_OBJECTS } from './layout';
import {
  InteractiveObjectDef,
  MeetingSeatData,
  PlayerNetworkState,
  RoomDefinition,
  StudioBridgeEvents,
  StudioRoomType,
  WorkstationMemberData,
} from './types';
import { Profile } from '@/types/database.types';
import { NearbyDiscussionCluster } from './chat/mockChatTypes';
import { NEARBY_DISCUSSIONS } from './chat/mockChatStore';
import { DirectChatPokePayload } from '@/lib/studioNetwork';

export interface RemotePlayerRecord {
  container: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Sprite;
  nameTag: Phaser.GameObjects.Container;
  nameBg: Phaser.GameObjects.Graphics;
  nameText: Phaser.GameObjects.Text;
  badgeText: Phaser.GameObjects.Text;
  infoText: Phaser.GameObjects.Text;
  state: PlayerNetworkState;
  sheetKey: string;
  targetX: number;
  targetY: number;
  currentDirection: 'up' | 'down' | 'left' | 'right';
  nametagTimer?: number;
  isExpanded?: boolean;
  lastChatMessage?: string;
  lastChatTimestamp?: number;
  pokeTimer?: number;
}

export interface ColleagueRecord {
  sprite: Phaser.GameObjects.Sprite;
  nameTag: Phaser.GameObjects.Container;
  nameBg: Phaser.GameObjects.Graphics;
  nameText: Phaser.GameObjects.Text;
  badgeText: Phaser.GameObjects.Text;
  infoText: Phaser.GameObjects.Text;
  data: WorkstationMemberData;
  x: number;
  y: number;
  nametagTimer?: number;
}

export const STUDIO_FONT = {
  family: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  resolution: 2,
};

export class StudioScene extends Phaser.Scene {
  private userProfile: Profile = {
    id: 'local_player',
    username: 'developer',
    display_name: 'Studio Developer',
    discipline: 'Programmer',
    avatar_config: { shirtColor: '#3b82f6', skinColor: '#f5d0b5', hairColor: '#2b1d0c' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  private bridgeEvents: StudioBridgeEvents = {};

  private assetLoadFailed = false;
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerPrefix: string = 'avatar_local_player';
  private playerNameTag!: Phaser.GameObjects.Container;
  private playerNameBg!: Phaser.GameObjects.Graphics;
  private playerNameText!: Phaser.GameObjects.Text;
  private playerBadgeText!: Phaser.GameObjects.Text;
  private playerInfoText!: Phaser.GameObjects.Text;
  private playerNametagTimer?: number;
  private wallsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private objectsGroup!: Phaser.Physics.Arcade.StaticGroup;

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
  };

  private currentRoom: RoomDefinition = ROOMS[0];
  private remotePlayers: Map<string, RemotePlayerRecord> = new Map();
  private nearbyObject: InteractiveObjectDef | null = null;
  private nearbyMember: WorkstationMemberData | null = null;
  private colleagues: ColleagueRecord[] = [];
  private currentSeatedWorkstation: InteractiveObjectDef | null = null;
  private meetingSeatSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private meetingSeatDataMap: Map<string, { seat: MeetingSeatData; table: InteractiveObjectDef }> = new Map();
  private currentSeatedMeetingSeat: MeetingSeatData | null = null;
  private nearbyMeetingSeat: { seat: MeetingSeatData; table: InteractiveObjectDef } | null = null;

  private interactHintContainer!: Phaser.GameObjects.Container;
  private interactHintText!: Phaser.GameObjects.Text;
  private interactPulseRing!: Phaser.GameObjects.Image;
  private playerDirection: 'up' | 'down' | 'left' | 'right' = 'down';
  private isInputLocked: boolean = false;
  private currentZone: string | null = null;
  private currentNearbyDiscussion: NearbyDiscussionCluster | null = null;
  private isDebugMode: boolean = false;
  private debugGraphics?: Phaser.GameObjects.Graphics;
  private debugTexts: Phaser.GameObjects.Text[] = [];

  // Topmost Context Bubble Chat System for Objects & Desks (depth: 99999)
  private activeContextBubbleTargetId: string | null = null;
  private contextBubbleContainer!: Phaser.GameObjects.Container;
  private contextBubbleBg!: Phaser.GameObjects.Graphics;
  private contextBubbleHeader!: Phaser.GameObjects.Text;
  private contextBubbleBody!: Phaser.GameObjects.Text;
  private contextBubbleTween?: Phaser.Tweens.Tween;

  constructor() {
    super({ key: 'StudioScene' });
  }

  public setInputLocked(locked: boolean) {
    this.isInputLocked = locked;
    if (this.input) {
      this.input.enabled = !locked;
    }
    if (locked) {
      if (this.player && this.player.body) {
        this.player.setVelocity(0, 0);
        this.player.play(`${this.playerPrefix}_idle_${this.playerDirection}`, true);
      }
      if (this.input && this.input.keyboard) {
        this.input.keyboard.resetKeys();
        this.input.keyboard.enabled = false;
      }
    } else {
      if (this.input && this.input.keyboard) {
        this.input.keyboard.resetKeys();
        this.input.keyboard.enabled = true;
      }
    }
  }

  public sitAtWorkstation(workstation: InteractiveObjectDef) {
    this.currentSeatedWorkstation = workstation;
    const seatX = workstation.x + (workstation.workstationData?.seatOffset?.x || 0);
    const seatY = workstation.y + (workstation.workstationData?.seatOffset?.y || 19);

    this.player.setPosition(seatX, seatY);
    this.player.setVelocity(0, 0);
    this.playerDirection = 'up';
    this.player.anims?.stop();
    this.player.setTexture(`${this.playerPrefix}_up_0`);

    if (this.bridgeEvents.onWorkstationSit) {
      this.bridgeEvents.onWorkstationSit(workstation);
    }
  }

  public leaveWorkstation() {
    if (!this.currentSeatedWorkstation) return;
    this.currentSeatedWorkstation = null;
    this.player.y += 14;

    if (this.bridgeEvents.onWorkstationLeave) {
      this.bridgeEvents.onWorkstationLeave();
    }
  }

  public sitAtMeetingSeat(seat: MeetingSeatData, table: InteractiveObjectDef) {
    if (seat.occupiedBy && seat.occupiedBy !== this.userProfile.id) {
      return; // prevent double-occupancy
    }

    this.currentSeatedMeetingSeat = seat;
    seat.occupiedBy = this.userProfile.id;
    seat.occupantName = this.userProfile.display_name;
    seat.occupantDiscipline = this.userProfile.discipline;

    // Update chair visual
    const sprite = this.meetingSeatSprites.get(seat.id);
    if (sprite) {
      sprite.setTexture(STUDIO_ASSETS.obj_meeting_chair_occupied.key);
    }

    this.player.setPosition(seat.x, seat.y);
    this.player.setVelocity(0, 0);
    this.playerDirection = seat.facing;
    this.player.anims?.stop();
    this.player.setTexture(`${this.playerPrefix}_${seat.facing}_0`);

    if (this.bridgeEvents.onWorkstationSit) {
      this.bridgeEvents.onWorkstationSit(table);
    }
  }

  public leaveMeetingSeat() {
    if (!this.currentSeatedMeetingSeat) return;
    const seat = this.currentSeatedMeetingSeat;
    seat.occupiedBy = null;
    seat.occupantName = undefined;
    seat.occupantDiscipline = undefined;

    const sprite = this.meetingSeatSprites.get(seat.id);
    if (sprite) {
      sprite.setTexture(STUDIO_ASSETS.obj_meeting_chair_free.key);
    }

    // Step away cleanly from chair based on facing direction
    if (seat.facing === 'down') this.player.y += 16;
    else if (seat.facing === 'up') this.player.y -= 16;
    else if (seat.facing === 'left') this.player.x -= 16;
    else if (seat.facing === 'right') this.player.x += 16;

    this.currentSeatedMeetingSeat = null;

    if (this.bridgeEvents.onWorkstationLeave) {
      this.bridgeEvents.onWorkstationLeave();
    }
  }

  public toggleDebugMode(): boolean {
    this.isDebugMode = !this.isDebugMode;
    if (this.isDebugMode) {
      this.renderDebugOverlay();
      const report = this.validateLayoutClearance();
      console.log('[Studio Layout Debug] Mode ENABLED. Automated Clearance Report:', report);
    } else {
      this.clearDebugOverlay();
      console.log('[Studio Layout Debug] Mode DISABLED.');
    }
    return this.isDebugMode;
  }

  public clearDebugOverlay() {
    if (this.debugGraphics) {
      this.debugGraphics.destroy();
      this.debugGraphics = undefined;
    }
    this.debugTexts.forEach((t) => t.destroy());
    this.debugTexts = [];
  }

  public validateLayoutClearance(): { valid: boolean; violations: string[] } {
    const violations: string[] = [];

    // 1. Verify all doorway clearance boxes against interactive objects and seats
    for (const door of DOORWAYS) {
      const bLeft = door.clearanceBox.x;
      const bRight = door.clearanceBox.x + door.clearanceBox.width;
      const bTop = door.clearanceBox.y;
      const bBottom = door.clearanceBox.y + door.clearanceBox.height;

      // Check objects
      for (const obj of INTERACTIVE_OBJECTS) {
        const oLeft = obj.x - obj.width / 2;
        const oRight = obj.x + obj.width / 2;
        const oTop = obj.y - obj.height / 2;
        const oBottom = obj.y + obj.height / 2;

        const overlaps =
          oLeft < bRight &&
          oRight > bLeft &&
          oTop < bBottom &&
          oBottom > bTop;

        if (overlaps) {
          violations.push(
            `Doorway [${door.name}] buffer clearance overlaps object [${obj.name}] at (${obj.x}, ${obj.y})`
          );
        }

        // Check meeting seats if present
        if (obj.meetingSeats) {
          for (const s of obj.meetingSeats) {
            if (s.x > bLeft && s.x < bRight && s.y > bTop && s.y < bBottom) {
              violations.push(
                `Doorway [${door.name}] buffer clearance overlaps meeting seat [${s.id}] at (${s.x}, ${s.y})`
              );
            }
          }
        }
      }

      // 2. Check that doorway opening allows at least 2 avatars (standardized >= 96px)
      const openingSpan = Math.max(door.width, door.height);
      if (openingSpan < 96) {
        violations.push(
          `Doorway [${door.name}] opening is ${openingSpan}px, less than standard 96px avatar double-clearance.`
        );
      }
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }

  public renderDebugOverlay() {
    this.clearDebugOverlay();

    const g = this.add.graphics();
    g.setDepth(99999);
    this.debugGraphics = g;

    // 1. Draw Room Zones
    ROOMS.forEach((room) => {
      g.lineStyle(2, 0x10b981, 0.75);
      g.strokeRect(room.x, room.y, room.width, room.height);
      const t = this.add
        .text(
          room.x + 8,
          room.y + room.height - 22,
          `[ROOM] ${room.name.toUpperCase()} (${room.width}x${room.height})`,
          {
            fontSize: '10px',
            fontFamily: STUDIO_FONT.family,
            fontStyle: '600',
            color: '#10b981',
            backgroundColor: '#052e16dd',
            padding: { x: 5, y: 3 },
            resolution: STUDIO_FONT.resolution,
          }
        )
        .setDepth(100000);
      this.debugTexts.push(t);
    });

    // 2. Draw Doorways and Clearance Boxes
    DOORWAYS.forEach((door) => {
      // Buffer Clearance Box in semi-transparent Orange
      g.fillStyle(0xf97316, 0.2);
      g.fillRect(door.clearanceBox.x, door.clearanceBox.y, door.clearanceBox.width, door.clearanceBox.height);
      g.lineStyle(2, 0xf97316, 0.9);
      g.strokeRect(door.clearanceBox.x, door.clearanceBox.y, door.clearanceBox.width, door.clearanceBox.height);

      // Doorway Opening in Yellow
      g.fillStyle(0xfacc15, 0.45);
      g.fillRect(door.x, door.y, door.width, door.height);
      g.lineStyle(2, 0xfacc15, 1.0);
      g.strokeRect(door.x, door.y, door.width, door.height);

      const t = this.add
        .text(
          door.clearanceBox.x + 4,
          door.clearanceBox.y + 4,
          `[CLEARANCE] ${door.name}`,
          {
            fontSize: '9px',
            fontFamily: STUDIO_FONT.family,
            fontStyle: '600',
            color: '#fdba74',
            backgroundColor: '#431407ee',
            padding: { x: 4, y: 2 },
            resolution: STUDIO_FONT.resolution,
          }
        )
        .setDepth(100000);
      this.debugTexts.push(t);
    });

    // 3. Draw Static Wall Colliders in Red
    g.lineStyle(1, 0xef4444, 0.65);
    this.wallsGroup.getChildren().forEach((child) => {
      const sprite = child as Phaser.Physics.Arcade.Sprite;
      const body = sprite.body as Phaser.Physics.Arcade.StaticBody;
      g.strokeRect(body.x, body.y, body.width, body.height);
    });

    this.objectsGroup.getChildren().forEach(child => {
      const body = (child as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.StaticBody;
      g.lineStyle(1, 0x34d399, 1);
      g.strokeRect(body.x, body.y, body.width, body.height);
    });

    // 4. Draw Interactive Objects & Interaction Radii
    INTERACTIVE_OBJECTS.forEach((obj) => {
      const halfW = obj.width / 2;
      const halfH = obj.height / 2;

      // Object Body Collider in Red/Orange
      g.lineStyle(1.5, 0xf87171, 0.9);
      g.strokeRect(obj.x - halfW, obj.y - halfH, obj.width, obj.height);

      // Object Interaction Trigger Radius in Cyan (65px)
      g.lineStyle(1, 0x06b6d4, 0.45);
      g.strokeCircle(obj.x, obj.y, 65);

      // Meeting Seats in Green/Teal (14px seat, 38px proximity trigger)
      if (obj.meetingSeats) {
        obj.meetingSeats.forEach((s) => {
          g.lineStyle(1.5, 0x22c55e, 0.85);
          g.strokeCircle(s.x, s.y, 14);
          g.lineStyle(1, 0x14b8a6, 0.35);
          g.strokeCircle(s.x, s.y, 38);
        });
      }
    });

    // 5. Spawn Points (Player & Colleagues)
    // Local Player Spawn: Central Plaza (640, 640)
    g.lineStyle(2, 0xd946ef, 1.0);
    g.strokeCircle(640, 640, 20);
    g.lineBetween(640 - 24, 640, 640 + 24, 640);
    g.lineBetween(640, 640 - 24, 640, 640 + 24);
    const spawnText = this.add
      .text(640 + 10, 640 + 10, 'SPAWN: LOCAL PLAYER (640, 640)', {
        fontSize: '10px',
        fontFamily: STUDIO_FONT.family,
        fontStyle: '600',
        color: '#f0abfc',
        backgroundColor: '#701a75dd',
        padding: { x: 5, y: 3 },
        resolution: STUDIO_FONT.resolution,
      })
      .setDepth(100000);
    this.debugTexts.push(spawnText);

    // Colleague Spawns in Violet
    this.colleagues.forEach((c) => {
      g.lineStyle(1.5, 0xa855f7, 0.85);
      g.strokeCircle(c.sprite.x, c.sprite.y, 16);
    });
  }

  public init(data?: { profile?: Profile; bridgeEvents?: StudioBridgeEvents }) {
    if (data?.profile) {
      this.userProfile = data.profile;
    }
    if (data?.bridgeEvents) {
      this.bridgeEvents = data.bridgeEvents;
    }
  }

  public preload() {
    this.assetLoadFailed = false;
    const label = this.add
      .text(640, 380, 'Loading studio assets…', {
        fontSize: '15px',
        fontFamily: STUDIO_FONT.family,
        fontStyle: '600',
        color: '#eee9da',
        resolution: STUDIO_FONT.resolution,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100001);
    // Cover stalled image decoding as well as failed network requests.
    const timeout = window.setTimeout(() => {
      if (!label.active) return;
      this.assetLoadFailed = true;
      label.setText('Studio assets timed out. Check your connection and reload to retry.');
    }, 15000);
    this.events.once('shutdown', () => window.clearTimeout(timeout));
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      if (!label.active) return;
      label.setText(`Studio asset could not load: ${file.key}. Reload to retry.`);
      label.setData('failed', true);
      this.assetLoadFailed = true;
    });
    this.load.once('complete', () => {
      window.clearTimeout(timeout);
      if (!label.active) return;
      // SVG decoding errors do not necessarily emit Phaser's network loaderror.
      const missing = Object.values(STUDIO_ASSETS).find(asset => !this.textures.exists(asset.key));
      if (missing) {
        this.assetLoadFailed = true;
        label.setText(`Studio asset could not load: ${missing.key}. Reload to retry.`);
      } else if (!this.assetLoadFailed) label.destroy();
    });
    loadStudioAssets(this);
  }

  public create() {
    if (this.assetLoadFailed) return;
    // 0. Ensure physics world boundaries match full studio dimensions (1280x880)
    // Prevents player world-bounds collider from blocking movement before reaching the bottom wall
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // 1. Build Studio World Map & Floor Surfaces
    this.createWorldMap();

    // 2. Setup Static Collision Physics Groups
    this.wallsGroup = this.physics.add.staticGroup();
    this.objectsGroup = this.physics.add.staticGroup();

    this.buildWalls();
    this.spawnInteractiveObjects();
    this.spawnPresentColleagues();

    // 3. Create Controllable Player Avatar with 4-direction animations
    this.createLocalPlayer();

    // 4. Input Configuration (WASD + Arrow Keys + 'E' interaction)
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
        E: Phaser.Input.Keyboard.KeyCodes.E,
      }) as any;

      this.input.keyboard.on('keydown-E', () => {
        if (this.isInputLocked || this.isProductModalOpen()) return;
        if (this.nearbyMeetingSeat) {
          if (!this.nearbyMeetingSeat.seat.occupiedBy) {
            this.sitAtMeetingSeat(this.nearbyMeetingSeat.seat, this.nearbyMeetingSeat.table);
          }
        } else if (this.nearbyMember && this.bridgeEvents.onMemberInspect) {
          this.triggerMemberInteraction(this.nearbyMember);
        } else if (this.nearbyObject && this.bridgeEvents.onObjectInteract) {
          this.triggerInteraction(this.nearbyObject);
        }
      });

      this.input.keyboard.on('keydown-ESC', () => {
        if (this.currentSeatedMeetingSeat) {
          this.leaveMeetingSeat();
        } else if (this.currentSeatedWorkstation) {
          this.leaveWorkstation();
        }
      });

      // Internal Developer-Only Layout Debug Toggle (F1 or ` / Backquote)
      this.input.keyboard.on('keydown-F1', (evt?: any) => {
        evt?.preventDefault?.();
        this.toggleDebugMode();
      });

      this.input.keyboard.on('keydown-BACKQUOTE', (evt?: any) => {
        evt?.preventDefault?.();
        this.toggleDebugMode();
      });
    }

    if (typeof window !== 'undefined') {
      (window as any).toggleStudioDebug = () => this.toggleDebugMode();
      (window as any).validateStudioClearance = () => this.validateLayoutClearance();
      (window as any).sendStudioChat = (msg: string) => this.showPlayerSpeechBubble(msg);
      console.log('[StudioScene] Initialized. Press F1 or ` to toggle Layout Debug mode (or run window.toggleStudioDebug())');
    }

    // 5. Interaction Hint & Proximity Indicator
    this.createInteractionHints();

    // 6. Topmost Bubble Chat System (depth: 99999)
    this.createBubbleChatSystem();

    // 7. Camera Follow System
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.15);
    this.cameras.main.setRoundPixels(true);

    // Initial broadcast
    this.emitNetworkUpdate(this.playerDirection, false);

    // Notify bridge that scene is fully mounted and ready to spawn remote players
    if (this.bridgeEvents.onSceneReady) {
      this.bridgeEvents.onSceneReady();
    }
  }

  private createWorldMap() {
    // 1. Deep Studio Base Floor: Tile entire world grid (0..WORLD_WIDTH, 0..WORLD_HEIGHT) with floor_corridor
    // This strictly eliminates any black voids across all rooms, corridors, and doorways studio-wide.
    this.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, STUDIO_ASSETS.floor_corridor.key).setOrigin(0).setDepth(-20);

    ROOMS.forEach((room) => {
      this.add.tileSprite(room.x, room.y, room.width, room.height, STUDIO_ASSETS[`floor_${room.type}`].key).setOrigin(0).setDepth(-19);

      // Department Floor Accent Trim
      const trim = this.add.graphics();
      trim.lineStyle(1.5, room.color, 0.85);
      trim.strokeRect(room.x + 2, room.y + 2, room.width - 4, room.height - 4);
    });

    // 3. Visual Zone Inlay Rugs
    // Game Design Room - West Mechanics & Flow Gallery Rug
    const designGalleryRug = this.add.graphics();
    designGalleryRug.fillStyle(0x718774, 0.65);
    designGalleryRug.lineStyle(1, 0xe0d4b8, 0.45);
    designGalleryRug.fillRoundedRect(55, 465, 75, 150, 8);
    designGalleryRug.strokeRoundedRect(55, 465, 75, 150, 8);

    // Game Design Room - Workstation Pod Inlay Rug
    const designPodRug = this.add.graphics();
    designPodRug.fillStyle(0x718774, 0.65);
    designPodRug.lineStyle(1, 0xe0d4b8, 0.45);
    designPodRug.fillRoundedRect(160, 570, 185, 155, 8);
    designPodRug.strokeRoundedRect(160, 570, 185, 155, 8);

    // Game Design Room - Discussion & Critique Lounge Rug
    const designLoungeRug = this.add.graphics();
    designLoungeRug.fillStyle(0x718774, 0.7);
    designLoungeRug.lineStyle(1, 0xe0d4b8, 0.45);
    designLoungeRug.fillRoundedRect(110, 755, 90, 60, 8);
    designLoungeRug.strokeRoundedRect(110, 755, 90, 60, 8);

    // Game Design Room - Playtest Arcade Floor Mat
    const designArcadeRug = this.add.graphics();
    designArcadeRug.fillStyle(0x718774, 0.75);
    designArcadeRug.lineStyle(1, 0xe0d4b8, 0.45);
    designArcadeRug.fillRoundedRect(322, 750, 48, 72, 4);
    designArcadeRug.strokeRoundedRect(322, 750, 48, 72, 4);

    // Programming Room - Tech Workstation Inlay
    const progRug = this.add.graphics();
    progRug.fillStyle(0x6c8687, 0.65);
    progRug.lineStyle(1, 0xe0d4b8, 0.45);
    progRug.fillRoundedRect(75, 75, 235, 195, 8);
    progRug.strokeRoundedRect(75, 75, 235, 195, 8);

    // Art Room - Creative Studio Inlay
    const artRug = this.add.graphics();
    artRug.fillStyle(0x9e8988, 0.65);
    artRug.lineStyle(1, 0xe0d4b8, 0.45);
    artRug.fillRoundedRect(955, 110, 255, 165, 8);
    artRug.strokeRoundedRect(955, 110, 255, 165, 8);

    // Art Room - Critique & Review Lounge Rug
    const artLoungeRug = this.add.graphics();
    artLoungeRug.fillStyle(0x8d849b, 0.7);
    artLoungeRug.lineStyle(1, 0xe0d4b8, 0.45);
    artLoungeRug.fillRoundedRect(885, 320, 70, 60, 8);
    artLoungeRug.strokeRoundedRect(885, 320, 70, 60, 8);

    // Audio & Sound Studio - Dedicated Acoustic Listening Console Rug
    const audioListeningRug = this.add.graphics();
    audioListeningRug.fillStyle(0x8d849b, 0.75);
    audioListeningRug.lineStyle(1, 0xe0d4b8, 0.45);
    audioListeningRug.fillRoundedRect(1135, 465, 80, 65, 8);
    audioListeningRug.strokeRoundedRect(1135, 465, 80, 65, 8);

    // Audio & Sound Studio - Acoustic Workstation Pod Rug
    const audioPodRug = this.add.graphics();
    audioPodRug.fillStyle(0x8d849b, 0.65);
    audioPodRug.lineStyle(1, 0xe0d4b8, 0.45);
    audioPodRug.fillRoundedRect(935, 570, 200, 155, 8);
    audioPodRug.strokeRoundedRect(935, 570, 200, 155, 8);

    // Audio Room - Discussion & Listening Lounge Rug
    const audioLoungeRug = this.add.graphics();
    audioLoungeRug.fillStyle(0x8d849b, 0.7);
    audioLoungeRug.lineStyle(1, 0xe0d4b8, 0.45);
    audioLoungeRug.fillRoundedRect(940, 755, 90, 60, 8);
    audioLoungeRug.strokeRoundedRect(940, 755, 90, 60, 8);

    // Audio Room - Surround Sound Speaker Area Accent
    const audioSurroundRug = this.add.graphics();
    audioSurroundRug.fillStyle(0x8d849b, 0.75);
    audioSurroundRug.lineStyle(1, 0xe0d4b8, 0.45);
    audioSurroundRug.fillRoundedRect(1175, 750, 48, 72, 4);
    audioSurroundRug.strokeRoundedRect(1175, 750, 48, 72, 4);

    // Meeting Room - Large Central Conference Table Inlay Rug (Amber / Warm Walnut)
    const meetingTableRug = this.add.graphics();
    meetingTableRug.fillStyle(0x8a7f69, 0.75);
    meetingTableRug.lineStyle(1, 0xe0d4b8, 0.45);
    meetingTableRug.fillRoundedRect(535, 165, 210, 140, 12);
    meetingTableRug.strokeRoundedRect(535, 165, 210, 140, 12);

    // Meeting Room - Presentation Display & Podium Stage Rug
    const meetingStageRug = this.add.graphics();
    meetingStageRug.fillStyle(0x8a7f69, 0.8);
    meetingStageRug.lineStyle(1, 0xe0d4b8, 0.45);
    meetingStageRug.fillRoundedRect(480, 48, 320, 54, 6);
    meetingStageRug.strokeRoundedRect(480, 48, 320, 54, 6);

    // Meeting Room - Discussion & Pre-Meeting Lounge Rug
    const meetingLoungeRug = this.add.graphics();
    meetingLoungeRug.fillStyle(0x8a7f69, 0.7);
    meetingLoungeRug.lineStyle(1, 0xe0d4b8, 0.45);
    meetingLoungeRug.fillRoundedRect(465, 340, 100, 52, 8);
    meetingLoungeRug.strokeRoundedRect(465, 340, 100, 52, 8);

    // Meeting Room - Refreshment Cart Rug
    const meetingCoffeeRug = this.add.graphics();
    meetingCoffeeRug.fillStyle(0x8a7f69, 0.75);
    meetingCoffeeRug.lineStyle(1, 0xe0d4b8, 0.45);
    meetingCoffeeRug.fillRoundedRect(755, 340, 60, 52, 8);
    meetingCoffeeRug.strokeRoundedRect(755, 340, 60, 52, 8);

    // Central Plaza - Social Gathering Zones Rugs
    // 1. Information Kiosk Rug (North-West)
    const plazaInfoRug = this.add.graphics();
    plazaInfoRug.fillStyle(0x708b86, 0.75);
    plazaInfoRug.lineStyle(1, 0xe0d4b8, 0.45);
    plazaInfoRug.fillRoundedRect(470, 465, 80, 115, 8);
    plazaInfoRug.strokeRoundedRect(470, 465, 80, 115, 8);

    // 2. Announcement & Presence Kiosk Rug (North-East)
    const plazaNoticeRug = this.add.graphics();
    plazaNoticeRug.fillStyle(0x708b86, 0.75);
    plazaNoticeRug.lineStyle(1, 0xe0d4b8, 0.45);
    plazaNoticeRug.fillRoundedRect(740, 465, 80, 115, 8);
    plazaNoticeRug.strokeRoundedRect(740, 465, 80, 115, 8);

    // 3. Casual Coffee & Conversation Corner Rug (South-West)
    const plazaCoffeeRug = this.add.graphics();
    plazaCoffeeRug.fillStyle(0x8a7f69, 0.75);
    plazaCoffeeRug.lineStyle(1, 0xe0d4b8, 0.45);
    plazaCoffeeRug.fillRoundedRect(465, 735, 80, 65, 8);
    plazaCoffeeRug.strokeRoundedRect(465, 735, 80, 65, 8);

    // 4. Central Plaza Lounge Rug (South-East)
    const plazaCentralLoungeRug = this.add.graphics();
    plazaCentralLoungeRug.fillStyle(0x708b86, 0.75);
    plazaCentralLoungeRug.lineStyle(1, 0xe0d4b8, 0.45);
    plazaCentralLoungeRug.fillRoundedRect(710, 735, 85, 85, 8);
    plazaCentralLoungeRug.strokeRoundedRect(710, 735, 85, 85, 8);

    // 5. Central Plaza Crossroads Wayfinding Guidance Lines
    const guideLines = this.add.graphics();
    guideLines.lineStyle(2, 0x596f68, 0.3);
    // Line to Meeting Room portal (North)
    guideLines.lineBetween(640, 640, 640, 424);
    // Line to Design Room doorway (West)
    guideLines.lineBetween(640, 640, 416, 656);
    // Line to Audio Room doorway (East)
    guideLines.lineBetween(640, 640, 832, 656);
    // Line to Future QA Room corridor (South)
    guideLines.lineBetween(640, 640, 640, 832);

    // Center Plaza Circular Emblem
    const crest = this.add.graphics();
    crest.lineStyle(2, 0x38bdf8, 0.6);
    crest.strokeCircle(640, 640, 44);
    crest.lineStyle(1, 0x60a5fa, 0.4);
    crest.strokeCircle(640, 640, 52);
  }

  private buildWalls() {
    const addWallSegment = (x: number, y: number, w: number, h: number) => {
      for (let px = x; px < x + w; px += 32) {
        for (let py = y; py < y + h; py += 32) {
          const wall = this.wallsGroup.create(px + 16, py + 16, STUDIO_ASSETS.wall_block.key);
          const width = Math.min(32, x + w - px);
          const height = Math.min(32, y + h - py);
          wall.setPosition(px + width / 2, py + height / 2);
          wall.setDisplaySize(width, height);
          wall.setDepth(py + height);
          wall.refreshBody();
        }
      }
    };

    // 1. Outer Perimeter Walls (solid 32px thick)
    addWallSegment(0, 0, WORLD_WIDTH, 32); // Top
    addWallSegment(0, WORLD_HEIGHT - 32, WORLD_WIDTH, 32); // Bottom
    addWallSegment(0, 32, 32, WORLD_HEIGHT - 64); // Left
    addWallSegment(WORLD_WIDTH - 32, 32, 32, WORLD_HEIGHT - 64); // Right

    // Nonblocking door thresholds and frames are driven by the same doorway data.
    DOORWAYS.forEach(door => {
      this.add.tileSprite(door.x, door.y, door.width, door.height, STUDIO_ASSETS.env_door_threshold.key).setOrigin(0).setDepth(-10);
      const frame = this.add.image(door.x + door.width / 2, door.y + door.height / 2, STUDIO_ASSETS.env_door_frame.key);
      frame.setDisplaySize(door.width, door.height).setDepth(-9);
      if (door.height > door.width) frame.setAngle(90).setDisplaySize(door.height, door.width);
    });
    [160, 640, 1100].forEach(x => this.add.image(x, 16, STUDIO_ASSETS.env_window.key).setDepth(33));

    // 2. Interior Dividing Walls with Standardized 96px/128px Clear Doorways
    // West Divider (Between West Rooms & Plaza at x: 416)
    addWallSegment(416, 32, 32, 160); // Above Programming Door (y: 32..192)
    // Doorway to Programming (y: 192..288, 96px clear opening)
    addWallSegment(416, 288, 32, 136); // Mid divider (y: 288..424)
    // Horizontal divider junction at y: 424..456
    addWallSegment(416, 424, 32, 32);
    addWallSegment(416, 456, 32, 152); // Mid-lower divider (y: 456..608)
    // Doorway to Design (y: 608..704, 96px clear opening)
    addWallSegment(416, 704, 32, 144); // Lower divider (y: 704..848)

    // East Divider (Between East Rooms & Plaza at x: 832)
    addWallSegment(832, 32, 32, 160); // Above Art Door (y: 32..192)
    // Doorway to Art (y: 192..288, 96px clear opening)
    addWallSegment(832, 288, 32, 136); // Mid divider (y: 288..424)
    // Horizontal divider junction at y: 424..456
    addWallSegment(832, 424, 32, 32);
    addWallSegment(832, 456, 32, 152); // Mid-lower divider (y: 456..608)
    // Doorway to Audio (y: 608..704, 96px clear opening)
    addWallSegment(832, 704, 32, 144); // Lower divider (y: 704..848)

    // Horizontal Divider between Programming & Design (y: 424..456) with 96px Concourse Doorway
    addWallSegment(32, 424, 128, 32); // Left of door (x: 32..160)
    // Doorway between Code Lab & Design Bay (x: 160..256, 96px clear opening)
    addWallSegment(256, 424, 160, 32); // Right of door (x: 256..416)

    // Horizontal Divider between Meeting Room & Central Plaza (y: 424..456) with 128px Grand Portal
    addWallSegment(448, 424, 128, 32); // Left of meeting room door (x: 448..576)
    // Grand Central Portal to Meeting Room (x: 576..704, 128px clear opening centered at 640)
    addWallSegment(704, 424, 128, 32); // Right of meeting room door (x: 704..832)

    // Horizontal Divider between Art & Audio (y: 424..456) with 96px Concourse Doorway
    addWallSegment(864, 424, 160, 32); // Left of door (x: 864..1024)
    // Doorway between Art Studio & Audio Studio (x: 1024..1120, 96px clear opening)
    addWallSegment(1120, 424, 128, 32); // Right of door (x: 1120..1248)
  }

  private spawnInteractiveObjects() {
    INTERACTIVE_OBJECTS.forEach((objDef) => {
      const asset = STUDIO_ASSETS[objDef.assetKey];
      const textureKey = asset.key;

      const obj = this.objectsGroup.create(objDef.x, objDef.y, textureKey);
      obj.setOrigin(asset.origin.x, asset.origin.y);
      obj.setData('objectDef', objDef);
      obj.setInteractive({ cursor: 'pointer' });

      // Y-sorting depth
      obj.setDepth(objDef.y + asset.depthOffset);

      // Direct click interaction
      obj.on('pointerdown', () => {
        this.triggerInteraction(objDef);
      });

      applyAssetBody(obj, asset);

      // Spawn Meeting Table Chairs if defined
      if (objDef.meetingSeats && objDef.meetingSeats.length > 0) {
        objDef.meetingSeats.forEach((seat) => {
          const chairKey = STUDIO_ASSETS[seat.occupiedBy ? 'obj_meeting_chair_occupied' : 'obj_meeting_chair_free'].key;
          const chair = this.add.sprite(seat.x, seat.y, chairKey);
          chair.setOrigin(0.5, 0.5);

          // Depth: Top seats behind table, bottom seats in front of table
          const chairDepth = seat.y + 9;
          chair.setDepth(chairDepth);
          chair.setInteractive({ cursor: 'pointer' });

          chair.on('pointerdown', () => {
            if (!seat.occupiedBy) {
              this.sitAtMeetingSeat(seat, objDef);
            }
          });

          this.meetingSeatSprites.set(seat.id, chair);
          this.meetingSeatDataMap.set(seat.id, { seat, table: objDef });

          // Subtle nametag if occupied by colleague
          if (seat.occupiedBy && seat.occupantName) {
            const occupantTag = this.add.container(seat.x, seat.y - 18);
            occupantTag.setDepth(chairDepth + 2);

            const txt = this.add
              .text(0, 0, seat.occupantName, {
                fontSize: '9px',
                fontFamily: STUDIO_FONT.family,
                fontStyle: 'bold',
                color: '#fef08a',
                resolution: STUDIO_FONT.resolution,
              })
              .setOrigin(0.5, 0.5);

            const tagBg = this.add.graphics();
            tagBg.fillStyle(0x0a101d, 0.9);
            tagBg.lineStyle(1, 0xd97706, 0.7);
            tagBg.fillRoundedRect(-txt.width / 2 - 6, -9, txt.width + 12, 18, 4);
            tagBg.strokeRoundedRect(-txt.width / 2 - 6, -9, txt.width + 12, 18, 4);

            occupantTag.add([tagBg, txt]);
          }
        });
      }

      // Subtle permanent nameplate for assigned / available workstations
      if (objDef.workstationData && !objDef.workstationData.isPresentInRoom) {
        const ws = objDef.workstationData;
        const plateY = objDef.y - objDef.height / 2 - 8;
        const plate = this.add.container(objDef.x, plateY);
        plate.setDepth(objDef.y + 1);

        let statusDotColor = 0x38bdf8;
        let plateText = 'AVAILABLE';
        let strokeColor = 0x38bdf8;

        if (objDef.workstationStatus === 'available') {
          plateText = 'AVAILABLE';
          statusDotColor = 0x38bdf8;
          strokeColor = 0x38bdf8;
        } else if (objDef.workstationStatus === 'assigned_offline') {
          plateText = `${ws.name} [OFF]`;
          statusDotColor = 0xf59e0b;
          strokeColor = 0xf59e0b;
        } else {
          plateText = ws.name;
          statusDotColor = 0x10b981;
          strokeColor = 0x10b981;
        }

        const txt = this.add
          .text(0, 0, plateText, {
            fontSize: '9.5px',
            fontFamily: STUDIO_FONT.family,
            fontStyle: 'bold',
            color: '#f8fafc',
            resolution: STUDIO_FONT.resolution,
          })
          .setOrigin(0, 0.5);

        const plateW = txt.width + 20;
        const plateBg = this.add.graphics();
        plateBg.fillStyle(0x0a101d, 0.9);
        plateBg.lineStyle(1, strokeColor, 0.55);
        plateBg.fillRoundedRect(-plateW / 2, -9, plateW, 18, 4);
        plateBg.strokeRoundedRect(-plateW / 2, -9, plateW, 18, 4);

        txt.setX(-plateW / 2 + 14);

        const dot = this.add.graphics();
        dot.fillStyle(statusDotColor, 1);
        dot.fillCircle(-plateW / 2 + 7, 0, 3);

        plate.add([plateBg, dot, txt]);
      }

      // Small floating hover badge on pointerover
      const hoverBadge = this.add
        .text(objDef.x, objDef.y - objDef.height / 2 - 8, objDef.name, {
          fontSize: '10px',
          fontFamily: STUDIO_FONT.family,
          fontStyle: '600',
          color: '#38bdf8',
          backgroundColor: '#0a101df0',
          padding: { x: 6, y: 3 },
          resolution: STUDIO_FONT.resolution,
        })
        .setOrigin(0.5, 1)
        .setAlpha(0)
        .setDepth(2000);

      obj.on('pointerover', () => hoverBadge.setAlpha(1));
      obj.on('pointerout', () => hoverBadge.setAlpha(0));
    });

    // Ergonomic chairs for Programming Room, Art Room, Design Room, and Audio Studio workstations
    const workstationChairs = [
      // Programming Room
      { x: 130, y: 125 }, // Alex Rivera
      { x: 240, y: 125 }, // Maya Chen
      { x: 130, y: 240 }, // Liam Vance
      { x: 240, y: 240 }, // Flex Coding Hotdesk
      // Art Room
      { x: 1010, y: 160 }, // Kenji Sato
      { x: 1140, y: 160 }, // Clara Oswald
      { x: 1010, y: 260 }, // Marcus Vance
      { x: 1140, y: 260 }, // Flex Art Desk
      { x: 1195, y: 95 }, // Elena Rostova (Art Director)
      // Design Room - 4 Pod Chairs, Discussion Table Chairs, and Arcade Stool
      { x: 210, y: 620 }, // Maya Lin (Lead Systems)
      { x: 300, y: 620 }, // Lucas Zhao (Narrative/Level)
      { x: 210, y: 715 }, // Sarah Jenkins (Economy)
      { x: 300, y: 715 }, // Flex Design Hotdesk
      { x: 120, y: 785 }, // Discussion Table Left
      { x: 180, y: 785 }, // Discussion Table Right
      { x: 345, y: 808 }, // Playtest Arcade Stool
      // Audio & Sound Studio - 4 Workstation Chairs, Listening Chair & Lounge Chairs
      { x: 980, y: 625 }, // Julian Vance (Audio Director)
      { x: 1090, y: 625 }, // Elena Rostova (Composer)
      { x: 980, y: 715 }, // Taro Tanaka (SFX & Foley)
      { x: 1090, y: 715 }, // Flex Audio Hotdesk
      { x: 1175, y: 520 }, // Listening Console Reference Chair
      { x: 950, y: 785 }, // Audio Discussion Table Left
      { x: 1010, y: 785 }, // Audio Discussion Table Right
    ];

    workstationChairs.forEach((c) => {
      const chair = this.add.image(c.x, c.y, STUDIO_ASSETS.obj_chair.key);
      chair.setOrigin(0.5, 0.5);
      chair.setDepth(c.y);
    });

    SHARED_DECORATIONS.forEach(item => {
      const sprite = this.objectsGroup.create(item.x, item.y, STUDIO_ASSETS[item.assetKey].key);
      applyAssetBody(sprite, STUDIO_ASSETS[item.assetKey]);
    });

    // Potted plants and greenery for studio life
    const plantCoords = [
      // Central Plaza Pillars / Greenery
      { x: 470, y: 310 },
      { x: 810, y: 310 },
      { x: 470, y: 810 },
      { x: 810, y: 810 },
      // Studio Perimeter Corners
      { x: 55, y: 55 },
      { x: 1225, y: 55 },
      { x: 55, y: 825 },
      { x: 1225, y: 825 },
      // Lounge Corners
      { x: 470, y: 55 },
      { x: 810, y: 55 },
      // Game Design Bay Greenery
      { x: 55, y: 480 },
      { x: 385, y: 820 },
      // Audio Studio Greenery
      { x: 890, y: 480 },
      { x: 1220, y: 820 },
    ];

    plantCoords.forEach((p) => {
      const plant = this.objectsGroup.create(p.x, p.y, STUDIO_ASSETS.obj_plant.key);
      applyAssetBody(plant, STUDIO_ASSETS.obj_plant);
    });
  }

  private spawnPresentColleagues() {
    this.colleagues.forEach((c) => {
      c.sprite.destroy();
      c.nameTag.destroy();
    });
    this.colleagues = [];

    INTERACTIVE_OBJECTS.forEach((objDef) => {
      if (objDef.workstationData && objDef.workstationData.isPresentInRoom) {
        const ws = objDef.workstationData;
        const seatX = objDef.x + (ws.seatOffset?.x || 0);
        const seatY = objDef.y + (ws.seatOffset?.y || 19);

        const { shirtColor, skinColor, hairColor } = getColleaguePalette(ws.name);

        const prefix = createAvatarTextures(
          this,
          ws.assignedUserId || `colleague_${ws.name.replace(/\s+/g, '_')}`,
          shirtColor,
          skinColor,
          hairColor
        );

        // Seated sprite facing up towards monitor
        const sprite = this.add.sprite(seatX, seatY, `${prefix}_up_0`).setOrigin(0.5, 0.7);
        sprite.setDepth(seatY + 5);

        // Small floating colleague nameplate
        const nameTag = this.add.container(seatX, seatY - 26);
        const nameBg = this.add.graphics();

        const nameText = this.add
          .text(0, -6, ws.name, {
            fontSize: '11px',
            fontFamily: STUDIO_FONT.family,
            fontStyle: 'bold',
            color: '#f8fafc',
            resolution: STUDIO_FONT.resolution,
          })
          .setOrigin(0.5, 0.5);

        const badgeText = this.add
          .text(0, 0, '', {
            fontSize: '8.5px',
            fontFamily: STUDIO_FONT.family,
            fontStyle: 'bold',
            color: '#34d399',
            resolution: STUDIO_FONT.resolution,
          })
          .setOrigin(0.5, 0)
          .setVisible(false);

        const infoText = this.add
          .text(0, 0, '', {
            fontSize: '10.5px',
            fontFamily: STUDIO_FONT.family,
            fontStyle: '500',
            color: '#e2e8f0',
            wordWrap: { width: 190, useAdvancedWrap: true },
            resolution: STUDIO_FONT.resolution,
          })
          .setOrigin(0, 0)
          .setVisible(false);

        nameTag.add([nameBg, nameText, badgeText, infoText]);
        nameTag.setDepth(seatY + 25);

        const colleagueRecord: ColleagueRecord = {
          sprite,
          nameTag,
          nameBg,
          nameText,
          badgeText,
          infoText,
          data: ws,
          x: seatX,
          y: seatY,
        };

        this.colleagues.push(colleagueRecord);
        this.collapseColleagueNametag(colleagueRecord);
      }
    });
  }

  private triggerMemberInteraction(member: WorkstationMemberData) {
    this.tweens.add({
      targets: this.interactHintContainer,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 100,
      yoyo: true,
    });

    if (this.bridgeEvents.onMemberInspect) {
      this.bridgeEvents.onMemberInspect(member);
    }
  }

  private createLocalPlayer() {
    const shirtColor = this.userProfile.avatar_config?.shirtColor || '#3b82f6';
    const skinColor = this.userProfile.avatar_config?.skinColor || '#f5d0b5';
    const hairColor = this.userProfile.avatar_config?.hairColor || '#2b1d0c';

    this.playerPrefix = createAvatarTextures(
      this,
      this.userProfile.id || 'local_player',
      shirtColor,
      skinColor,
      hairColor
    );

    // Spawn player in the central lobby plaza
    this.player = this.physics.add.sprite(640, 620, `${this.playerPrefix}_down_0`);
    this.player.setOrigin(AVATAR_SPEC.origin.x, AVATAR_SPEC.origin.y);
    this.player.setCollideWorldBounds(true);

    // Collision box tuned to feet for natural top-down 2.5D overlap
    this.player.setSize(AVATAR_SPEC.collision.width, AVATAR_SPEC.collision.height);
    this.player.setOffset(AVATAR_SPEC.collision.x, AVATAR_SPEC.collision.y);

    // Collide with walls & furniture
    this.physics.add.collider(this.player, this.wallsGroup);
    this.physics.add.collider(this.player, this.objectsGroup);

    // Floating Nameplate (Expanding Nametag)
    this.playerNameTag = this.add.container(640, 585);

    this.playerNameBg = this.add.graphics();

    this.playerNameText = this.add
      .text(0, -6, this.userProfile.display_name || 'Player', {
        fontSize: '11.5px',
        fontFamily: STUDIO_FONT.family,
        fontStyle: 'bold',
        color: '#ffffff',
        resolution: STUDIO_FONT.resolution,
      })
      .setOrigin(0.5, 0.5);

    this.playerBadgeText = this.add
      .text(0, 0, '', {
        fontSize: '9px',
        fontFamily: STUDIO_FONT.family,
        fontStyle: 'bold',
        color: '#60a5fa',
        resolution: STUDIO_FONT.resolution,
      })
      .setOrigin(0.5, 0)
      .setVisible(false);

    this.playerInfoText = this.add
      .text(0, 0, '', {
        fontSize: '11px',
        fontFamily: STUDIO_FONT.family,
        fontStyle: '500',
        color: '#f8fafc',
        wordWrap: { width: 200, useAdvancedWrap: true },
        resolution: STUDIO_FONT.resolution,
      })
      .setOrigin(0, 0)
      .setVisible(false);

    this.playerNameTag.add([
      this.playerNameBg,
      this.playerNameText,
      this.playerBadgeText,
      this.playerInfoText,
    ]);

    this.collapseLocalPlayerNametag();
  }

  private createInteractionHints() {
    // Glowing pulse ring at the base of nearby object
    this.interactPulseRing = this.add.image(0, 0, STUDIO_ASSETS.fx_interact_ring.key);
    this.interactPulseRing.setOrigin(0.5, 0.5);
    this.interactPulseRing.setAlpha(0);
    this.interactPulseRing.setDepth(10);

    // Floating prompt [E] INTERACT
    this.interactHintContainer = this.add.container(0, 0);
    const hintBg = this.add.graphics();
    hintBg.fillStyle(0x1d4ed8, 0.95);
    hintBg.lineStyle(1.5, 0x93c5fd, 1);
    hintBg.fillRoundedRect(-52, -14, 104, 28, 6);
    hintBg.strokeRoundedRect(-52, -14, 104, 28, 6);

    this.interactHintText = this.add
      .text(0, 0, 'E — INTERACT', {
        fontSize: '11px',
        fontFamily: STUDIO_FONT.family,
        fontStyle: 'bold',
        color: '#ffffff',
        resolution: STUDIO_FONT.resolution,
      })
      .setOrigin(0.5, 0.5);

    this.interactHintContainer.add([hintBg, this.interactHintText]);
    this.interactHintContainer.setDepth(99998); // High layer, directly below bubble chat (99999)
    this.interactHintContainer.setVisible(false);

    // Subtle bobbing tween for interaction hint
    this.tweens.add({
      targets: this.interactHintContainer,
      y: '-=4',
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createBubbleChatSystem() {
    // 1. Proximity Contextual Bubble Chat (for stations & colleagues)
    this.contextBubbleContainer = this.add.container(0, 0);
    this.contextBubbleContainer.setDepth(99999); // Topmost layer: strictly on top of all components
    this.contextBubbleContainer.setVisible(false);
    this.contextBubbleContainer.setAlpha(0);

    this.contextBubbleBg = this.add.graphics();

    this.contextBubbleHeader = this.add
      .text(0, 0, '', {
        fontSize: '9.5px',
        fontFamily: STUDIO_FONT.family,
        fontStyle: 'bold',
        color: '#38bdf8',
        resolution: STUDIO_FONT.resolution,
      })
      .setOrigin(0.5, 0);

    this.contextBubbleBody = this.add
      .text(0, 0, '', {
        fontSize: '11px',
        fontFamily: STUDIO_FONT.family,
        fontStyle: '500',
        color: '#f8fafc',
        align: 'center',
        wordWrap: { width: 220, useAdvancedWrap: true },
        resolution: STUDIO_FONT.resolution,
      })
      .setOrigin(0.5, 0);

    this.contextBubbleContainer.add([
      this.contextBubbleBg,
      this.contextBubbleHeader,
      this.contextBubbleBody,
    ]);
  }

  public showContextBubble(
    targetId: string,
    x: number,
    y: number,
    name: string,
    accentColor: number = 0x38bdf8
  ) {
    if (this.activeContextBubbleTargetId === targetId && this.contextBubbleContainer.visible) {
      this.contextBubbleContainer.setPosition(x, y);
      return;
    }

    this.activeContextBubbleTargetId = targetId;

    this.contextBubbleHeader.setText(name);
    const accentHex = `#${accentColor.toString(16).padStart(6, '0')}`;
    this.contextBubbleHeader.setColor(accentHex);

    this.contextBubbleBody.setVisible(false);
    this.contextBubbleBody.setText('');

    const bubbleW = Math.max(70, this.contextBubbleHeader.width + 20);
    const bubbleH = 22;

    this.contextBubbleBg.clear();
    // Dark glass pill background
    this.contextBubbleBg.fillStyle(0x0b1320, 0.94);
    this.contextBubbleBg.fillRoundedRect(-bubbleW / 2, -bubbleH - 8, bubbleW, bubbleH, 6);

    // Glowing colored border
    this.contextBubbleBg.lineStyle(1.5, accentColor, 0.9);
    this.contextBubbleBg.strokeRoundedRect(-bubbleW / 2, -bubbleH - 8, bubbleW, bubbleH, 6);

    // Downward tail pointing to target
    this.contextBubbleBg.fillStyle(0x0b1320, 0.94);
    this.contextBubbleBg.fillTriangle(-4, -8, 4, -8, 0, -2);
    this.contextBubbleBg.lineStyle(1.5, accentColor, 0.9);
    this.contextBubbleBg.lineBetween(-4, -8, 0, -2);
    this.contextBubbleBg.lineBetween(0, -2, 4, -8);

    this.contextBubbleHeader.setPosition(0, -bubbleH / 2 - 8);
    this.contextBubbleHeader.setOrigin(0.5, 0.5);

    this.contextBubbleContainer.setPosition(x, y);
    this.contextBubbleContainer.setVisible(true);

    this.contextBubbleTween?.stop();
    this.contextBubbleContainer.setScale(0.85);
    this.contextBubbleContainer.setAlpha(0);

    this.contextBubbleTween = this.tweens.add({
      targets: this.contextBubbleContainer,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 140,
      ease: 'Back.easeOut',
    });
  }

  public hideContextBubble() {
    if (!this.activeContextBubbleTargetId) return;
    this.activeContextBubbleTargetId = null;

    this.contextBubbleTween?.stop();
    this.contextBubbleTween = this.tweens.add({
      targets: this.contextBubbleContainer,
      scaleX: 0.85,
      scaleY: 0.85,
      alpha: 0,
      duration: 130,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.contextBubbleContainer.setVisible(false);
      },
    });
  }

  /**
   * Unified Nametag Renderer:
   * Handles both compact 26px status nametag and expanded wide info/speech bubble card
   */
  public renderNametag(
    bg: Phaser.GameObjects.Graphics,
    nameText: Phaser.GameObjects.Text,
    badgeText: Phaser.GameObjects.Text,
    infoText?: Phaser.GameObjects.Text,
    infoMessage?: string | null,
    borderColor = 0x3b82f6,
    bgColor = 0x0a101d,
    isAlert = false
  ) {
    bg.clear();

    if (!infoMessage || !infoText) {
      // === COMPACT MODE (Default: Gametag player hanya nama saja) ===
      if (infoText) {
        infoText.setVisible(false);
        infoText.setText('');
      }

      badgeText.setVisible(false);
      badgeText.setText('');

      nameText.setPosition(0, -6);
      nameText.setOrigin(0.5, 0.5);
      nameText.setVisible(true);

      const tagW = nameText.width + 16;
      const tagH = 18;

      bg.fillStyle(bgColor, 0.92);
      bg.lineStyle(1.5, borderColor, 0.85);
      bg.fillRoundedRect(-tagW / 2, -15, tagW, tagH, 5);
      bg.strokeRoundedRect(-tagW / 2, -15, tagW, tagH, 5);
    } else {
      // === EXPANDED MODE (Nametag melebar memunculkan pesan/chat/notifikasi) ===
      infoText.setVisible(true);
      infoText.setText(infoMessage);
      nameText.setVisible(true);
      badgeText.setVisible(false);
      badgeText.setText('');

      // Hitung dimensi nametag yang melebar
      const headerW = nameText.width + 24;
      const maxBoxW = 240;
      const contentW = Math.min(220, Math.max(infoText.width, 100));
      const boxW = Math.min(maxBoxW, Math.max(headerW, contentW + 20));

      infoText.setWordWrapWidth(boxW - 20, true);
      const infoH = infoText.height;
      const boxH = 20 + infoH + 12;
      const topY = -boxH - 6;

      // Card Background
      bg.fillStyle(bgColor, 0.96);
      bg.lineStyle(isAlert ? 2 : 1.5, borderColor, isAlert ? 1 : 0.9);
      bg.fillRoundedRect(-boxW / 2, topY, boxW, boxH, 8);
      bg.strokeRoundedRect(-boxW / 2, topY, boxW, boxH, 8);

      // Downward pointer tail pointing to avatar head
      bg.fillStyle(bgColor, 0.96);
      bg.fillTriangle(-5, -6, 5, -6, 0, -1);
      bg.lineStyle(isAlert ? 2 : 1.5, borderColor, isAlert ? 1 : 0.9);
      bg.lineBetween(-5, -6, 0, -1);
      bg.lineBetween(0, -1, 5, -6);

      // Top Row: Name on Left
      nameText.setPosition(-boxW / 2 + 10, topY + 4);
      nameText.setOrigin(0, 0);

      // Subtle Divider
      bg.lineStyle(1, borderColor, 0.25);
      bg.lineBetween(-boxW / 2 + 8, topY + 18, boxW / 2 - 8, topY + 18);

      // Bottom: Info text / Chat message
      infoText.setPosition(-boxW / 2 + 10, topY + 22);
      infoText.setOrigin(0, 0);
    }
  }

  public expandLocalPlayerNametag(message: string, durationMs = 4500, isAlert = false) {
    if (this.playerNametagTimer) {
      window.clearTimeout(this.playerNametagTimer);
      this.playerNametagTimer = undefined;
    }

    const borderColor = isAlert ? 0x38bdf8 : 0x3b82f6;
    const bgColor = isAlert ? 0x0c1e38 : 0x0a101d;

    this.renderNametag(
      this.playerNameBg,
      this.playerNameText,
      this.playerBadgeText,
      this.playerInfoText,
      message,
      borderColor,
      bgColor,
      isAlert
    );

    if (durationMs > 0) {
      this.playerNametagTimer = window.setTimeout(() => {
        this.collapseLocalPlayerNametag();
      }, durationMs);
    }
  }

  public collapseLocalPlayerNametag() {
    if (this.playerNametagTimer) {
      window.clearTimeout(this.playerNametagTimer);
      this.playerNametagTimer = undefined;
    }
    this.renderNametag(
      this.playerNameBg,
      this.playerNameText,
      this.playerBadgeText,
      this.playerInfoText,
      null,
      0x3b82f6,
      0x0a101d,
      false
    );
  }

  public expandRemotePlayerNametag(
    remote: RemotePlayerRecord,
    message: string,
    durationMs?: number,
    isAlert = false
  ) {
    if (remote.nametagTimer) {
      window.clearTimeout(remote.nametagTimer);
      remote.nametagTimer = undefined;
    }

    remote.isExpanded = true;
    const borderColor = isAlert ? 0xf59e0b : 0x10b981;
    const bgColor = isAlert ? 0x1c1917 : 0x0a101d;

    this.renderNametag(
      remote.nameBg,
      remote.nameText,
      remote.badgeText,
      remote.infoText,
      message,
      borderColor,
      bgColor,
      isAlert
    );

    if (durationMs && durationMs > 0) {
      remote.nametagTimer = window.setTimeout(() => {
        this.collapseRemotePlayerNametag(remote);
      }, durationMs);
    }
  }

  public collapseRemotePlayerNametag(remote: RemotePlayerRecord) {
    if (remote.nametagTimer) {
      window.clearTimeout(remote.nametagTimer);
      remote.nametagTimer = undefined;
    }
    remote.isExpanded = false;
    this.renderNametag(
      remote.nameBg,
      remote.nameText,
      remote.badgeText,
      remote.infoText,
      null,
      0x10b981,
      0x0a101d,
      false
    );
  }

  public expandColleagueNametag(
    colleague: ColleagueRecord,
    message: string,
    durationMs = 4500
  ) {
    if (colleague.nametagTimer) {
      window.clearTimeout(colleague.nametagTimer);
      colleague.nametagTimer = undefined;
    }

    this.renderNametag(
      colleague.nameBg,
      colleague.nameText,
      colleague.badgeText,
      colleague.infoText,
      message,
      0x10b981,
      0x0a101d,
      false
    );

    if (durationMs > 0) {
      colleague.nametagTimer = window.setTimeout(() => {
        this.collapseColleagueNametag(colleague);
      }, durationMs);
    }
  }

  public collapseColleagueNametag(colleague: ColleagueRecord) {
    if (colleague.nametagTimer) {
      window.clearTimeout(colleague.nametagTimer);
      colleague.nametagTimer = undefined;
    }
    this.renderNametag(
      colleague.nameBg,
      colleague.nameText,
      colleague.badgeText,
      colleague.infoText,
      null,
      0x10b981,
      0x0a101d,
      false
    );
  }

  public handleOutgoingDirectChatPoke(targetUserName: string) {
    this.expandLocalPlayerNametag(`💬 Mengajak ${targetUserName} berbicara...`, 5000, true);
  }

  public handleIncomingDirectChatPoke(poke: DirectChatPokePayload) {
    const remote = this.remotePlayers.get(poke.fromUserId);
    if (remote) {
      this.expandRemotePlayerNametag(remote, `💬 Ingin berbicara langsung dengan Anda...`, 7000, true);
    }
  }

  public showPlayerSpeechBubble(message: string, durationMs = 4500) {
    if (!this.player || !message?.trim()) return;

    this.expandLocalPlayerNametag(message, durationMs, false);

    // Broadcast chat to network
    if (this.bridgeEvents.onPlayerChat) {
      this.bridgeEvents.onPlayerChat(message);
    }
  }

  public showRemotePlayerSpeechBubble(remote: RemotePlayerRecord, message: string, durationMs = 4500) {
    if (!message?.trim()) return;
    this.expandRemotePlayerNametag(remote, message, durationMs, false);
  }

  public showColleagueSpeechBubble(memberIdOrName: string, message: string, durationMs = 4500) {
    const colleague = this.colleagues.find(
      (c) =>
        c.data.assignedUserId === memberIdOrName ||
        c.data.name.toLowerCase() === memberIdOrName.toLowerCase() ||
        c.data.name.toLowerCase().includes(memberIdOrName.toLowerCase())
    );

    if (!colleague || !message?.trim()) return;
    this.expandColleagueNametag(colleague, message, durationMs);
  }

  private getRoomAccentColor(roomType: string): number {
    switch (roomType) {
      case 'programming':
        return 0x3b82f6; // Blue
      case 'art':
        return 0xa855f7; // Purple
      case 'design':
        return 0x10b981; // Emerald
      case 'audio':
        return 0xc084fc; // Fuchsia
      case 'meeting':
        return 0xf59e0b; // Amber
      case 'lobby':
      default:
        return 0x38bdf8; // Cyan
    }
  }



  public update(_time: number, _delta: number) {
    if (!this.player || !this.player.body) return;

    if (this.isInputLocked) {
      this.player.setVelocity(0, 0);
      this.player.play(`${this.playerPrefix}_idle_${this.playerDirection}`, true);
      this.player.setDepth(this.player.y + (AVATAR_SPEC.height * (1 - AVATAR_SPEC.origin.y)));
      this.playerNameTag.setPosition(this.player.x, this.player.y - 28);

      // Keep interpolating remote players
      this.updateRemotePlayers();
      return;
    }

    // Seated Workstation State Handling: stand up immediately upon WASD input
    if (this.currentSeatedWorkstation) {
      const wantsToMove = Boolean(
        this.cursors?.left?.isDown ||
        this.cursors?.right?.isDown ||
        this.cursors?.up?.isDown ||
        this.cursors?.down?.isDown ||
        this.wasdKeys?.W?.isDown ||
        this.wasdKeys?.A?.isDown ||
        this.wasdKeys?.S?.isDown ||
        this.wasdKeys?.D?.isDown
      );

      if (wantsToMove) {
        this.leaveWorkstation();
      } else {
        this.player.setVelocity(0, 0);
        this.player.setTexture(`${this.playerPrefix}_up_0`);
        this.player.setDepth(this.player.y + (AVATAR_SPEC.height * (1 - AVATAR_SPEC.origin.y)));
        this.playerNameTag.setPosition(this.player.x, this.player.y - 28);
        this.updateRemotePlayers();
        this.emitNetworkUpdate('up', false);
        return;
      }
    }

    // Seated Meeting Seat Handling: stand up immediately upon WASD input
    if (this.currentSeatedMeetingSeat) {
      const wantsToMove = Boolean(
        this.cursors?.left?.isDown ||
        this.cursors?.right?.isDown ||
        this.cursors?.up?.isDown ||
        this.cursors?.down?.isDown ||
        this.wasdKeys?.W?.isDown ||
        this.wasdKeys?.A?.isDown ||
        this.wasdKeys?.S?.isDown ||
        this.wasdKeys?.D?.isDown
      );

      if (wantsToMove) {
        this.leaveMeetingSeat();
      } else {
        this.player.setVelocity(0, 0);
        this.player.setTexture(`${this.playerPrefix}_${this.currentSeatedMeetingSeat.facing}_0`);
        this.player.setDepth(this.player.y + (AVATAR_SPEC.height * (1 - AVATAR_SPEC.origin.y)));
        this.playerNameTag.setPosition(this.player.x, this.player.y - 28);
        this.updateRemotePlayers();
        this.emitNetworkUpdate(this.currentSeatedMeetingSeat.facing, false);
        return;
      }
    }

    const speed = 175;
    let vx = 0;
    let vy = 0;

    // Movement Inputs with null-safety
    const left = this.cursors?.left?.isDown || this.wasdKeys?.A?.isDown;
    const right = this.cursors?.right?.isDown || this.wasdKeys?.D?.isDown;
    const up = this.cursors?.up?.isDown || this.wasdKeys?.W?.isDown;
    const down = this.cursors?.down?.isDown || this.wasdKeys?.S?.isDown;

    if (left) vx -= speed;
    if (right) vx += speed;
    if (up) vy -= speed;
    if (down) vy += speed;

    // Diagonal speed normalization
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.player.setVelocity(vx, vy);
    const isMoving = vx !== 0 || vy !== 0;

    // Determine 4-direction facing
    if (Math.abs(vx) > Math.abs(vy)) {
      this.playerDirection = vx < 0 ? 'left' : 'right';
    } else if (Math.abs(vy) > 0) {
      this.playerDirection = vy < 0 ? 'up' : 'down';
    }

    // 4-Direction Animation Control
    if (isMoving) {
      const animKey = `${this.playerPrefix}_walk_${this.playerDirection}`;
      if (this.player.anims.currentAnim?.key !== animKey) {
        this.player.play(animKey, true);
      }
    } else {
      // Idle frame based on direction
      this.player.play(`${this.playerPrefix}_idle_${this.playerDirection}`, true);
    }

    // Dynamic Y-Sorting Depth
    this.player.setDepth(this.player.y + (AVATAR_SPEC.height * (1 - AVATAR_SPEC.origin.y)));
    this.playerNameTag.setDepth(this.player.y + 35);
    this.playerNameTag.setPosition(this.player.x, this.player.y - 28);

    // Room Detection
    this.checkRoomPresence();

    // Interactive Objects & Colleagues Proximity (updates contextual bubble chat)
    this.checkObjectProximity();

    // Remote Avatars Smooth Interpolation
    this.updateRemotePlayers();

    // Throttled Network Broadcast
    this.emitNetworkUpdate(this.playerDirection, isMoving);
  }

  private checkRoomPresence() {
    const px = this.player.x;
    const py = this.player.y;

    const detected = ROOMS.find(
      (r) => px >= r.x && px <= r.x + r.width && py >= r.y && py <= r.y + r.height
    );

    if (detected && detected.id !== this.currentRoom.id) {
      this.currentRoom = detected;
      if (this.bridgeEvents.onRoomChange) {
        this.bridgeEvents.onRoomChange(detected);
      }
    }

    // Check Sub-Zones across rooms & Central Plaza
    let activeZone: string | null = null;
    // Meeting Room Sub-Zones
    if (px >= 535 && px <= 745 && py >= 165 && py <= 305) {
      activeZone = 'Conference & Collaboration Hub';
    } else if (px >= 460 && px <= 570 && py >= 335 && py <= 400) {
      activeZone = 'Pre-Meeting Discussion Lounge';
    }
    // Central Plaza Social Gathering Zones
    else if (px >= 705 && px <= 800 && py >= 730 && py <= 825) {
      activeZone = 'Plaza Central Lounge';
    } else if (px >= 460 && px <= 550 && py >= 730 && py <= 810) {
      activeZone = 'Plaza Coffee & Conversation Corner';
    } else if (px >= 465 && px <= 555 && py >= 460 && py <= 585) {
      activeZone = 'Plaza Information & Directory Kiosk';
    } else if (px >= 735 && px <= 825 && py >= 460 && py <= 585) {
      activeZone = 'Plaza Announcement & Presence Kiosk';
    }
    // Department Sub-Zones
    else if (px >= 880 && px <= 960 && py >= 315 && py <= 390) {
      activeZone = 'Art Review & Critique Zone';
    } else if (px >= 105 && px <= 205 && py >= 750 && py <= 825) {
      activeZone = 'Game Design Critique & Review Area';
    } else if (px >= 935 && px <= 1035 && py >= 750 && py <= 825) {
      activeZone = 'Audio Review & Listening Lounge';
    } else if (px >= 1130 && px <= 1220 && py >= 460 && py <= 535) {
      activeZone = 'Audio Acoustic Listening Console';
    }

    if (activeZone !== this.currentZone) {
      this.currentZone = activeZone;
      if (this.bridgeEvents.onZoneChange) {
        this.bridgeEvents.onZoneChange(activeZone);
      }
    }
  }

  private checkObjectProximity() {
    const px = this.player.x;
    const py = this.player.y;

    // 0. Check Meeting Seats Proximity
    let closestSeatEntry: { seat: MeetingSeatData; table: InteractiveObjectDef } | null = null;
    let closestSeatDist = 38;

    this.meetingSeatDataMap.forEach((entry) => {
      const dist = Phaser.Math.Distance.Between(px, py, entry.seat.x, entry.seat.y);
      if (dist < closestSeatDist) {
        closestSeatDist = dist;
        closestSeatEntry = entry;
      }
    });

    if (closestSeatEntry !== null) {
      this.nearbyMeetingSeat = closestSeatEntry;
      if (this.nearbyMember) {
        this.nearbyMember = null;
        this.bridgeEvents.onNearbyMemberChange?.(null);
      }
      if (this.nearbyObject) {
        this.nearbyObject = null;
        this.bridgeEvents.onNearbyObjectChange?.(null);
      }

      const targetSeat: MeetingSeatData = (closestSeatEntry as { seat: MeetingSeatData; table: InteractiveObjectDef }).seat;
      if (!targetSeat.occupiedBy) {
        this.interactHintText.setText(`[E] DUDUK (KURSI #${targetSeat.seatIndex})`);
      } else {
        const occName = targetSeat.occupantName || 'Pemain Lain';
        this.interactHintText.setText(`KURSI #${targetSeat.seatIndex} (${occName})`);
      }

      this.interactHintContainer.setPosition(targetSeat.x, targetSeat.y - 24);
      this.interactHintContainer.setVisible(true);
      this.interactPulseRing.setPosition(targetSeat.x, targetSeat.y);
      this.interactPulseRing.setAlpha(0.6);

      // Contextual Bubble: Shown at topmost depth 99999 when nearby (only name)
      const seatTitle = `KURSI RAPAT #${targetSeat.seatIndex}`;
      this.showContextBubble(`seat_${targetSeat.id}`, targetSeat.x, targetSeat.y - 36, seatTitle, 0xf59e0b);
      return;
    }

    if (this.nearbyMeetingSeat) {
      this.nearbyMeetingSeat = null;
    }

    // Check Nearby Discussion Clusters
    let activeCluster: NearbyDiscussionCluster | null = null;
    for (const cluster of NEARBY_DISCUSSIONS) {
      const dist = Phaser.Math.Distance.Between(px, py, cluster.x, cluster.y);
      if (dist < cluster.radius) {
        activeCluster = cluster;
        break;
      }
    }
    if (activeCluster !== this.currentNearbyDiscussion) {
      this.currentNearbyDiscussion = activeCluster;
      this.bridgeEvents.onNearbyDiscussionChange?.(activeCluster);
    }

    let closestObj: InteractiveObjectDef | null = null;
    let closestObjDist = 65;

    INTERACTIVE_OBJECTS.forEach((obj) => {
      const dist = Phaser.Math.Distance.Between(px, py, obj.x, obj.y);
      if (dist < closestObjDist) {
        closestObjDist = dist;
        closestObj = obj;
      }
    });

    // Check all nearby remote live players and colleagues
    const nearbyMembersList: Array<{ member: WorkstationMemberData; dist: number }> = [];

    this.remotePlayers.forEach((remote) => {
      const rx = remote.container.x;
      const ry = remote.container.y;
      const dist = Phaser.Math.Distance.Between(px, py, rx, ry);
      if (dist <= 85) {
        const remoteMemberData: WorkstationMemberData = {
          name: remote.state.displayName || 'Remote Dev',
          discipline: remote.state.discipline || 'Programmer',
          roleTitle: `${remote.state.discipline || 'Team'} Member`,
          status: 'In Flow',
          currentGoal: 'Live Multiplayer Session',
          currentTaskTitle: `Active in ${remote.state.currentRoom || 'Studio'}`,
          progressPercentage: 100,
          assignedUserId: remote.state.userId,
          isAssigned: true,
          isOnline: true,
        };
        nearbyMembersList.push({ member: remoteMemberData, dist });
      }
    });

    for (const c of this.colleagues) {
      const dist = Phaser.Math.Distance.Between(px, py, c.x, c.y);
      if (dist <= 65) {
        nearbyMembersList.push({ member: c.data, dist });
      }
    }

    if (nearbyMembersList.length > 0) {
      // Sort by proximity
      nearbyMembersList.sort((a, b) => a.dist - b.dist);
      const sortedMembers = nearbyMembersList.map((item) => item.member);

      // Check if previously selected member is still in range
      let selected = this.nearbyMember
        ? sortedMembers.find((m) => (m.assignedUserId && m.assignedUserId === this.nearbyMember?.assignedUserId) || m.name === this.nearbyMember?.name)
        : null;

      if (!selected) {
        selected = sortedMembers[0];
      }

      if (
        !this.nearbyMember ||
        (selected.assignedUserId && selected.assignedUserId !== this.nearbyMember.assignedUserId) ||
        (!selected.assignedUserId && selected.name !== this.nearbyMember.name)
      ) {
        this.nearbyMember = selected;
        this.bridgeEvents.onNearbyMemberChange?.(selected);
      }

      this.bridgeEvents.onNearbyMembersListChange?.(sortedMembers);

      if (this.nearbyObject) {
        this.nearbyObject = null;
        this.bridgeEvents.onNearbyObjectChange?.(null);
      }

      // Untuk player & rekan: hilangkan prompt melayang [E] / tangan di atas kepala avatar
      // Interaksi ditangani secara bersih dan terpadu via layer HUD di bawah layar
      this.interactHintContainer.setVisible(false);
      this.interactPulseRing.setAlpha(0);
      this.hideContextBubble();
      return;
    }

    // No members nearby: reset nearby member state
    if (this.nearbyMember) {
      this.nearbyMember = null;
      this.bridgeEvents.onNearbyMemberChange?.(null);
      this.bridgeEvents.onNearbyMembersListChange?.([]);
    }

    if (closestObj !== this.nearbyObject) {
      this.nearbyObject = closestObj;
      this.bridgeEvents.onNearbyObjectChange?.(closestObj);
    }

    if (closestObj) {
      const obj = closestObj as InteractiveObjectDef;
      this.interactHintText.setText('[E] INTERACT');
      this.interactHintContainer.setPosition(obj.x, obj.y - obj.height / 2 - 16);
      this.interactHintContainer.setVisible(true);

      const offset = (obj as typeof INTERACTIVE_OBJECTS[number]).interactionOffset;
      this.interactPulseRing.setPosition(obj.x + offset.x, obj.y + offset.y);
      this.interactPulseRing.setAlpha(0.6);

      // Contextual Bubble: HANYA menampilkan nama saja
      const objTitle = obj.title || obj.name;
      const roomAccent = this.getRoomAccentColor(obj.roomType || this.currentRoom.type);
      this.showContextBubble(`obj_${obj.id}`, obj.x, obj.y - (obj.height || 32) / 2 - 24, objTitle, roomAccent);
    } else {
      this.interactHintContainer.setVisible(false);
      this.interactPulseRing.setAlpha(0);

      // Neither seat, colleague, nor object nearby: HIDE contextual bubble smoothly
      this.hideContextBubble();
    }
  }

  private triggerInteraction(obj: InteractiveObjectDef) {
    if (this.isInputLocked || this.isProductModalOpen()) return;

    // Visual click bounce
    this.tweens.add({
      targets: this.interactHintContainer,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 100,
      yoyo: true,
    });

    if (this.bridgeEvents.onObjectInteract) {
      this.bridgeEvents.onObjectInteract(obj);
    }
  }

  private isProductModalOpen(): boolean {
    return typeof document !== 'undefined'
      && Boolean(document.querySelector('[data-studio-modal-open="true"]'));
  }

  private emitNetworkUpdate(
    direction: 'up' | 'down' | 'left' | 'right' = 'down',
    isMoving: boolean = false
  ) {
    if (!this.player || !this.bridgeEvents.onNetworkBroadcast) return;

    const state: PlayerNetworkState = {
      userId: this.userProfile.id,
      displayName: this.userProfile.display_name,
      username: this.userProfile.username,
      discipline: this.userProfile.discipline,
      avatarConfig: this.userProfile.avatar_config,
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
      vx: Math.round(this.player.body ? this.player.body.velocity.x : 0),
      vy: Math.round(this.player.body ? this.player.body.velocity.y : 0),
      direction,
      isMoving,
      currentRoom: this.currentRoom.name,
      lastUpdated: Date.now(),
    };

    this.bridgeEvents.onNetworkBroadcast(state);
  }

  // ---------------------------------------------------------------------------
  // Remote Avatar Synchronization & 4-Direction Animations
  // ---------------------------------------------------------------------------

  public updateRemotePlayerState(state: PlayerNetworkState) {
    if (state.userId === this.userProfile.id) return;

    let remote = this.remotePlayers.get(state.userId);

    if (!remote) {
      const shirtColor = state.avatarConfig?.shirtColor || '#10b981';
      const skinColor = state.avatarConfig?.skinColor || '#f5d0b5';
      const hairColor = state.avatarConfig?.hairColor || '#2b1d0c';

      const sheetKey = createAvatarTextures(
        this,
        state.userId,
        shirtColor,
        skinColor,
        hairColor
      );

      const sprite = this.add.sprite(0, 0, `${sheetKey}_down_0`).setOrigin(0.5, 0.7);

      // Floating nameplate positioned 28px above avatar feet (Expanding Nametag)
      const nameTag = this.add.container(0, -28);

      const nameBg = this.add.graphics();

      const nameText = this.add
        .text(0, -6, state.displayName || 'Remote Dev', {
          fontSize: '11.5px',
          fontFamily: STUDIO_FONT.family,
          fontStyle: 'bold',
          color: '#ffffff',
          resolution: STUDIO_FONT.resolution,
        })
        .setOrigin(0.5, 0.5);

      const badgeText = this.add
        .text(0, 0, '', {
          fontSize: '9px',
          fontFamily: STUDIO_FONT.family,
          fontStyle: 'bold',
          color: '#34d399',
          resolution: STUDIO_FONT.resolution,
        })
        .setOrigin(0.5, 0)
        .setVisible(false);

      const infoText = this.add
        .text(0, 0, '', {
          fontSize: '11px',
          fontFamily: STUDIO_FONT.family,
          fontStyle: '500',
          color: '#f8fafc',
          wordWrap: { width: 200, useAdvancedWrap: true },
          resolution: STUDIO_FONT.resolution,
        })
        .setOrigin(0, 0)
        .setVisible(false);

      nameTag.add([nameBg, nameText, badgeText, infoText]);

      const container = this.add.container(state.x, state.y, [
        sprite,
        nameTag,
      ]);
      container.setSize(32, 48);
      container.setDepth(state.y + 10);
      container.setInteractive({ cursor: 'pointer' });

      container.on('pointerdown', () => {
        if (this.bridgeEvents.onPlayerClick) {
          const current = this.remotePlayers.get(state.userId);
          if (!this.isInputLocked && current) this.bridgeEvents.onPlayerClick(current.state);
        }
      });

      remote = {
        container,
        sprite,
        nameTag,
        nameBg,
        nameText,
        badgeText,
        infoText,
        state,
        sheetKey,
        targetX: state.x,
        targetY: state.y,
        currentDirection: state.direction || 'down',
      };

      this.remotePlayers.set(state.userId, remote);
      this.collapseRemotePlayerNametag(remote);
    } else {
      remote.state = state;
      remote.targetX = state.x;
      remote.targetY = state.y;
      remote.currentDirection = state.direction || 'down';
      remote.nameText.setText(state.displayName || 'Remote Dev');
      remote.badgeText.setText((state.discipline || 'MEMBER').toUpperCase());

      // If not currently expanded for chat/poke, keep compact
      if (!remote.isExpanded) {
        this.collapseRemotePlayerNametag(remote);
      }
    }

    // Handle remote player chat message (melebarkan nametag remote player secara mulus)
    if (state.chatMessage && (state.chatTimestamp ? state.chatTimestamp !== remote.lastChatTimestamp : state.chatMessage !== remote.lastChatMessage)) {
      remote.lastChatMessage = state.chatMessage;
      remote.lastChatTimestamp = state.chatTimestamp;
      this.showRemotePlayerSpeechBubble(remote, state.chatMessage);
    }
  }

  public removeRemotePlayer(userId: string) {
    const remote = this.remotePlayers.get(userId);
    if (remote) {
      if (remote.nametagTimer) {
        window.clearTimeout(remote.nametagTimer);
      }
      if (remote.pokeTimer) {
        window.clearTimeout(remote.pokeTimer);
      }
      remote.container.destroy();
      this.remotePlayers.delete(userId);
    }
  }

  private updateRemotePlayers() {
    this.remotePlayers.forEach((remote) => {
      const currentX = remote.container.x;
      const currentY = remote.container.y;
      const targetX = remote.targetX;
      const targetY = remote.targetY;

      const dist = Phaser.Math.Distance.Between(currentX, currentY, targetX, targetY);

      // Smooth Linear Interpolation (Lerp)
      if (dist > 1) {
        remote.container.x = Phaser.Math.Linear(currentX, targetX, 0.18);
        remote.container.y = Phaser.Math.Linear(currentY, targetY, 0.18);

        // 4-Direction Walk Animation for Remote Player
        const animKey = `${remote.sheetKey}_walk_${remote.currentDirection}`;
        if (remote.sprite.anims.currentAnim?.key !== animKey) {
          remote.sprite.play(animKey, true);
        }
      } else {
        remote.container.x = targetX;
        remote.container.y = targetY;
        remote.sprite.play(`${remote.sheetKey}_idle_${remote.currentDirection}`, true);
      }

      // Y-sorting depth for remote container
      remote.container.setDepth(remote.container.y + 10);
    });
  }

  /**
   * Fast Teleportation Action to jump to any room
   */
  public teleportToRoom(roomType: StudioRoomType) {
    const targetRoom = ROOMS.find((r) => r.type === roomType);
    if (targetRoom && this.player) {
      const centerX = targetRoom.x + targetRoom.width / 2;
      const centerY = targetRoom.y + targetRoom.height / 2;
      this.player.setPosition(centerX, centerY);
      this.playerNameTag.setPosition(centerX, centerY - 28);
      this.currentRoom = targetRoom;
      if (this.bridgeEvents.onRoomChange) {
        this.bridgeEvents.onRoomChange(targetRoom);
      }
      this.emitNetworkUpdate(this.playerDirection, false);
    }
  }

  /**
   * Updates the actively targeted nearby member from HUD selector
   */
  public setSelectedNearbyMember(member: WorkstationMemberData | null) {
    this.nearbyMember = member;
    this.bridgeEvents.onNearbyMemberChange?.(member);
  }
}

