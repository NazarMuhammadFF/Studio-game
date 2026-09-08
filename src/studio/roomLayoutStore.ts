import { INTERACTIVE_OBJECTS, ROOMS } from './layout';
import { FurnitureDirection, RoomFurnitureItem, RoomLayoutConfig, StudioRoomType } from './types';

const STORAGE_KEY_PREFIX = 'studio_room_layouts_v1_';

export interface RoomBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export function getRoomBounds(roomType: StudioRoomType): RoomBounds {
  const room = ROOMS.find((r) => r.type === roomType);
  if (!room) {
    return { minX: 40, maxX: 1240, minY: 40, maxY: 840 };
  }
  // Safe inner padding so furniture stays completely inside the room
  return {
    minX: room.x + 35,
    maxX: room.x + room.width - 35,
    minY: room.y + 35,
    maxY: room.y + room.height - 35,
  };
}

/**
 * Builds initial default furniture items from static layout definition
 */
function buildDefaultRoomItems(roomType: StudioRoomType): RoomFurnitureItem[] {
  return INTERACTIVE_OBJECTS.filter((obj) => obj.roomType === roomType).map((obj) => ({
    id: obj.id,
    name: obj.name,
    type: obj.type,
    roomType: obj.roomType,
    x: obj.x,
    y: obj.y,
    width: obj.width || 48,
    height: obj.height || 48,
    rotation: ((obj.rotation as FurnitureDirection) || 0) as FurnitureDirection,
    assetKey: obj.assetKey,
    title: obj.title,
    description: obj.description,
    isCustomizable: true,
    isTerminal: obj.type === 'room_layout',
  }));
}

function getStorageKey(projectId?: string): string {
  return `${STORAGE_KEY_PREFIX}${projectId || 'default'}`;
}

export class RoomLayoutStore {
  private memoryCache: Map<StudioRoomType, RoomLayoutConfig> = new Map();
  private projectId: string = 'default';

  constructor() {
    this.initStore();
  }

  public setProjectId(projectId: string) {
    if (this.projectId !== projectId) {
      this.projectId = projectId;
      this.memoryCache.clear();
      this.initStore();
    }
  }

