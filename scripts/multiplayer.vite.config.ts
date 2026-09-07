import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';
const live=process.env.STUDIO_QA_LIVE==='1';
const fixture='C:/Users/nazar/.codex/tmp/studio-multiplayer-qa.json';
export default defineConfig({
 plugins: [{name:'isolated-network-qa',enforce:'pre',
 load(id){
  const normalized=id.replaceAll('\\','/');
  if(!live && normalized.endsWith('/src/lib/supabase.ts'))return `export const isSupabaseConfigured=false;export const supabase={channel(){throw new Error('Local QA must not connect to Supabase')}};`;
  // Iframes share sessionStorage; give fixture accounts distinct keys like separate tabs.
  if(live && normalized.endsWith('/src/lib/supabase.ts'))return fs.readFileSync(id,'utf8').replace('key.replace(authChannelKey, persistedAuthKey)',"key.replace(authChannelKey, persistedAuthKey)+'-qa-'+new URLSearchParams(location.search).get('user')");
  if(normalized.endsWith('/src/lib/studioNetwork.ts'))return fs.readFileSync(id,'utf8').replaceAll('studio_presence_main','studio_presence_isolated_qa').replaceAll('studio_broadcast_main','studio_broadcast_isolated_qa');
 },
 configureServer(server){server.middlewares.use('/__qa_bootstrap',(req,res,next)=>{if(!live)return next();const label=new URL(req.url||'/', 'http://localhost').searchParams.get('user');const data=JSON.parse(fs.readFileSync(fixture,'utf8'));const user=data.users.find(u=>u.label===label);if(!user){res.statusCode=404;res.end();return;}res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify({profile:user.profile,session:user.session,projectId:data.projectId}));});}
 },react()],
 resolve:{alias:{'@':path.resolve('src')}},server:{port:live?3003:3002,host:'127.0.0.1'},
});
