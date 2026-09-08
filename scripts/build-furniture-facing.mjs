import fs from 'node:fs';

// Orthographic room-camera views. Upright faces and floor shadows are redrawn,
// never rotated in the screen plane.
export function buildFurnitureFacing(registry) {
  const shared = new Map();
  const rect=(x,y,w,h,c,r=2)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}"/>`;
  for(const [key,asset] of Object.entries({...registry})) {
    if(!key.startsWith('obj_') || !asset.collision) continue;
    for(const direction of [90,180,270]) {
      const side=direction!==180;
      const board=/board|screen|directory|status|sign|easel/.test(key);
      const desk=/desk|workstation|listening/.test(key);
      const sofa=/sofa|bench/.test(key);
      const table=/table/.test(key);
      const w=side ? (board?24:Math.max(30,asset.height)) : asset.width;
      const h=side ? (board?asset.height:Math.max(36,asset.width*.66)) : asset.height;
      const accent=/art|mood/.test(key)?'#b87d81':/audio|music|sfx/.test(key)?'#9583b6':/design/.test(key)?'#7c9e72':'#619d9b';
      let s=rect(3,h-7,w-6,6,'#243b3938',3);
      if(board) {
        s+=rect(6,h-13,3,10,'#8a6951')+rect(w-9,h-13,3,10,'#8a6951');
        s+=rect(3,2,w-6,h-13,'#8a6951')+rect(5,4,w-10,h-18,'#b7ac94');
        s+=rect(5,5,w-10,3,accent);
        if(!side)s+=rect(w/2-2,8,4,h-22,'#8a6951');
      } else if(desk || table) {
        s+=rect(4,h-12,4,9,'#344849')+rect(w-8,h-12,4,9,'#344849');
        s+=rect(2,12,w-4,h-20,'#8a6951')+rect(2,10,w-4,h-22,'#c99d72')+rect(4,11,w-8,2,'#ecd4ac');
        if(desk && side) s+=rect(5,3,5,h-22,'#344849')+rect(8,6,3,h-30,accent)+rect(w-14,18,8,13,'#344849');
        else if(desk) for(const x of [5,w*.53])s+=rect(x,h-24,w*.4,16,'#344849')+rect(x+3,h-21,w*.4-6,2,'#58706c')+rect(x+w*.18,h-9,3,6,'#344849');
        else s+=rect(w*.25,17,13,9,'#eee9da')+rect(w*.6,h*.5,5,5,accent);
      } else if(sofa) {
        s+=rect(3,7,w-6,h-13,'#65877e',4)+rect(6,10,w-12,h-21,'#91aaa0',3);
        s+=side?rect(3,3,9,h-11,'#42666a',3):rect(3,h-17,w-6,12,'#42666a',3);
      } else {
        s+=rect(3,4,w-6,h-10,'#8a6951')+rect(5,3,w-10,h-15,'#927451')+rect(5,4,w-10,3,'#ecd4ac');
        s+=rect(side?5:w-11,h-17,5,4,accent);
        for(let y=12;y<h-18;y+=7)s+=rect(8,y,w-16,2,'#756653');
      }
      if(direction===270)s=`<g transform="translate(${w} 0) scale(-1 1)">${s}</g>`;
      const variant=key+'__facing_'+direction;
      const file=`assets/studio/furniture/facing/${variant}.svg`;
      fs.mkdirSync('public/assets/studio/furniture/facing',{recursive:true});
      const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${s}</svg>\n`;
      const previous = shared.get(svg);
      if (!previous) { fs.writeFileSync('public/'+file,svg); shared.set(svg,{key:variant,path:file}); }
      else if (fs.existsSync('public/'+file)) fs.unlinkSync('public/'+file);
      const collision=board?{x:3,y:h-13,width:w-6,height:10}:{x:2,y:12,width:w-4,height:Math.max(8,h-17)};
      registry[variant]={...asset,key:previous?.key || variant,path:previous?.path || file,width:w,height:h,collision,depthOffset:collision.y+collision.height-h/2};
    }
  }
}