  private initStore() {
    const rawSaved = typeof window !== 'undefined' ? window.localStorage?.getItem(getStorageKey(this.projectId)) : null;
    let savedLayouts: Record<string, RoomLayoutConfig> = {};
    if (rawSaved) {
      try {
        savedLayouts = JSON.parse(rawSaved);
      } catch (err) {
        console.warn('[RoomLayoutStore] Failed to parse saved room layouts:', err);
      }
    }

    ROOMS.forEach((room) => {
      const defaultItems = buildDefaultRoomItems(room.type);
      const savedConfig = savedLayouts[room.type];

      if (savedConfig && Array.isArray(savedConfig.items)) {
        // Merge saved overrides with default items to ensure any newly added objects are retained
        const mergedItems = defaultItems.map((defaultItem) => {
          const savedItem = savedConfig.items.find((it) => it.id === defaultItem.id);
          if (savedItem) {
            return {
              ...defaultItem,
              x: savedItem.x,
              y: savedItem.y,
              rotation: ([0, 90, 180, 270].includes(savedItem.rotation) ? savedItem.rotation : 0) as FurnitureDirection,
            };
          }
          return defaultItem;
        });

        this.memoryCache.set(room.type, {
          roomId: room.id,
          roomType: room.type,
          roomName: room.name,
          isLocked: savedConfig.isLocked !== undefined ? savedConfig.isLocked : true,
          lastUpdated: savedConfig.lastUpdated || Date.now(),
          items: mergedItems,
        });
      } else {
        this.memoryCache.set(room.type, {
          roomId: room.id,
          roomType: room.type,
          roomName: room.name,
          isLocked: true, // Default to locked to prevent accidental dragging
          lastUpdated: Date.now(),
          items: defaultItems,
        });
      }
    });
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      const obj: Record<string, RoomLayoutConfig> = {};
      this.memoryCache.forEach((config, roomType) => {
        obj[roomType] = config;
      });
      window.localStorage?.setItem(getStorageKey(this.projectId), JSON.stringify(obj));
    } catch (err) {
      console.error('[RoomLayoutStore] Failed to persist room layouts:', err);
    }
  }

  public getRoomLayout(roomType: StudioRoomType): RoomLayoutConfig {
    let config = this.memoryCache.get(roomType);
    if (!config) {
      const room = ROOMS.find((r) => r.type === roomType) || ROOMS[0];
      config = {
        roomId: room.id,
        roomType: room.type,
        roomName: room.name,
        isLocked: true,
        lastUpdated: Date.now(),
        items: buildDefaultRoomItems(roomType),
      };
      this.memoryCache.set(roomType, config);
    }
    return config;
  }

  public getAllRoomLayouts(): Record<StudioRoomType, RoomLayoutConfig> {
    const result = {} as Record<StudioRoomType, RoomLayoutConfig>;
    ROOMS.forEach((room) => {
      result[room.type] = this.getRoomLayout(room.type);
    });
    return result;
  }

  public updateFurniturePosition(
    roomType: StudioRoomType,
    itemId: string,
    x: number,
    y: number
  ): RoomLayoutConfig {
    const config = this.getRoomLayout(roomType);
    const bounds = getRoomBounds(roomType);

    const clampedX = Math.round(Math.max(bounds.minX, Math.min(bounds.maxX, x)));
    const clampedY = Math.round(Math.max(bounds.minY, Math.min(bounds.maxY, y)));

    const updatedItems = config.items.map((item) => {
      if (item.id === itemId) {
        return { ...item, x: clampedX, y: clampedY };
      }
      return item;
    });

    const newConfig: RoomLayoutConfig = {
      ...config,
      items: updatedItems,
      lastUpdated: Date.now(),
    };

    this.memoryCache.set(roomType, newConfig);
    this.persist();
    this.emitUpdate(roomType, newConfig);
    return newConfig;
  }

  public rotateFurniture(
    roomType: StudioRoomType,
    itemId: string,
    targetRotation?: FurnitureDirection
  ): RoomLayoutConfig {
    const config = this.getRoomLayout(roomType);

    const updatedItems = config.items.map((item) => {
      if (item.id === itemId) {
        let nextRotation: FurnitureDirection;
        if (targetRotation !== undefined) {
          nextRotation = targetRotation;
        } else {
          // Cycle through 0 -> 90 -> 180 -> 270 -> 0
          nextRotation = ((item.rotation + 90) % 360) as FurnitureDirection;
        }
        return { ...item, rotation: nextRotation };
      }
      return item;
    });

    const newConfig: RoomLayoutConfig = {
      ...config,
      items: updatedItems,
      lastUpdated: Date.now(),
    };

    this.memoryCache.set(roomType, newConfig);
    this.persist();
    this.emitUpdate(roomType, newConfig);
    return newConfig;
  }

  public toggleRoomLock(roomType: StudioRoomType, isLocked: boolean): RoomLayoutConfig {
    const config = this.getRoomLayout(roomType);
    const newConfig: RoomLayoutConfig = {
      ...config,
      isLocked,
      lastUpdated: Date.now(),
    };

    this.memoryCache.set(roomType, newConfig);
    this.persist();
    this.emitUpdate(roomType, newConfig);
    return newConfig;
  }

  public resetRoomLayout(roomType: StudioRoomType): RoomLayoutConfig {
    const room = ROOMS.find((r) => r.type === roomType);
    const defaultItems = buildDefaultRoomItems(roomType);

    const newConfig: RoomLayoutConfig = {
      roomId: room?.id || `room_${roomType}`,
      roomType,
      roomName: room?.name || roomType,
      isLocked: false,
      lastUpdated: Date.now(),
      items: defaultItems,
    };

    this.memoryCache.set(roomType, newConfig);
    this.persist();
    this.emitUpdate(roomType, newConfig);
    return newConfig;
  }

  public saveRoomLayout(
    roomType: StudioRoomType,
    items: RoomFurnitureItem[],
    isLocked: boolean
  ): RoomLayoutConfig {
    const room = ROOMS.find((r) => r.type === roomType);
    const newConfig: RoomLayoutConfig = {
      roomId: room?.id || `room_${roomType}`,
      roomType,
      roomName: room?.name || roomType,
      isLocked,
      lastUpdated: Date.now(),
      items,
    };

    this.memoryCache.set(roomType, newConfig);
    this.persist();
    this.emitUpdate(roomType, newConfig);
    return newConfig;
  }

  private emitUpdate(roomType: StudioRoomType, config: RoomLayoutConfig) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('studio-room-layout-updated', {
          detail: { roomType, config },
        })
      );
    }
  }
}

export const roomLayoutStore = new RoomLayoutStore();
