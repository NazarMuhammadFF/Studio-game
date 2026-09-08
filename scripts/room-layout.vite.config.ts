import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
export default defineConfig({plugins:[{name:'local-room-qa',enforce:'pre',load(id){
 const p=id.replaceAll('\\','/');
 if(p.endsWith('/src/studio/StudioScene.ts'))return fs.readFileSync(id,'utf8').replace('this.createSelectionGraphics();','this.createSelectionGraphics(); (window as any).roomScene = this;');
 if(p.endsWith('/src/lib/supabase.ts'))return fs.readFileSync(id,'utf8').replace("const isConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-id'));",'const isConfigured = false;');
 if(p.endsWith('/src/lib/studioNetwork.ts'))return fs.readFileSync(id,'utf8').replaceAll('studio_broadcast_main','studio_room_editor_qa');
}},react()],resolve:{alias:{'@':path.resolve('src')}},server:{host:'127.0.0.1',port:3005}});
