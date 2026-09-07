import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile } from '@/types/database.types';

export interface DirectMessageRow {
  id: string; workspace_id: string; sender_id: string; recipient_id: string;
  content: string; created_at: string;
  sender: Profile; recipient: Profile;
}
const selection = '*,sender:profiles!studio_direct_messages_sender_id_fkey(*),recipient:profiles!studio_direct_messages_recipient_id_fkey(*)';

/** Private persistent messages use RLS-protected rows, never studio broadcasts. */
export function connectDirectMessages(profile: Profile, projectId: string, receive: (rows: DirectMessageRow[], initial: boolean) => void, status: (error: string | null) => void) {
  let disposed = false, fetching = false, refreshPending = false, initial = true;
  const workspace = isSupabaseConfigured
    ? supabase.from('projects').select('workspace_id').eq('id', projectId).single()
    : Promise.resolve({data:null,error:{message:'Direct Chat membutuhkan koneksi Supabase.'}});
  const refresh = async () => {
    if (disposed || !isSupabaseConfigured) return;
    if (fetching) { refreshPending = true; return; }
    fetching = true;
    try {
      const {data,error} = await supabase.from('studio_direct_messages').select(selection)
        .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`).order('created_at',{ascending:false}).limit(200);
      if (disposed) return;
      if (error) {status('Riwayat chat belum dapat dimuat. Koneksi akan dicoba kembali.');return;}
      receive((data || []).reverse() as unknown as DirectMessageRow[], initial);
      initial = false;
      status(null);
    } catch { if (!disposed) status('Koneksi chat terputus. Mencoba kembali…'); }
    finally {
      fetching = false;
      if (refreshPending && !disposed) {
        refreshPending = false;
        void refresh();
      }
    }
  };
  const channel = isSupabaseConfigured ? supabase.channel(`studio-direct-${profile.id}`)
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'studio_direct_messages',filter:`recipient_id=eq.${profile.id}`},()=>void refresh())
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'studio_direct_messages',filter:`sender_id=eq.${profile.id}`},()=>void refresh())
    .subscribe(state=>{if(state==='SUBSCRIBED')void refresh();}) : null;
  void refresh();
  const timer = window.setInterval(()=>void refresh(), 4000);
  return {
    async send(id: string, recipientId: string, content: string) {
      const {data:project,error:projectError}=await workspace;
      if(disposed)throw new Error('Sesi chat telah ditutup.');
      if(projectError || !project)throw new Error('Chat belum tersambung. Muat ulang studio untuk mencoba kembali.');
      const {data,error}=await supabase.from('studio_direct_messages').insert({id,workspace_id:project.workspace_id,sender_id:profile.id,recipient_id:recipientId,content}).select(selection).single();
      if(error)throw new Error('Pesan gagal dikirim. Pastikan penerima tergabung di workspace Anda dan koneksi aktif.');
      if(!disposed)receive([data as unknown as DirectMessageRow],false);
    },
    dispose(){disposed=true;window.clearInterval(timer);if(channel)void supabase.removeChannel(channel);},
  };
}
