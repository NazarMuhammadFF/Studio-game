import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { PlayerNetworkState } from '@/studio/types';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface StudioNetworkCallbacks {
  onRemotePlayerUpdate: (player: PlayerNetworkState) => void;
  onRemotePlayerLeave: (userId: string) => void;
  onPresenceSync: (members: PlayerNetworkState[]) => void;
}

export class StudioNetwork {
  private projectId: string;
  private localPlayer: PlayerNetworkState;
  private callbacks: StudioNetworkCallbacks;
  private supabaseChannel: RealtimeChannel | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private lastSentTime: number = 0;
  private lastSentState: string = '';
  private isConnected: boolean = false;
  private isSupabaseSubscribed: boolean = false;
  private knownMembers: Map<string, PlayerNetworkState> = new Map();
  private heartbeatTimer: number | null = null;

  // Throttle network updates to ~4-5 updates per second (200ms)
  private readonly THROTTLE_MS = 200;

  constructor(
    projectId: string,
    localPlayer: PlayerNetworkState,
    callbacks: StudioNetworkCallbacks
  ) {
    this.projectId = projectId;
    this.localPlayer = { ...localPlayer };
    this.callbacks = callbacks;
  }

  public getProjectId(): string {
    return this.projectId;
  }

  public getKnownMembers(): PlayerNetworkState[] {
    return Array.from(this.knownMembers.values());
  }

  public connect() {
    if (this.isConnected) return;
    this.isConnected = true;

    if (this.projectId) {
      // Track project context for studio networking
      this.localPlayer.currentRoom = this.localPlayer.currentRoom || 'Central Plaza & Lobby';
    }

    // 1. Connect BroadcastChannel for instant zero-latency multi-tab sync
    this.connectBroadcastChannel();

    // 2. Connect Supabase Realtime for cross-browser and remote sync
    if (isSupabaseConfigured) {
      this.connectSupabase();
    }

    // 3. Start periodic heartbeat to keep presence reliable even if idle
    this.startHeartbeat();
  }

  private startHeartbeat() {
    if (this.heartbeatTimer) {
      window.clearInterval(this.heartbeatTimer);
    }
    this.heartbeatTimer = window.setInterval(() => {
      if (!this.isConnected) return;
      this.sendMovement(this.localPlayer, true);
    }, 6000);
  }

