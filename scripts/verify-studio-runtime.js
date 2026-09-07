(async () => {
 const {scene:s,INTERACTIVE_OBJECTS:objects,DOORWAYS:doors,STUDIO_ASSETS:assets}=qa;
 const failures=[],check=(ok,msg)=>{if(!ok)failures.push(msg);};
 check(Object.values(assets).every(a=>s.textures.exists(a.key)),'Missing textures');
 check(s.validateLayoutClearance().valid,'Door clearance');
 for(const sprite of s.objectsGroup.getChildren()){
   const a=assets[sprite.texture.key],c=a.collision,b=sprite.body;
   check(b.width===c.width&&b.height===c.height,'Body dimensions: '+a.key);
   check(Math.abs(b.x-(sprite.x-a.width/2+c.x))<.1&&Math.abs(b.y-(sprite.y-a.height/2+c.y))<.1,'Body offset: '+a.key);
 }
 // Rasterize actual physics footprints expanded by avatar feet, then flood from plaza.
 const step=4,W=320,H=220,blocked=new Uint8Array(W*H),seen=new Uint8Array(W*H);
 for(const o of [...s.objectsGroup.getChildren(),...s.wallsGroup.getChildren()]){
   const b=o.body;
   for(let y=Math.max(0,Math.floor((b.y-9.6)/step));y<Math.min(H,Math.ceil((b.y+b.height+2.4)/step));y++)
    for(let x=Math.max(0,Math.floor((b.x-8)/step));x<Math.min(W,Math.ceil((b.x+b.width+8)/step));x++)blocked[y*W+x]=1;
 }
 const q=[155*W+160];seen[q[0]]=1;
 for(let i=0;i<q.length;i++){const n=q[i],x=n%W,y=Math.floor(n/W);for(const [X,Y]of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){if(X<0||Y<0||X>=W||Y>=H)continue;const j=Y*W+X;if(!blocked[j]&&!seen[j]){seen[j]=1;q.push(j);}}}
 const reachable=(x,y)=>!!seen[Math.round(y/step)*W+Math.round(x/step)];
 for(const o of objects){check(reachable(o.x+o.interactionOffset.x,o.y+o.interactionOffset.y),'Interaction inaccessible: '+o.id);}
 for(const d of doors)check(reachable(d.x+d.width/2,d.y+d.height/2),'Door disconnected: '+d.id);
 const start={x:s.player.x,y:s.player.y};
 // Real Arcade body integration through each doorway in both directions.
 for(const d of doors){const vertical=d.width>d.height,cx=d.x+d.width/2,cy=d.y+d.height/2;
  for(const sign of [-1,1]){s.player.body.reset(cx+(vertical?0:-sign*44),cy+(vertical?-sign*44:0));s.player.setVelocity(vertical?0:sign*120,vertical?sign*120:0);for(let i=0;i<48;i++)s.physics.world.step(1/60);const coord=vertical?s.player.body.center.y:s.player.body.center.x;check(sign*(coord-(vertical?cy:cx))>25,'Traversal blocked: '+d.id+' '+sign);}
 }
 s.player.body.reset(start.x,start.y);s.player.setVelocity(0,0);
 // Body really stops at furniture; decorative monitor silhouette is excluded.
 const desk=s.objectsGroup.getChildren().find(o=>o.texture.key==='obj_desk_monitor');
 s.player.body.reset(desk.x,desk.body.bottom+35);s.player.setVelocity(0,-120);for(let i=0;i<60;i++)s.physics.world.step(1/60);
 check(s.player.body.top>=desk.body.bottom-.1,'Furniture does not block feet');
 s.player.body.reset(start.x,start.y);s.player.setVelocity(0,0);
 const workstation=objects.find(o=>o.workstationData);s.sitAtWorkstation(workstation);check(s.currentSeatedWorkstation===workstation,'Workstation seating');s.leaveWorkstation();check(s.currentSeatedWorkstation===null,'Workstation exit');
 const table=objects.find(o=>o.meetingSeats),seat=table.meetingSeats.find(o=>!o.occupiedBy);s.sitAtMeetingSeat(seat,table);check(seat.occupiedBy===s.userProfile.id,'Meeting seat ownership');s.leaveMeetingSeat();check(seat.occupiedBy===null,'Meeting seat release');
 for(const dir of ['up','down','left','right'])for(const mode of ['idle','walk'])check(s.anims.exists(`${s.playerPrefix}_${mode}_${dir}`),'Animation '+mode+' '+dir);
 const state={userId:'asset-qa-remote',displayName:'QA Member',username:'qa',discipline:'Artist',avatarConfig:{shirtColor:'#558f89',skinColor:'#e7bc98',hairColor:'#493b32'},x:640,y:580,vx:0,vy:0,direction:'left',isMoving:false,currentRoom:'Central Plaza & Lobby',lastUpdated:Date.now()};
 s.updateRemotePlayerState(state);s.updateRemotePlayers();const remote=s.remotePlayers.get(state.userId);
 check(remote.sprite.anims.currentAnim.key.endsWith('idle_left'),'Remote idle');
 s.updateRemotePlayerState({...state,x:700,direction:'right',isMoving:true});s.updateRemotePlayers();
 check(remote.container.x>640&&remote.sprite.anims.currentAnim.key.endsWith('walk_right'),'Remote walking/interpolation');
 const count=()=>s.textures.getTextureKeys().filter(k=>k.startsWith('avatar_')).length,before=count();
 s.updateRemotePlayerState({...state,userId:'asset-qa-remote-2'});check(count()===before,'Appearance texture sharing');
 s.removeRemotePlayer(state.userId);s.removeRemotePlayer('asset-qa-remote-2');
 check(!s.remotePlayers.has(state.userId),'Remote cleanup');
 s.player.body.reset(desk.x,desk.y-35);s.update(0,16);check(s.player.depth<desk.depth,'Avatar behind furniture');
 s.player.body.reset(desk.x,desk.y+40);s.update(0,16);check(s.player.depth>desk.depth,'Avatar in front of furniture');
 s.player.body.reset(start.x,start.y);s.player.setVelocity(0,0);
 return {passed:failures.length===0,failures,assets:Object.keys(assets).length,objects:objects.length,doorTraversals:doors.length*2,reachableCells:q.length,animations:8};
})()
