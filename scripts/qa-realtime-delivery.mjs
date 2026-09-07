import fs from 'node:fs';import {createClient}from'@supabase/supabase-js';
const fixture=JSON.parse(fs.readFileSync('C:/Users/nazar/.codex/tmp/studio-multiplayer-qa.json','utf8'));
const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>/^[A-Z_]+=/.test(l)).map(l=>{const i=l.indexOf('=');return[l.slice(0,i),l.slice(i+1).trim().replace(/^['"]|['"]$/g,'')]}));
const clients=fixture.users.map(()=>createClient('https://'+fs.readFileSync('supabase/.temp/project-ref','utf8').trim()+'.supabase.co',env.VITE_SUPABASE_PUBLISHABLE_KEY||env.VITE_SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}}));
for(let i=0;i<3;i++){await clients[i].auth.setSession(fixture.users[i].session);await clients[i].realtime.setAuth(fixture.users[i].session.access_token);}
let received=0,other=0;const statuses=[];
const channel=clients[1].channel('qa-live-events').on('postgres_changes',{event:'INSERT',schema:'public',table:'studio_direct_messages',filter:`recipient_id=eq.${fixture.users[1].id}`},()=>received++);
const outsider=clients[2].channel('qa-live-other').on('postgres_changes',{event:'INSERT',schema:'public',table:'studio_direct_messages'},()=>other++);
await Promise.all([channel,outsider].map((ch,i)=>new Promise((res,rej)=>{const timeout=setTimeout(()=>rej(new Error('Subscription timeout')),15000);ch.subscribe(s=>{statuses.push([i,s]);if(s==='SUBSCRIBED'){clearTimeout(timeout);res();}});} )));
await new Promise(r=>setTimeout(r,2000));
const {error}=await clients[0].from('studio_direct_messages').insert({workspace_id:fixture.workspaceId,sender_id:fixture.users[0].id,recipient_id:fixture.users[1].id,content:'QA realtime event verification'});
for(let i=0;i<20&&!received;i++)await new Promise(r=>setTimeout(r,500));
console.log(JSON.stringify({inserted:!error,received,outsiderEvents:other,statuses}));
for(const c of clients)await c.removeAllChannels();

