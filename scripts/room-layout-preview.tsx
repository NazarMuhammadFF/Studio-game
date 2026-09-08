import React from 'react';
import { createRoot } from 'react-dom/client';
import * as Phaser from 'phaser';
import { StudioScene, ROOMS, INTERACTIVE_OBJECTS } from '../src/studio/StudioScene';
import { RoomLayoutDock } from '../src/components/studio/RoomLayoutDock';
import { roomLayoutStore } from '../src/studio/roomLayoutStore';
import type { StudioRoomType } from '../src/studio/types';
import '../src/index.css';
roomLayoutStore.setProjectId('isolated-room-layout-qa');
const scene = new StudioScene();
(window as any).qa={scene,store:roomLayoutStore,ROOMS,INTERACTIVE_OBJECTS};
function App(){
 const [room,setRoom]=React.useState<StudioRoomType|null>(null),[selected,setSelected]=React.useState<string|null>(null),[locked,setLocked]=React.useState(false);
 React.useEffect(()=>{const game=new Phaser.Game({type:Phaser.AUTO,parent:'canvas',width:1280,height:720,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'arcade',arcade:{gravity:{x:0,y:0}}}});game.scene.add('StudioScene',scene,true,{bridgeEvents:{onFurnitureSelect:setSelected,onSceneReady:()=>setRoom('programming')}});return()=>game.destroy(true);},[]);
 React.useEffect(()=>{if(scene.player)scene.setRoomLayoutEditMode(room,locked);},[room,locked]);
 return <div className="relative h-screen bg-slate-950"><div id="canvas" className="h-full"/>{room&&<RoomLayoutDock key={room} roomType={room} projectId="isolated-room-layout-qa" isLocked={locked} selectedFurnitureId={selected} onSelectFurniture={id=>scene.setSelectedFurniture(id)} onRotateFurniture={(id,d)=>scene.rotateSelectedFurniture(id,d)} onToggleLock={()=>setLocked(!locked)} onResetLayout={()=>roomLayoutStore.resetRoomLayout(room)} onClose={()=>setRoom(null)}/>}</div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
