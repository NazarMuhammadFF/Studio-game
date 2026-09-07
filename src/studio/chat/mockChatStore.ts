import type { Profile } from '@/types/database.types';
import type { PlayerNetworkState } from '@/studio/types';
import { connectDirectMessages, type DirectMessageRow } from './liveDirectMessages';
import { useState, useEffect } from 'react';
import {
  MockChatParticipant,
  MockChatMessage,
  MockConversation,
  NearbyDiscussionCluster,
  ROOM_COLLEAGUES,
} from './mockChatTypes';

// Initial Mock Studio Team Participants
export const INITIAL_PARTICIPANTS: MockChatParticipant[] = [
  {
    id: 'local_player',
    name: 'Anda (Player)',
    discipline: 'Programmer',
    roleTitle: 'Gameplay Lead Developer',
    status: 'online',
    statusMessage: 'Mengembangkan sistem komunikasi studio',
    currentRoom: 'Central Plaza & Lobby',
    isCurrentUser: true,
  },
  {
    id: 'colleague_alex',
    name: 'Alex Rivera',
    discipline: 'Programmer',
    roleTitle: 'Physics & Engine Lead',
    status: 'in_flow',
    statusMessage: 'Tuning 2D collision offsets & prediction',
    currentRoom: 'Engineering & Code Lab',
  },
  {
    id: 'colleague_maya',
    name: 'Maya Chen',
    discipline: 'Programmer',
    roleTitle: 'Gameplay & Shaders Specialist',
    status: 'online',
    statusMessage: 'Mengoptimalkan shader neon pulse',
    currentRoom: 'Engineering & Code Lab',
  },
  {
    id: 'colleague_liam',
    name: 'Liam Vance',
    discipline: 'Programmer',
    roleTitle: 'Realtime Sync & State Architect',
    status: 'busy',
    statusMessage: 'Benchmarking delta compression',
    currentRoom: 'Conference Hub',
  },
  {
    id: 'colleague_elena',
    name: 'Elena Rostova',
    discipline: 'Artist',
    roleTitle: 'Studio Art Director',
    status: 'in_flow',
    statusMessage: 'Reviewing character turnarounds',
    currentRoom: 'Art & Visual Studio',
  },
  {
    id: 'colleague_kenji',
    name: 'Kenji Sato',
    discipline: 'Artist',
    roleTitle: 'Lead 2D Character Artist',
    status: 'online',
    statusMessage: 'Finalizing 4-dir sprite sheets',
    currentRoom: 'Art & Visual Studio',
  },
  {
    id: 'colleague_clara',
    name: 'Clara Oswald',
    discipline: 'Artist',
    roleTitle: 'Environment & Concept Artist',
    status: 'online',
    statusMessage: 'Sketching modular room wall tiles',
    currentRoom: 'Art & Visual Studio',
  },
  {
    id: 'colleague_maya_lin',
    name: 'Maya Lin',
    discipline: 'Game Designer',
    roleTitle: 'Lead Systems & Combat Designer',
    status: 'in_flow',
    statusMessage: 'Calibrating parry window timing',
    currentRoom: 'Game Design Bay',
  },
  {
    id: 'colleague_lucas',
    name: 'Lucas Zhao',
    discipline: 'Game Designer',
    roleTitle: 'Level & Narrative Designer',
    status: 'online',
    statusMessage: 'Mapping Sector 1 verticality routes',
    currentRoom: 'Game Design Bay',
  },
  {
    id: 'colleague_marcus',
    name: 'Marcus Vance',
    discipline: 'Audio',
    roleTitle: 'Lead Sound & Audio Engineer',
    status: 'in_flow',
    statusMessage: 'Mastering dynamic combat loop',
    currentRoom: 'Audio & Sound Studio',
  },
  {
    id: 'colleague_sarah',
    name: 'Sarah Jenkins',
    discipline: 'Producer',
    roleTitle: 'Studio Lead & Meeting Coordinator',
    status: 'online',
    statusMessage: 'Menyiapkan agenda playtest Sprint 14',
    currentRoom: 'Conference Hub',
  },
];

