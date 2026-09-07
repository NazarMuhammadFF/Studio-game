import type * as Phaser from 'phaser';
import manifest from './manifest.json';

export interface StudioAsset {
  key: string;
  path: string;
  category: string;
  width: number;
  height: number;
  origin: { x: number; y: number };
  collision: { x: number; y: number; width: number; height: number } | null;
  depthOffset: number;
  interactionOffset: { x: number; y: number };
}
export const STUDIO_ASSETS: Readonly<Record<string, StudioAsset>> = manifest;

export function loadStudioAssets(scene: Phaser.Scene) {
  const queued = new Set<string>();
  for (const asset of Object.values(STUDIO_ASSETS)) {
    if (!scene.textures.exists(asset.key) && !queued.has(asset.key)) {
      queued.add(asset.key);
      scene.load.svg(asset.key, `${import.meta.env.BASE_URL}${asset.path}`, { width: asset.width, height: asset.height });
    }
  }
}

/** Footprints are native texture pixels, never the full silhouette/shadow. */
export function applyAssetBody(sprite: Phaser.Physics.Arcade.Sprite, asset: StudioAsset) {
  sprite.setOrigin(asset.origin.x, asset.origin.y);
  sprite.setDepth(sprite.y + asset.depthOffset);
  sprite.refreshBody();
  const body = sprite.body as Phaser.Physics.Arcade.StaticBody;
  if (asset.collision) {
    body.setSize(asset.collision.width, asset.collision.height);
    body.setOffset(asset.collision.x, asset.collision.y);
  } else {
    body.enable = false;
  }
}
