import fs from 'node:fs';
import assert from 'node:assert/strict';
const assets=JSON.parse(fs.readFileSync('src/studio/assets/manifest.json','utf8'));
const files=new Set(),content=new Map(),duplicates=[];let bytes=0;
for(const [key,a] of Object.entries(assets)){
 assert(assets[a.key],`Canonical key missing ${key}`);
 if(files.has(a.path))continue;files.add(a.path);
 const svg=fs.readFileSync('public/'+a.path,'utf8');bytes+=Buffer.byteLength(svg);
 assert(svg.includes(`viewBox="0 0 ${a.width} ${a.height}"`),`Dimensions ${key}`);
 assert(!/<script|<foreignObject|(?:href|url)\s*[:=(]/i.test(svg),`External/active SVG content ${key}`);
 assert(a.width<=160&&a.height<=80,`Texture budget ${key}`);
 if(a.collision){const c=a.collision;assert(c.x>=0&&c.y>=0&&c.width>0&&c.height>0&&c.x+c.width<=a.width&&c.y+c.height<=a.height,`Footprint ${key}`);}
 if(content.has(svg))duplicates.push([content.get(svg),key]);else content.set(svg,key);
}
const source=fs.readFileSync('src/studio/StudioScene.ts','utf8');
assert(!source.includes('.svg')&&!source.includes('/assets/studio/'),'Scene contains asset paths');
assert.equal(duplicates.length,0,'Duplicate SVG payloads');
console.log(JSON.stringify({assets:files.size,svgBytes:bytes,duplicates},null,2));

