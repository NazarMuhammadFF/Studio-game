import fs from 'node:fs';
import path from 'node:path';
const specs=JSON.parse(fs.readFileSync('scripts/studio-asset-specs.json','utf8'));
const R=(x,y,w,h,c,r=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}"/>`;
const E=(x,y,rx,ry,c)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>`;
const L=(x,y,X,Y,c='#758480',w=1)=>`<path d="M${x} ${y}L${X} ${Y}" stroke="${c}" stroke-width="${w}" fill="none"/>`;
const C={ink:'#344849',wood:'#c99d72',light:'#ecd4ac',edge:'#8a6951',teal:'#558f89',paper:'#eee9da',shadow:'#243b3938'};
function screen(x,y,w,h,accent,kind='code',off=false){
 let s=R(x+w/2-1,y+h,2,3,C.ink)+R(x+w/2-5,y+h+2,10,2,C.ink)+R(x,y,w,h,C.ink,2)+R(x+2,y+2,w-4,h-4,off?'#354b50':'#20383e',1);
 if(!off){
 if(kind==='art')s+=`<path d="M${x+3} ${y+h-3}l${w/3} -${h/2} ${w/4} ${h/4} ${w/4} -${h/2}v${h*.75}Z" fill="${accent}"/>`+E(x+w*.7,y+5,2,2,C.light);
 else if(kind==='audio')for(let i=0;i<7;i++)s+=R(x+4+i*(w-8)/7,y+h/2-(i%3+1),1,(i%3+1)*2,accent);
 else for(let i=0;i<3;i++)s+=R(x+4+(i%2)*2,y+4+i*3,Math.max(3,w-10-i*2),1,i===1?C.light:accent);
 }
 return s+R(x+w-4,y+h-2,1,1,off?'#d5a867':accent);
}
function classify(k){
 if(k.startsWith('floor'))return 'floor'; if(k==='wall_block')return 'wall';if(k.startsWith('fx'))return 'ring';
 if(/chair/.test(k))return 'chair';if(/sofa|bench/.test(k))return 'sofa';if(/plant/.test(k))return 'plant';
 if(/wayfinding/.test(k))return 'sign';if(/table/.test(k))return 'table';
 if(/desk|workstation|listening/.test(k))return 'desk';if(/board|directory|status|screen/.test(k))return 'board';
 if(/surround/.test(k))return 'speaker';if(/server/.test(k))return 'server';if(/easel/.test(k))return 'easel';
 if(/water/.test(k))return 'water';if(/coffee/.test(k))return 'coffee';if(/arcade/.test(k))return 'arcade';return 'cabinet';
}
const extra=[['env_door_threshold',32,32,'threshold'],['env_door_frame',32,32,'frame'],['env_wall_corner',32,32,'wall'],['env_window',64,24,'window'],['obj_shared_shelf',48,44,'shelf'],['obj_shared_cabinet',40,40,'cabinet'],['obj_small_table',36,28,'table'],['obj_floor_lamp',24,40,'lamp'],['tech_monitor',28,22,'monitor'],['tech_monitor_portrait',20,30,'monitor'],['tech_computer',18,28,'server'],['tech_laptop',28,24,'laptop'],['tech_speaker',20,30,'speaker'],['decor_books',20,12,'books'],['decor_cup',12,12,'cup'],['decor_box',22,22,'box'],['decor_poster',24,30,'easel']];
for(const [key,width,height,kind] of extra)specs.push({key,width,height,kind});
const registry={}, shared=new Map();
for(const spec of specs){
 const {key:k,width:w,height:h}=spec,kind=spec.kind??classify(k);
 const accent=/art|mood/.test(k)?'#b87d81':/design|mechanic|flow|balanc/.test(k)?'#7c9e72':/audio|music|sfx/.test(k)?'#9583b6':/meeting|presentation/.test(k)?'#ba9457':'#619d9b';
 const off=/offline/.test(k),available=/available/.test(k);
 let s='';
 const slab=(x,y,W,H)=>R(x+1,y+3,W,H,C.shadow,3)+R(x,y,W,H,C.edge,3)+R(x,y,W,H-5,C.wood,3)+R(x+2,y+1,W-4,2,C.light,1);
 if(kind==='floor'){
 const timber=/meeting|lounge/.test(k);const col=timber?'#bda58b':/corridor|lobby/.test(k)?'#aaaFA6':'#a0aaa4';
 s=R(0,0,w,h,col)+L(0,h-.5,w,h-.5,timber?'#9f8d79':'#949e98')+L(w-.5,0,w-.5,h,'#949e98');
 if(timber)s+=L(0,16,32,16,'#a79580')+L(12,0,12,16,'#a79580')+L(24,16,24,32,'#a79580');
 }else if(kind==='wall')s=R(0,0,w,h,'#647776')+R(0,0,w,h-8,'#d3d7c8')+R(0,0,w,3,'#eef0df')+R(0,h-8,w,2,'#899a92')+R(0,h-2,w,2,'#425a58');
 else if(kind==='threshold')s=R(0,0,w,h,'#bba988')+L(3,0,3,h,'#e2d4b5',2)+L(w-3,0,w-3,h,'#e2d4b5',2);
 else if(kind==='frame')s=R(0,0,4,h,C.ink)+R(w-4,0,4,h,C.ink)+R(1,0,2,h,C.light)+R(w-3,0,2,h,C.light);
 else if(kind==='window')s=R(0,0,w,h,C.ink,2)+R(3,3,w-6,h-6,'#93bec1')+L(5,h-6,w-10,5,'#d5e9df',3)+R(w/2-1,2,2,h-4,C.paper)+R(0,h-3,w,3,C.light);
 else if(kind==='desk'){
 s=slab(2,12,w-4,h-15)+R(7,h-7,3,5,C.ink)+R(w-10,h-7,3,5,C.ink);
 const media=/art/.test(k)?'art':/audio|music|sfx|listening/.test(k)?'audio':'code';
 s+=screen(6,2,w*.4,17,accent,media,off)+screen(w*.57,3,w*.32,15,accent,media,off||available);
 s+=R(w*.3,25,w*.34,7,C.ink,1);for(let i=0;i<6;i++)s+=R(w*.32+i*3,27,1,2,'#a5bbb4');
 s+=E(w-11,29,2.5,3.5,C.paper)+E(10,h-12,3,3,C.paper)+E(10,h-12,2,2,'#795743');
 s+=R(5,h-7,7,2,off?'#b99664':available?'#9daba3':accent,1);
 if(media==='audio')for(let i=0;i<5;i++)s+=R(18+i*3,h-10,2,4,i%2?C.ink:C.paper);
 if(media==='art')s+=L(w-19,23,w-17,34,C.ink,2);
 }else if(kind==='board'||kind==='easel'){
 s=R(6,h-8,3,7,C.edge)+R(w-9,h-8,3,7,C.edge)+R(2,3,w-4,h-9,C.shadow,2)+R(1,1,w-4,h-10,C.edge,2)+R(3,3,w-8,h-14,C.paper,1)+R(4,4,w-10,3,accent);
 if(/screen|status|presence/.test(k))s+=screen(5,7,w-12,h-19,accent,'code');
 else if(/mood|art|easel|poster/.test(k)){for(let i=0;i<3;i++)s+=R(6+i*(w-14)/3,10,(w-20)/3,h-25,['#d2b276',accent,'#8caaa3'][i])+L(7+i*(w-14)/3,13,12+i*(w-14)/3,h-19,C.paper,2);}
 else if(/directory/.test(k)){
   s+=R(7,10,w-16,h-24,'#c1c9b8')+R(w*.42,10,w*.16,h-24,C.paper);
   for(let i=0;i<4;i++)s+=R(9+(i%2)*(w*.55),12+Math.floor(i/2)*10,w*.23,7,[accent,'#b87d81','#7c9e72','#9583b6'][i]);
 }else if(/audio_direction/.test(k)){
   for(let i=0;i<12;i++)s+=R(7+i*(w-15)/12,19-(i%4+1)*2,2,(i%4+1)*4,accent);
 }else if(/flow|mechanic|code_whiteboard|design_board/.test(k)){
   s+=L(15,16,w-15,16)+L(w/2,16,w/2,27);
   s+=R(7,11,16,8,accent,2)+R(w-23,11,16,8,'#cca868',2)+R(w/2-8,24,16,7,'#90a69b',2);
 }else if(/balancing/.test(k)){
   for(let i=0;i<5;i++)s+=R(8+i*10,28-i*3,6,4+i*3,accent);
 }else for(let i=0;i<3;i++){s+=R(7+i*(w-14)/3,11,(w-24)/3,6,[accent,'#cca868','#90a69b'][i])+L(10+i*(w-14)/3,19,10+i*(w-14)/3,23);s+=R(7+i*(w-14)/3,24,(w-24)/3,3,'#b8c4b6');}
 s+=R(2,h-10,w-6,2,C.light);
 }else if(kind==='table'){s=slab(2,2,w-4,h-5)+R(w*.45,7,w*.1,h-17,'#90a49a',2)+R(w*.2,h*.4,13,9,C.paper,1)+L(w*.2+2,h*.4+3,w*.2+9,h*.4+3,'#9ea9a0');s+=E(w*.76,h*.55,3,3,C.paper);}
 else if(kind==='chair'){s=E(w/2,h-4,8,3,C.shadow)+L(w/2,h-9,w/2,h-1,C.ink,2)+L(5,h-4,w-5,h-4,C.ink,2)+R(4,8,w-8,11,'#42666a',3)+R(5,3,w-10,9,accent,3)+R(6,4,w-12,2,'#adccc1',1)+R(2,10,3,7,C.ink,1)+R(w-5,10,3,7,C.ink,1);}
 else if(kind==='sofa'){s=slab(3,6,w-6,h-9)+R(3,3,w-6,10,'#65877e',3);for(let i=0;i<3;i++)s+=R(7+i*(w-14)/3,13,(w-18)/3,h-20,'#91aaa0',3);s+=R(2,9,6,h-12,'#6e9186',2)+R(w-8,9,6,h-12,'#6e9186',2)+R(10,12,9,7,C.light,2);}
 else if(kind==='plant'){s=E(w/2,h-3,9,3,C.shadow)+R(7,h-13,w-14,10,'#ae775a',3)+E(w/2,h-12,7,3,'#d4a57b');for(const [x,y,r]of [[8,10,6],[16,8,6],[12,4,5],[6,5,4],[18,13,4]])s+=E(x,y,r,r*.65,x<12?'#7caa75':'#47775e');s+=L(12,7,12,h-12,'#4a7259',2);}
 else if(kind==='speaker'||kind==='server'||kind==='cabinet'||kind==='shelf'){s=slab(2,2,w-4,h-5);s+=R(4,6,w-8,h-13,kind==='speaker'||kind==='server'?C.ink:'#927451',2);if(kind==='speaker')s+=E(w/2,h*.35,w*.2,w*.2,'#101f25')+E(w/2,h*.69,w*.27,w*.27,'#182e33')+E(w/2,h*.69,w*.1,w*.1,'#7a9696');else for(let y=10;y<h-10;y+=9){s+=R(6,y,w-12,5,kind==='server'?'#58706c':'#dbc5a0');s+=R(w-10,y+1,2,2,accent);}}
 else if(kind==='sign'){s=R(w/2-2,4,4,h-5,C.edge)+E(w/2,h-3,8,2,C.shadow);for(let i=0;i<3;i++)s+=R(2,4+i*9,w-4,7,[accent,'#a086aa','#af945e'][i],1)+L(7,7+i*9,w-7,7+i*9,C.paper);}
 else if(kind==='ring')s=`<ellipse cx="24" cy="24" rx="18" ry="10" fill="#e9d5a822" stroke="#f4deb0" stroke-width="2"/>`;
 else if(kind==='monitor')s=screen(1,1,w-2,h-5,accent);
 else if(kind==='laptop')s=screen(3,1,w-6,13,accent)+R(1,16,w-2,6,'#b0c1b9',2)+R(4,17,w-8,3,C.ink);
 else if(kind==='lamp')s=E(w/2,h-4,8,3,C.ink)+R(w/2-1,10,2,h-14,C.edge)+`<path d="M6 3H18L22 14H2Z" fill="${C.light}"/>`+E(w/2,14,10,2,'#f6e5b9');
 else if(kind==='books')s=R(1,6,w-2,5,accent,1)+R(3,1,w-5,5,C.edge,1)+R(4,2,w-8,2,C.paper);
 else if(kind==='cup')s=E(6,7,5,4,C.shadow)+E(6,5,4,4,C.paper)+E(6,5,2.5,2.5,C.edge);
 else if(kind==='box')s=slab(2,2,w-4,h-5)+R(w/2-2,2,4,h-8,C.paper);
 else {s=slab(2,h*.45,w-4,h*.5)+R(5,3,w-10,h*.55,kind==='water'?'#accace':C.ink,3)+R(8,7,w-16,h*.2,kind==='arcade'?accent:C.paper,2)+R(w/2-3,h*.4,6,4,C.edge);}
 const category=kind==='floor'?'environment/floors':kind==='wall'?'environment/walls':/threshold|frame/.test(kind)?'environment/doors':kind==='window'?'environment/windows':kind==='ring'?'interaction':/monitor|laptop|speaker|server/.test(kind)?'technology/'+kind:/board|sign/.test(kind)?'signage':/plant|books|cup|box|easel/.test(kind)?'decorations':'furniture/'+kind;
 const candidate=`assets/studio/${category}/${k}.svg`;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${s}</svg>\n`;
 const existing=shared.get(svg);
 const file=existing?.path??candidate;
 if(!existing){fs.mkdirSync(path.dirname('public/'+file),{recursive:true});fs.writeFileSync('public/'+file,svg);shared.set(svg,{key:k,path:file});}
 else if(fs.existsSync('public/'+candidate)&&fs.readFileSync('public/'+candidate,'utf8')===svg){fs.unlinkSync('public/'+candidate);}
 const collision=kind==='wall'?{x:0,y:0,width:w,height:h}:/floor|ring|threshold|frame|window|monitor|laptop|books|cup|chair/.test(kind)?null:kind==='lamp'?{x:4,y:h-7,width:w-8,height:5}:kind==='plant'?{x:7,y:h-12,width:w-14,height:10}:kind==='desk'?{x:2,y:12,width:w-4,height:h-15}:/board|easel|sign/.test(kind)?{x:4,y:h-12,width:w-8,height:9}:{x:2,y:Math.max(2,Math.floor(h*.3)),width:w-4,height:Math.floor(h*.7)-3};
 registry[k]={key:existing?.key??k,path:file,category,width:w,height:h,origin:{x:.5,y:.5},collision,depthOffset:collision?collision.y+collision.height-h/2:0,interactionOffset:{x:0,y:h/2+18}};
}
fs.writeFileSync('src/studio/assets/manifest.json',JSON.stringify(registry,null,2)+'\n');
console.log(`Built ${specs.length} logical assets, ${shared.size} unique SVG textures.`);
