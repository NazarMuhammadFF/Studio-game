import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { StudioCanvas } from '../src/components/studio/StudioCanvas';
import { StudioChatDrawer } from '../src/components/studio/chat/StudioChatDrawer';
import { MemberInteractionModal } from '../src/components/studio/MemberInteractionModal';
import { StudioScene } from '../src/studio/StudioScene';
import { mockChatStore } from '../src/studio/chat/mockChatStore';
import { supabase } from '../src/lib/supabase';
import { StudioNetwork } from '../src/lib/studioNetwork';
import '../src/index.css';
const params=new URLSearchParams(location.search),user=params.get('user')||'a';
// Live QA must prove server delivery, without same-browser transport or inbox polling.
if(params.has('live')) {
 (StudioNetwork.prototype as any).connectBroadcastChannel=()=>{};
 const interval=window.setInterval.bind(window);
 window.setInterval=((handler:any,delay?:number,...args:any[])=>interval(handler,delay===4000?600000:delay,...args)) as typeof window.setInterval;
}
const qa=(window as any).qa={scene:null,presence:[],clicked:null,inspected:null,nearby:null,errors:[],store:mockChatStore};
qa.auth=supabase.auth;
window.addEventListener('error',e=>qa.errors.push(e.message));
const init=StudioScene.prototype.init;
StudioScene.prototype.init=function(data){qa.scene=this;return init.call(this,data);};
let profile={id:'qa-'+user,username:'qa'+user,display_name:'Player '+user.toUpperCase(),discipline:'Programmer' as const,avatar_config:{shirtColor:user==='a'?'#558f89':'#b87d81'},created_at:'',updated_at:''};
let projectId='local-qa';
if(params.has('live')){const data=await fetch('/__qa_bootstrap?user='+user).then(r=>r.json());profile=data.profile;projectId=data.projectId;await supabase.auth.setSession(data.session);}
qa.userId=profile.id;
function App(){
 const [conversation,setConversation]=useState<string|null>(null),[open,setOpen]=useState(false),[player,setPlayer]=useState<any>(null),[message,setMessage]=useState<string|null>(null);
 const openChat=(id:string)=>{setConversation(mockChatStore.getOrCreateDirectConversation(id).id);setOpen(true);};qa.openChat=openChat;qa.closeChat=()=>setOpen(false);
 return <div style={{height:420,position:'relative'}}><StudioCanvas projectId={projectId} userProfile={profile} isInputLocked={open||!!player} onRoomChange={()=>{}} onObjectInteract={()=>{}} onPlayerClick={p=>{qa.clicked=p;setPlayer(p);}} onPresenceUpdate={p=>qa.presence=p} onMemberInspect={m=>{qa.inspected=m;openChat(m.assignedUserId!);}} onNearbyMemberChange={m=>qa.nearby=m} chatMessageToSend={message} onChatSent={()=>setMessage(null)}/><StudioChatDrawer isOpen={open} onClose={()=>setOpen(false)} currentRoomType="lobby" currentRoomName="Central Plaza & Lobby" nearbyMember={qa.nearby} initialConversationId={conversation} onUserSentMessage={setMessage}/><MemberInteractionModal player={player} onClose={()=>setPlayer(null)} onStartChat={p=>openChat(p.userId)}/></div>;
}
const root=createRoot(document.getElementById('root')!);qa.unmount=()=>root.unmount();root.render(<React.StrictMode><App/></React.StrictMode>);