// Initial Contextual Room Conversations
const INITIAL_CONVERSATIONS: MockConversation[] = [
  // Room Conversations (nama obrolan aktif berdasarkan orang-orang di dalam room chat tersebut)
  {
    id: 'conv_room_programming',
    type: 'room',
    name: 'Alex Rivera, Maya Chen, Liam Vance',
    roomId: 'programming',
    participantIds: ['local_player', 'colleague_alex', 'colleague_maya', 'colleague_liam'],
    unreadCount: 0,
    lastMessage: 'PR #42 collision resolution sudah di-merge ke branch staging.',
    lastMessageTime: '10:14',
    lastMessageSenderName: 'Alex Rivera',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'conv_room_art',
    type: 'room',
    name: 'Elena Rostova, Kenji Sato, Clara Oswald',
    roomId: 'art',
    participantIds: ['local_player', 'colleague_elena', 'colleague_kenji', 'colleague_clara'],
    unreadCount: 0,
    lastMessage: 'Turnaround karakter utama sudah siap di-review di Review Board.',
    lastMessageTime: '09:45',
    lastMessageSenderName: 'Kenji Sato',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: 'conv_room_design',
    type: 'room',
    name: 'Maya Lin, Lucas Zhao',
    roomId: 'design',
    participantIds: ['local_player', 'colleague_maya_lin', 'colleague_lucas'],
    unreadCount: 0,
    lastMessage: 'Timing parry 9 frame terasa solid saat testing dengan gamepad.',
    lastMessageTime: '11:02',
    lastMessageSenderName: 'Maya Lin',
    createdAt: new Date(Date.now() - 5400000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'conv_room_audio',
    type: 'room',
    name: 'Marcus Vance',
    roomId: 'audio',
    participantIds: ['local_player', 'colleague_marcus'],
    unreadCount: 0,
    lastMessage: 'Stems soundtrack combat sudah di-upload ke listening station.',
    lastMessageTime: '08:30',
    lastMessageSenderName: 'Marcus Vance',
    createdAt: new Date(Date.now() - 9000000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'conv_room_meeting',
    type: 'room',
    name: 'Sarah Jenkins',
    roomId: 'meeting',
    participantIds: ['local_player', 'colleague_sarah'],
    unreadCount: 0,
    lastMessage: 'Playtest internal Alpha dijadwalkan pukul 15.00 di meja meeting utama.',
    lastMessageTime: '11:20',
    lastMessageSenderName: 'Sarah Jenkins',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    updatedAt: new Date(Date.now() - 450000).toISOString(),
  },
  {
    id: 'conv_room_lobby',
    type: 'room',
    name: 'Alex Rivera, Maya Chen, Sarah Jenkins',
    roomId: 'lobby',
    participantIds: ['local_player', 'colleague_alex', 'colleague_maya', 'colleague_sarah'],
    unreadCount: 0,
    lastMessage: 'Kopi hangat baru diseduh di Plaza Coffee Bar ☕',
    lastMessageTime: '10:50',
    lastMessageSenderName: 'Maya Chen',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(),
  },

  // Direct Conversations
  {
    id: 'conv_direct_alex',
    type: 'direct',
    name: 'Alex Rivera',
    participantIds: ['local_player', 'colleague_alex'],
    unreadCount: 0,
    lastMessage: 'Halo! Ada kendala dengan physics body di Phaser Arcade?',
    lastMessageTime: '10:25',
    lastMessageSenderName: 'Alex Rivera',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'conv_direct_elena',
    type: 'direct',
    name: 'Elena Rostova',
    participantIds: ['local_player', 'colleague_elena'],
    unreadCount: 0,
    lastMessage: 'Palet warna neon cyan dan magenta sudah disetujui untuk Alpha.',
    lastMessageTime: '09:55',
    lastMessageSenderName: 'Elena Rostova',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },

  // Sample Group Conversation
  {
    id: 'conv_group_combat_strike_team',
    type: 'group',
    name: 'Combat Strike Team ⚡',
    participantIds: ['local_player', 'colleague_alex', 'colleague_maya_lin', 'colleague_marcus'],
    unreadCount: 1,
    lastMessage: 'Perlu sinkronisasi antara frame hit box dengan SFX impact.',
    lastMessageTime: '11:15',
    lastMessageSenderName: 'Marcus Vance',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 120000).toISOString(),
  },
];

const INITIAL_MESSAGES: Record<string, MockChatMessage[]> = {
  conv_room_programming: [
    {
      id: 'msg_prog_1',
      conversationId: 'conv_room_programming',
      senderId: 'colleague_alex',
      senderName: 'Alex Rivera',
      senderDiscipline: 'Programmer',
      content: 'Pagi tim dev! Bounding box collision sudah saya perketat di bagian kaki avatar.',
      createdAt: '10:10',
    },
    {
      id: 'msg_prog_2',
      conversationId: 'conv_room_programming',
      senderId: 'colleague_maya',
      senderName: 'Maya Chen',
      senderDiscipline: 'Programmer',
      content: 'Mantap Alex, sekarang pergerakan avatar terasa sangat responsif dan tidak tersangkut lagi.',
      createdAt: '10:12',
    },
    {
      id: 'msg_prog_3',
      conversationId: 'conv_room_programming',
      senderId: 'colleague_alex',
      senderName: 'Alex Rivera',
      senderDiscipline: 'Programmer',
      content: 'PR #42 collision resolution sudah di-merge ke branch staging.',
      createdAt: '10:14',
    },
  ],
  conv_room_art: [
    {
      id: 'msg_art_1',
      conversationId: 'conv_room_art',
      senderId: 'colleague_elena',
      senderName: 'Elena Rostova',
      senderDiscipline: 'Artist',
      content: 'Kenji, bagaimana progres turnaround 4 arah untuk player?',
      createdAt: '09:40',
    },
    {
      id: 'msg_art_2',
      conversationId: 'conv_room_art',
      senderId: 'colleague_kenji',
      senderName: 'Kenji Sato',
      senderDiscipline: 'Artist',
      content: 'Turnaround karakter utama sudah siap di-review di Review Board.',
      createdAt: '09:45',
    },
  ],
  conv_room_design: [
    {
      id: 'msg_des_1',
      conversationId: 'conv_room_design',
      senderId: 'colleague_lucas',
      senderName: 'Lucas Zhao',
      senderDiscipline: 'Game Designer',
      content: 'Pacing di Sector 1 terasa pas setelah kita potong durasi platforming awal.',
      createdAt: '10:55',
    },
    {
      id: 'msg_des_2',
      conversationId: 'conv_room_design',
      senderId: 'colleague_maya_lin',
      senderName: 'Maya Lin',
      senderDiscipline: 'Game Designer',
      content: 'Timing parry 9 frame terasa solid saat testing dengan gamepad.',
      createdAt: '11:02',
    },
  ],
  conv_room_audio: [
    {
      id: 'msg_aud_1',
      conversationId: 'conv_room_audio',
      senderId: 'colleague_marcus',
      senderName: 'Marcus Vance',
      senderDiscipline: 'Audio',
      content: 'Stems soundtrack combat sudah di-upload ke listening station.',
      createdAt: '08:30',
    },
  ],
  conv_room_meeting: [
    {
      id: 'msg_meet_1',
      conversationId: 'conv_room_meeting',
      senderId: 'colleague_sarah',
      senderName: 'Sarah Jenkins',
      senderDiscipline: 'Producer',
      content: 'Playtest internal Alpha dijadwalkan pukul 15.00 di meja meeting utama.',
      createdAt: '11:20',
    },
  ],
  conv_room_lobby: [
    {
      id: 'msg_lob_1',
      conversationId: 'conv_room_lobby',
      senderId: 'colleague_maya',
      senderName: 'Maya Chen',
      senderDiscipline: 'Programmer',
      content: 'Kopi hangat baru diseduh di Plaza Coffee Bar ☕',
      createdAt: '10:50',
    },
  ],
  conv_direct_alex: [
    {
      id: 'msg_dir_alex_1',
      conversationId: 'conv_direct_alex',
      senderId: 'colleague_alex',
      senderName: 'Alex Rivera',
      senderDiscipline: 'Programmer',
      content: 'Halo! Ada kendala dengan physics body di Phaser Arcade?',
      createdAt: '10:25',
    },
  ],
  conv_direct_elena: [
    {
      id: 'msg_dir_elena_1',
      conversationId: 'conv_direct_elena',
      senderId: 'colleague_elena',
      senderName: 'Elena Rostova',
      senderDiscipline: 'Artist',
      content: 'Palet warna neon cyan dan magenta sudah disetujui untuk Alpha.',
      createdAt: '09:55',
    },
  ],
  conv_group_combat_strike_team: [
    {
      id: 'msg_grp_1',
      conversationId: 'conv_group_combat_strike_team',
      senderId: 'colleague_maya_lin',
      senderName: 'Maya Lin',
      senderDiscipline: 'Game Designer',
      content: 'Perlu sinkronisasi antara frame hit box dengan SFX impact.',
      createdAt: '11:15',
    },
  ],
};

// Simulated Nearby Discussion Clusters across studio
export const NEARBY_DISCUSSIONS: NearbyDiscussionCluster[] = [
  {
    id: 'disc_meeting_lounge',
    name: 'Pre-Meeting Discussion',
    room: 'meeting',
    x: 515,
    y: 365,
    radius: 75,
    participantIds: ['colleague_sarah', 'colleague_liam'],
    topic: 'Evaluasi Latensi & Pacing Alpha Sprint 14',
  },
  {
    id: 'disc_plaza_coffee',
    name: 'Coffee Break & Brainstorming',
    room: 'lobby',
    x: 495,
    y: 765,
    radius: 70,
    participantIds: ['colleague_alex', 'colleague_maya'],
    topic: 'Optimasi Shader Lighting & Canvas Performance',
  },
  {
    id: 'disc_art_critique',
    name: 'Art Direction Critique',
    room: 'art',
    x: 920,
    y: 350,
    radius: 70,
    participantIds: ['colleague_elena', 'colleague_kenji'],
    topic: 'Konsistensi Siluet & Pacing Frame Animasi',
  },
];

// Contextual Simulated Replies based on member persona
const MOCK_REPLIES: Record<string, string[]> = {
  colleague_alex: [
    'Siap! Logika deterministic collision sudah dicek di Phaser Arcade.',
    'Bagus sekali idenya. Saya buatkan branch baru untuk integrasi fitur ini.',
    'Aman, tidak ada memory leak yang terdeteksi pada frame loop.',
    'Oke, nanti kita cek bareng saat build verification di cluster CI/CD.',
  ],
  colleague_maya: [
    'Keren! Efek shader pencahayaannya bakal langsung kelihatan lebih hidup.',
    'Saya lagi rapikan procedural texture, sebentar lagi siap diuji.',
    'Sip, mari kita pasangkan dengan efek partikel neon di plaza.',
  ],
  colleague_liam: [
    'Delta sync network sudah saya kompresi, paket broadcast jadi jauh lebih hemat.',
    'Mantap, sistem inter-tab BroadcastChannel berjalan tanpa latency.',
  ],
  colleague_elena: [
    'Secara visual arahnya sudah sesuai dengan tone cyberpunk lo-fi studio kita.',
    'Kontras warnanya sudah pas di atas tile lantai gelap.',
    'Approved dari tim Art. Silakan dilanjutkan ke tahap berikutnya!',
  ],
  colleague_kenji: [
    'Frame animasinya sudah selaras dengan kecepatan gerak 175px/detik.',
    'Sprite sheet turnaround 4 arah sudah siap pakai!',
  ],
  colleague_clara: [
    'Tekstur modular lantainya sudah saya sesuaikan dengan layout pintu.',
    'Bagus, ruangannya jadi terlihat jauh lebih berkarakter sekarang.',
  ],
  colleague_maya_lin: [
    'Mekanik gameplay-nya terasa sangat satisfying saat di-test di gamepad.',
    'Window parry 9 frame sudah optimal untuk skill ceiling pemain.',
    'Data balancing di Combat Board sudah saya perbarui ya.',
  ],
  colleague_lucas: [
    'Level pacing di area ini jadi terasa lebih mengalir dan dinamis.',
    'Saya tambahkan sedikit jalur vertikal di Sector 1 agar lebih seru.',
  ],
  colleague_marcus: [
    'Frekuensi SFX sudah di-EQ agar tidak bertabrakan dengan synth soundtrack.',
    'Audio cue saat interact terasa crisp dan responsif!',
  ],
  colleague_sarah: [
    'Catat di agenda sprint ya. Progres milestone 2 terlihat sangat positif.',
    'Terima kasih update-nya! Nanti kita bahas di sesi all-hands jam 15.00.',
  ],
};

// Global Store State for Local Session
class MockChatStore {
  private participants: MockChatParticipant[] = [...INITIAL_PARTICIPANTS];
  private conversations: MockConversation[] = [...INITIAL_CONVERSATIONS];
  private messages: Record<string, MockChatMessage[]> = { ...INITIAL_MESSAGES };
  private listeners: Set<() => void> = new Set();
  private speechBubbleCallback?: (memberId: string, message: string) => void;

  private liveSession: ReturnType<typeof connectDirectMessages> | null = null;
  public chatError: string | null = null;

  public upsertLiveParticipant(player: PlayerNetworkState) {
    const participant: MockChatParticipant = {id:player.userId,name:player.displayName,discipline:player.discipline || 'Other',roleTitle:'Anggota studio',status:'online',currentRoom:player.currentRoom,avatarConfig:player.avatarConfig,isLive:true};
    const previous=this.getParticipant(player.userId);
    if(previous) { if(JSON.stringify(previous)===JSON.stringify(participant))return; Object.assign(previous,participant); }
    else this.participants.push(participant);
    this.notify();
  }

  public markLiveOffline(id: string) {
    const participant=this.getParticipant(id);
    if(participant?.isLive){participant.status='offline';participant.currentRoom='';this.notify();}
  }

  public isLiveConversation(id: string) {
    const conv=this.getConversation(id);
    return conv?.type==='direct' && conv.participantIds.some(id=>this.getParticipant(id)?.isLive);
  }

  public startLiveSession(profile: Profile, projectId: string) {
    this.liveSession?.dispose();
    const receive=(rows: DirectMessageRow[], initial: boolean) => {
      for(const row of rows){
        const own=row.sender_id===profile.id, peer=own?row.recipient:row.sender;
        if(!peer)continue;
        if(!this.getParticipant(peer.id))this.participants.push({id:peer.id,name:peer.display_name,discipline:peer.discipline || 'Other',roleTitle:'Anggota workspace',status:'offline',currentRoom:'',avatarConfig:peer.avatar_config,isLive:true});
        const conv=this.getOrCreateDirectConversation(peer.id);
        const list=this.messages[conv.id] ||= [];
        const existing=list.find(m=>m.id===row.id);
        if(existing){existing.delivery='sent';existing.error=undefined;continue;}
        const time=new Date(row.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
        list.push({id:row.id,conversationId:conv.id,senderId:own?'local_player':peer.id,senderName:own?profile.display_name:peer.display_name,senderDiscipline:own?profile.discipline:peer.discipline,content:row.content,createdAt:time,delivery:'sent'});
        conv.lastMessage=row.content;conv.lastMessageTime=time;conv.lastMessageSenderName=own?profile.display_name:peer.display_name;conv.updatedAt=row.created_at;
        if(!own&&!initial)conv.unreadCount++;
      }
      this.notify();
    };
    const session=connectDirectMessages(profile,projectId,receive,error=>{this.chatError=error;this.notify();});
    this.liveSession=session;
    return () => {
      session.dispose();
      if(this.liveSession!==session)return;
      this.liveSession=null;
      const liveIds=new Set(this.participants.filter(p=>p.isLive).map(p=>p.id));
      this.conversations=this.conversations.filter(c=>{if(c.participantIds.some(id=>liveIds.has(id))){delete this.messages[c.id];return false;}return true;});
      this.participants=this.participants.filter(p=>!p.isLive);this.chatError=null;this.notify();
    };
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public setSpeechBubbleCallback(cb: (memberId: string, message: string) => void) {
    this.speechBubbleCallback = cb;
  }

  public getParticipants(): MockChatParticipant[] {
    return this.participants;
  }

  public getParticipant(id: string): MockChatParticipant | undefined {
    return this.participants.find((p) => p.id === id);
  }

  public getConversations(): MockConversation[] {
    return this.conversations;
  }

  public getConversation(id: string): MockConversation | undefined {
    return this.conversations.find((c) => c.id === id);
  }

  public getMessages(conversationId: string): MockChatMessage[] {
    return this.messages[conversationId] || [];
  }

  public getRoomConversation(roomType: string): MockConversation {
    let found = this.conversations.find(
      (c) => c.type === 'room' && c.roomId === roomType
    );

    const allowedInRoom = ROOM_COLLEAGUES[roomType] || [];
    const colleagueNames = allowedInRoom
      .map((id) => this.getParticipant(id)?.name)
      .filter((name): name is string => Boolean(name));
    const dynamicChatName =
      colleagueNames.length > 0
        ? colleagueNames.join(', ')
        : 'Hanya Anda (Ruangan Kosong)';

    if (!found) {
      found = {
        id: `conv_room_${roomType}`,
        type: 'room',
        name: dynamicChatName,
        roomId: roomType,
        participantIds: ['local_player', ...allowedInRoom],
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.conversations.push(found);
    } else {
      found.name = dynamicChatName;
    }

    return found;
  }

  public getOrCreateDirectConversation(participantId: string): MockConversation {
    const existing = this.conversations.find(
      (c) =>
        c.type === 'direct' &&
        c.participantIds.includes('local_player') &&
        c.participantIds.includes(participantId)
    );

    if (existing) return existing;

    const participant = this.getParticipant(participantId);
    const newConv: MockConversation = {
      id: `conv_direct_${participantId}_${Date.now()}`,
      type: 'direct',
      name: participant ? participant.name : 'Rekan Tim',
      participantIds: ['local_player', participantId],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.conversations.unshift(newConv);
    this.messages[newConv.id] = [];
    this.notify();
    return newConv;
  }

  public createGroupConversation(
    name: string,
    participantIds: string[],
    initialSystemMessage?: string
  ): MockConversation {
    const allIds = Array.from(new Set(['local_player', ...participantIds]));
    const newConv: MockConversation = {
      id: `conv_group_${Date.now()}`,
      type: 'group',
      name: name || 'Grup Diskusi Baru',
      participantIds: allIds,
      unreadCount: 0,
      lastMessage: initialSystemMessage || 'Grup percakapan dibuat.',
      lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.conversations.unshift(newConv);
    this.messages[newConv.id] = [];

    if (initialSystemMessage) {
      this.messages[newConv.id].push({
        id: `sys_${Date.now()}`,
        conversationId: newConv.id,
        senderId: 'system',
        senderName: 'Studio System',
        content: initialSystemMessage,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
      });
    }

    this.notify();
    return newConv;
  }

  public addMemberToConversation(conversationId: string, memberId: string): MockConversation | null {
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (!conv) return null;

    const member = this.getParticipant(memberId);
    const memberName = member ? member.name : 'Anggota';

    if (conv.type === 'direct') {
      // Per specification: convert/start a new group conversation context rather than mutating direct
      const currentOtherId = conv.participantIds.find((id) => id !== 'local_player') || '';
      const otherParticipant = this.getParticipant(currentOtherId);
      const otherName = otherParticipant ? otherParticipant.name : 'Rekan';

      const groupName = `${otherName} & ${memberName} + Anda`;
      const newGroup = this.createGroupConversation(
        groupName,
        [currentOtherId, memberId],
        `Percakapan diperluas ke grup bersama ${memberName}.`
      );
      return newGroup;
    }

    // Add to existing group
    if (!conv.participantIds.includes(memberId)) {
      conv.participantIds.push(memberId);
      conv.updatedAt = new Date().toISOString();

      const sysMsg: MockChatMessage = {
        id: `sys_${Date.now()}`,
        conversationId: conv.id,
        senderId: 'system',
        senderName: 'Studio System',
        content: `${memberName} telah bergabung ke dalam obrolan.`,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
      };

      this.messages[conv.id] = [...(this.messages[conv.id] || []), sysMsg];
      this.notify();
    }

    return conv;
  }

  public removeMemberFromConversation(conversationId: string, memberId: string) {
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (!conv || conv.type === 'direct') return;

    conv.participantIds = conv.participantIds.filter((id) => id !== memberId);
    conv.updatedAt = new Date().toISOString();

    const member = this.getParticipant(memberId);
    const memberName = member ? member.name : 'Anggota';

    const sysMsg: MockChatMessage = {
      id: `sys_${Date.now()}`,
      conversationId: conv.id,
      senderId: 'system',
      senderName: 'Studio System',
      content: `${memberName} telah meninggalkan percakapan.`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };

    this.messages[conv.id] = [...(this.messages[conv.id] || []), sysMsg];
    this.notify();
  }

  public async sendMessage(conversationId: string, content: string) {
    const trimmed = content.trim();
    if (!trimmed) return;

    if(this.isLiveConversation(conversationId)){
      const conv=this.getConversation(conversationId)!;
      const recipient=conv.participantIds.find(id=>id!=='local_player')!;
      const message: MockChatMessage={id:crypto.randomUUID(),conversationId,senderId:'local_player',senderName:'Anda',content:trimmed,createdAt:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),delivery:'sending'};
      (this.messages[conversationId] ||= []).push(message);this.notify();
      try{
        if(!this.liveSession)throw new Error('Chat belum tersambung. Muat ulang studio.');
        await this.liveSession.send(message.id,recipient,trimmed);
        message.delivery='sent';conv.lastMessage=trimmed;conv.lastMessageTime=message.createdAt;conv.lastMessageSenderName='Anda';
      }catch(error){message.delivery='failed';message.error=error instanceof Error?error.message:'Gagal mengirim pesan.';}
      this.notify();return;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: MockChatMessage = {
      id: `msg_${Date.now()}_user`,
      conversationId,
      senderId: 'local_player',
      senderName: 'Anda',
      senderDiscipline: 'Programmer',
      content: trimmed,
      createdAt: timeStr,
    };

    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }
    this.messages[conversationId].push(userMsg);

    const conv = this.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = trimmed;
      conv.lastMessageTime = timeStr;
      conv.lastMessageSenderName = 'Anda';
      conv.updatedAt = new Date().toISOString();
    }

    // Trigger local player speech bubble in Phaser
    if (this.speechBubbleCallback) {
      this.speechBubbleCallback('local_player', trimmed);
    }

    this.notify();

    // Trigger simulated colleague reply if appropriate
    this.triggerMockReply(conversationId, trimmed);
  }

  private triggerMockReply(conversationId: string, _userMessage: string) {
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (!conv) return;

    // Pick responder
    let responderId: string | null = null;
    if (conv.type === 'direct') {
      responderId = conv.participantIds.find((id) => id !== 'local_player') || null;
    } else if (conv.type === 'room' && conv.roomId) {
      // Chat room: HANYA orang yang berada di ruangan ini yang bisa membalas!
      const allowedInRoom = ROOM_COLLEAGUES[conv.roomId] || [];
      const candidates = conv.participantIds.filter(
        (id) => id !== 'local_player' && allowedInRoom.includes(id)
      );
      if (candidates.length > 0) {
        responderId = candidates[Math.floor(Math.random() * candidates.length)];
      }
    } else {
      const candidates = conv.participantIds.filter((id) => id !== 'local_player');
      if (candidates.length > 0) {
        // Random candidate from group
        responderId = candidates[Math.floor(Math.random() * candidates.length)];
      }
    }

    if (!responderId) return;

    const responder = this.getParticipant(responderId);
    if (!responder || responder.isLive) return;

    // Simulate typing delay
    conv.isTyping = true;
    conv.typingParticipantName = responder.name;
    this.notify();

    const typingDuration = 1200 + Math.random() * 1200;

    window.setTimeout(() => {
      conv.isTyping = false;
      conv.typingParticipantName = undefined;

      const replyPool = MOCK_REPLIES[responderId!] || [
        'Oke sip, segera saya tindak lanjuti!',
        'Sip, noted!',
        'Bagus, mari kita koordinasikan lagi saat playtest nanti.',
      ];
      const replyContent = replyPool[Math.floor(Math.random() * replyPool.length)];
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const replyMsg: MockChatMessage = {
        id: `msg_${Date.now()}_${responderId}`,
        conversationId,
        senderId: responder.id,
        senderName: responder.name,
        senderDiscipline: responder.discipline,
        content: replyContent,
        createdAt: replyTime,
      };

      this.messages[conversationId].push(replyMsg);
      conv.lastMessage = replyContent;
      conv.lastMessageTime = replyTime;
      conv.lastMessageSenderName = responder.name;
      conv.updatedAt = new Date().toISOString();

      // Trigger colleague speech bubble in Phaser world space!
      if (this.speechBubbleCallback) {
        this.speechBubbleCallback(responder.id, replyContent);
      }

      this.notify();
    }, typingDuration);
  }

  public markAsRead(conversationId: string) {
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (conv && conv.unreadCount > 0) {
      conv.unreadCount = 0;
      this.notify();
    }
  }

  public getTotalUnreadCount(): number {
    return this.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }
}

export const mockChatStore = new MockChatStore();

// React Hook to access mock chat state
export function useMockChat() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return mockChatStore.subscribe(() => {
      setTick((t) => t + 1);
    });
  }, []);

  return {
    participants: mockChatStore.getParticipants(),
    conversations: mockChatStore.getConversations(),
    totalUnreadCount: mockChatStore.getTotalUnreadCount(),
    getParticipant: (id: string) => mockChatStore.getParticipant(id),
    getConversation: (id: string) => mockChatStore.getConversation(id),
    getMessages: (conversationId: string) => mockChatStore.getMessages(conversationId),
    getRoomConversation: (roomId: string) => mockChatStore.getRoomConversation(roomId),
    getOrCreateDirectConversation: (participantId: string) =>
      mockChatStore.getOrCreateDirectConversation(participantId),
    createGroupConversation: (name: string, participantIds: string[], initialSystemMessage?: string) =>
      mockChatStore.createGroupConversation(name, participantIds, initialSystemMessage),
    addMemberToConversation: (conversationId: string, memberId: string) =>
      mockChatStore.addMemberToConversation(conversationId, memberId),
    removeMemberFromConversation: (conversationId: string, memberId: string) =>
      mockChatStore.removeMemberFromConversation(conversationId, memberId),
    sendMessage: (conversationId: string, content: string) =>
      mockChatStore.sendMessage(conversationId, content),
    markAsRead: (conversationId: string) => mockChatStore.markAsRead(conversationId),
    setSpeechBubbleCallback: (cb: (memberId: string, message: string) => void) =>
      mockChatStore.setSpeechBubbleCallback(cb),
  };
}
