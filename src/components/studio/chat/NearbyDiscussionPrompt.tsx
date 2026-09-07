import React from 'react';
import { NearbyDiscussionCluster } from '@/studio/chat/mockChatTypes';
import { MessageSquare, Users } from 'lucide-react';

interface NearbyDiscussionPromptProps {
  cluster: NearbyDiscussionCluster;
  onJoin: (cluster: NearbyDiscussionCluster) => void;
}

export const NearbyDiscussionPrompt: React.FC<NearbyDiscussionPromptProps> = ({
  cluster,
  onJoin,
}) => {
  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-2xl bg-indigo-950/95 backdrop-blur-md border border-indigo-500/50 shadow-2xl text-white animate-bounce select-none">
      <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
        <Users className="w-4 h-4" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
          <span>Obrolan Terdekat</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
            {cluster.participantIds.length} Anggota
          </span>
        </div>
        <span className="text-[10.5px] text-indigo-200/80 truncate max-w-xs">
          Topik: {cluster.topic}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onJoin(cluster)}
        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs transition-colors shadow-md"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>Gabung Obrolan</span>
      </button>
    </div>
  );
};
