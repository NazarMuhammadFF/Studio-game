import { UserDiscipline, AvatarConfig } from '@/types/database.types';

export type ConversationType = 'direct' | 'group' | 'room';

export type MemberStatus = 'online' | 'in_flow' | 'busy' | 'offline';

export interface MockChatParticipant {
  id: string;
  name: string;
  discipline: UserDiscipline;
  roleTitle: string;
  avatarUrl?: string;
  avatarConfig?: AvatarConfig;
  status: MemberStatus;
  statusMessage?: string;
  currentRoom: string;
  isCurrentUser?: boolean;
  isLive?: boolean;
}

export interface MockChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderDiscipline?: UserDiscipline;
  content: string;
  createdAt: string;
  replyToId?: string;
  delivery?: 'sending' | 'sent' | 'failed';
  error?: string;
  isSystem?: boolean;
}

export interface MockConversation {
  id: string;
  type: ConversationType;
  name: string;
  roomId?: string; // e.g. 'programming', 'art', 'design', 'audio', 'meeting', 'lobby'
  participantIds: string[];
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  lastMessageSenderName?: string;
  isTyping?: boolean;
  typingParticipantName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NearbyDiscussionCluster {
  id: string;
  name: string;
  room: string;
  x: number;
  y: number;
  radius: number;
  participantIds: string[];
  topic: string;
}

export const ROOM_COLLEAGUES: Record<string, string[]> = {
  programming: ['colleague_alex', 'colleague_maya', 'colleague_liam'],
  art: ['colleague_elena', 'colleague_kenji', 'colleague_clara'],
  design: ['colleague_maya_lin', 'colleague_lucas'],
  audio: ['colleague_marcus'],
  meeting: ['colleague_sarah'],
  lounge: ['colleague_sarah'],
  lobby: ['colleague_alex', 'colleague_maya', 'colleague_sarah'],
};
