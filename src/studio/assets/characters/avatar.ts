import type * as Phaser from 'phaser';

export const AVATAR_SPEC = {
  width: 32, height: 32, origin: { x: 0.5, y: 0.7 },
  collision: { x: 8, y: 20, width: 16, height: 12 },
  walkFrameRate: 8, idleFrameRate: 2, idleFrame: 0,
} as const;
const DIRECTIONS = ['down', 'up', 'left', 'right'] as const;
type Direction = typeof DIRECTIONS[number];

/** Appearance layers are independent of user IDs, roles, and networking. */
function drawFrame(ctx: CanvasRenderingContext2D, direction: Direction, step: number, shirt: string, skin: string, hair: string) {
  const rect = (x: number, y: number, w: number, h: number, color: string, radius = 0) => {
    ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fill();
  };
  const oval = (x: number, y: number, rx: number, ry: number, color: string) => {
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  };
  const side = direction === 'left' || direction === 'right';
  const stride = step === 1 ? -2 : step === 2 ? 2 : 0;
  const breath = step === 3 ? -0.5 : 0;
  // Ground plane and trousers: constant feet pivot for all directions.
  oval(16, 29, 8, 2.5, '#23393744');
  rect(side ? 12 : 10, 23, 5, 6 + stride, '#344951', 1);
  rect(side ? 16 : 18, 23, 5, 6 - stride, '#344951', 1);
  rect(side ? 11 : 9, 27 + stride, 6, 3, '#25383e', 1);
  rect(side ? 16 : 18, 27 - stride, 6, 3, '#25383e', 1);
  // Jacket, sleeves and upper-left highlight.
  rect(side ? 10 : 7, 14 + breath, side ? 13 : 18, 12, shirt, 4);
  rect(side ? 11 : 8, 16 + breath, 3, 7, '#ffffff30', 1);
  rect(20, 17 + breath, 3, 8, '#17353d33', 1);
  if (!side) {
    rect(5, 16 + stride / 2, 4, 7, shirt, 2);
    rect(23, 16 - stride / 2, 4, 7, shirt, 2);
    rect(5, 21 + stride / 2, 4, 3, skin, 1);
    rect(23, 21 - stride / 2, 4, 3, skin, 1);
  } else {
    rect(14, 16 - stride / 2, 5, 8, shirt, 2);
    rect(14, 22 - stride / 2, 4, 3, skin, 1);
  }
  if (direction === 'down') {
    rect(15, 17, 1, 8, '#e8e3cd99');
    rect(18, 19, 3, 2, '#e8e3cd99', 1);
  }
  // Neck, ears and head; hair and face provide readable direction cues.
  rect(13, 12, 6, 5, skin, 2);
  oval(16, 9, 7, 7, hair);
  if (direction !== 'up') {
    oval(side ? (direction === 'left' ? 13.5 : 18.5) : 16, 11, side ? 5 : 6, 5.5, skin);
    rect(10, 4, 12, 5, hair, 2);
    rect(direction === 'left' ? 18 : 9, 8, 4, 5, hair, 1);
    if (direction === 'down') {
      rect(12, 10, 2, 2, '#304047'); rect(18, 10, 2, 2, '#304047');
      rect(15, 14, 3, 1, '#ad7d68', 1);
    } else {
      rect(direction === 'left' ? 10 : 21, 10, 2, 2, '#304047');
    }
  } else {
    rect(10, 8, 12, 6, hair, 3);
    rect(13, 13, 6, 2, '#182c3033', 1);
  }
  rect(12, 4, 6, 2, '#ffffff25', 1);
}

export function createAvatarTextures(scene: Phaser.Scene, _userId: string, shirtColor = '#558f89', skinColor = '#e7bc98', hairColor = '#493b32'): string {
  const colors = [shirtColor, skinColor, hairColor].map((c, i) => /^#[0-9a-f]{6}$/i.test(c) ? c.toLowerCase() : ['#558f89', '#e7bc98', '#493b32'][i]);
  const prefix = `avatar_${colors.map(c => c.slice(1)).join('_')}`;
  if (scene.textures.exists(`${prefix}_down_0`)) return prefix;
  for (const direction of DIRECTIONS) {
    for (let step = 0; step < 4; step++) {
      const canvas = document.createElement('canvas');
      canvas.width = AVATAR_SPEC.width; canvas.height = AVATAR_SPEC.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Studio avatars require Canvas 2D support.');
      drawFrame(ctx, direction, step, colors[0], colors[1], colors[2]);
      scene.textures.addCanvas(`${prefix}_${direction}_${step}`, canvas);
    }
    for (const mode of ['idle', 'walk'] as const) {
      const animKey = `${prefix}_${mode}_${direction}`;
      if (!scene.anims.exists(animKey)) {
        scene.anims.create({
          key: animKey,
          frames: (mode === 'idle' ? [0, 3] : [1, 0, 2, 0]).map(step => ({ key: `${prefix}_${direction}_${step}` })),
          frameRate: mode === 'idle' ? AVATAR_SPEC.idleFrameRate : AVATAR_SPEC.walkFrameRate,
          repeat: -1,
        });
      }
    }
  }
  return prefix;
}