  private connectSupabase() {
    // Universal Studio presence channel: ensures all studio members coexist in the 2D studio
    const channelName = 'studio_presence_main';
    this.supabaseChannel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false, self: false },
        presence: { key: this.localPlayer.userId },
      },
    });

    // Listen to throttled movement broadcasts
    this.supabaseChannel.on('broadcast', { event: 'player_move' }, (payload) => {
      const state = payload.payload as PlayerNetworkState;
      if (state && state.userId !== this.localPlayer.userId) {
        const isNew = !this.knownMembers.has(state.userId);
        this.knownMembers.set(state.userId, state);
        this.callbacks.onRemotePlayerUpdate(state);
        if (isNew) {
          this.callbacks.onPresenceSync(Array.from(this.knownMembers.values()));
          this.sendMovement(this.localPlayer, true);
        }
      }
    });

    // Listen to explicit join announcements from newly connected members
    this.supabaseChannel.on('broadcast', { event: 'player_join' }, (payload) => {
      const state = payload.payload as PlayerNetworkState;
      if (state && state.userId !== this.localPlayer.userId) {
        this.knownMembers.set(state.userId, state);
        this.callbacks.onRemotePlayerUpdate(state);
        this.callbacks.onPresenceSync(Array.from(this.knownMembers.values()));
        // Reply with our own position so newcomer learns about us immediately
        this.sendMovement(this.localPlayer, true);
      }
    });

    // Presence sync for joins/leaves
    this.supabaseChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = this.supabaseChannel?.presenceState() || {};
        const activeMembers: PlayerNetworkState[] = [];

        Object.keys(presenceState).forEach((key) => {
          if (key !== this.localPlayer.userId) {
            const pres = presenceState[key]?.[0] as any;
            if (pres?.playerState) {
              const latest = this.knownMembers.get(key);
              const state = latest && latest.lastUpdated > pres.playerState.lastUpdated ? latest : pres.playerState;
              activeMembers.push(state);
              this.knownMembers.set(key, state);
            }
          }
        });

        this.callbacks.onPresenceSync(activeMembers);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (key !== this.localPlayer.userId) {
          const pres = newPresences?.[0] as any;
          if (pres?.playerState) {
            this.knownMembers.set(key, pres.playerState);
            this.callbacks.onRemotePlayerUpdate(pres.playerState);
            this.callbacks.onPresenceSync(Array.from(this.knownMembers.values()));
            // Greet newcomer
            this.sendMovement(this.localPlayer, true);
          }
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key !== this.localPlayer.userId) {
          this.knownMembers.delete(key);
          this.callbacks.onRemotePlayerLeave(key);
          this.callbacks.onPresenceSync(Array.from(this.knownMembers.values()));
        }
      });

    this.supabaseChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        this.isSupabaseSubscribed = true;
        await this.supabaseChannel?.track({
          online_at: new Date().toISOString(),
          playerState: this.localPlayer,
        });

        // Announce join event via broadcast
        this.supabaseChannel?.send({
          type: 'broadcast',
          event: 'player_join',
          payload: this.localPlayer,
        });

        this.sendMovement(this.localPlayer, true);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        this.isSupabaseSubscribed = false;
        console.warn(`Studio realtime channel ${status.toLowerCase()} for studio`);
      }
    });
  }

  private connectBroadcastChannel() {
    const channelName = 'studio_broadcast_main';
    try {
      this.broadcastChannel = new BroadcastChannel(channelName);

      this.broadcastChannel.onmessage = (event) => {
        const data = event.data;
        if (!data || data.senderId === this.localPlayer.userId) return;

        if (data.type === 'move') {
          const state = data.payload as PlayerNetworkState;
          const isNew = !this.knownMembers.has(state.userId);
          this.knownMembers.set(state.userId, state);
          this.callbacks.onRemotePlayerUpdate(state);
          if (isNew) {
            this.callbacks.onPresenceSync(Array.from(this.knownMembers.values()));
            this.sendMovement(this.localPlayer, true);
          }
        } else if (data.type === 'join' || data.type === 'announce') {
          const state = data.payload as PlayerNetworkState;
          this.knownMembers.set(state.userId, state);
          this.callbacks.onRemotePlayerUpdate(state);
          this.callbacks.onPresenceSync(Array.from(this.knownMembers.values()));

          // If someone announced themselves, respond with our state
          if (data.type === 'announce') {
            this.broadcastChannel?.postMessage({
              type: 'join',
              senderId: this.localPlayer.userId,
              payload: this.localPlayer,
            });
          }
        } else if (data.type === 'leave') {
          const userId = data.userId as string;
          this.knownMembers.delete(userId);
          this.callbacks.onRemotePlayerLeave(userId);
          this.callbacks.onPresenceSync(Array.from(this.knownMembers.values()));
        }
      };

      // Announce self to other tabs
      this.broadcastChannel.postMessage({
        type: 'announce',
        senderId: this.localPlayer.userId,
        payload: this.localPlayer,
      });
    } catch (err) {
      console.warn('BroadcastChannel not supported or error:', err);
    }
  }

  /**
   * Throttled position update transmitter.
   * Sends approximately 3-5 updates/sec only when values change.
   */
  public sendMovement(state: PlayerNetworkState, force: boolean = false) {
    const now = performance.now();
    const changedMotion = this.localPlayer.isMoving !== state.isMoving;
    this.localPlayer = { ...state };

    // Avoid consuming the initial update before a Supabase channel is ready.
    // Once subscribed, connectSupabase sends this stored state immediately.
    const canSend = this.isSupabaseSubscribed || Boolean(this.broadcastChannel);
    if (!canSend) return;

    const stateKey = `${Math.round(state.x)},${Math.round(state.y)},${state.direction},${state.isMoving},${state.currentRoom}`;

    if (!force) {
      if (!changedMotion && now - this.lastSentTime < this.THROTTLE_MS) return;
      if (stateKey === this.lastSentState) return;
    }

    this.lastSentTime = now;
    this.lastSentState = stateKey;

    if (this.supabaseChannel && this.isSupabaseSubscribed) {
      this.supabaseChannel.send({
        type: 'broadcast',
        event: 'player_move',
        payload: state,
      });
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'move',
        senderId: this.localPlayer.userId,
        payload: state,
      });
    }
  }

  /**
   * Broadcast a chat message across the studio network
   */
  public sendChat(message: string) {
    const updatedState: PlayerNetworkState = {
      ...this.localPlayer,
      chatMessage: message,
      chatTimestamp: Date.now(),
    };
    this.sendMovement(updatedState, true);
  }

  public disconnect() {
    this.isConnected = false;
    this.isSupabaseSubscribed = false;

    if (this.heartbeatTimer) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'leave',
          senderId: this.localPlayer.userId,
          userId: this.localPlayer.userId,
        });
        this.broadcastChannel.close();
      } catch (err) {
        console.error('Error closing broadcast channel', err);
      }
      this.broadcastChannel = null;
    }

    if (this.supabaseChannel) {
      this.supabaseChannel.unsubscribe();
      this.supabaseChannel = null;
    }

    this.knownMembers.clear();
  }
}
