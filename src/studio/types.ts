import { AvatarConfig, UserDiscipline } from '@/types/database.types';

export type StudioRoomType = 'lobby' | 'programming' | 'art' | 'design' | 'meeting' | 'lounge' | 'audio';

export interface RoomDefinition {
  id: string;
  type: StudioRoomType;
  name: string;
  color: number;
  x: number;
  y: number;
  width: number;
  height: number;
  description: string;
}

export interface DoorwayDefinition {
  id: string;
  name: string;
  fromRoom: StudioRoomType;
  toRoom: StudioRoomType;
  x: number;
  y: number;
  width: number;
  height: number;
  clearanceBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export type InteractionType =
  | 'board'
  | 'monitor'
  | 'desk'
  | 'meeting_table'
  | 'canvas'
  | 'directory'
  | 'coffee'
  | 'arcade'
  | 'moodboard'
  | 'art_review'
  | 'art_director'
  | 'mechanic_board'
  | 'flow_board'
  | 'balancing_board'
  | 'lead_designer'
  | 'audio_direction'
  | 'lead_audio'
  | 'audio_listening'
  | 'music_workstation'
  | 'sfx_workstation'
  | 'presentation_screen'
  | 'meeting_board'
  | 'project_summary_board'
  | 'meeting_leader'
  | 'team_presence'
  | 'announcement_board'
  | 'plaza_project_status'
  | 'studio_directory';

export type WorkstationStatus = 'available' | 'assigned_offline' | 'assigned_active';

export interface WorkstationMemberData {
  name: string;
  avatarUrl?: string;
  discipline: UserDiscipline;
  roleTitle: string;
  currentGoal: string;
  progressPercentage: number;
  status:
    | 'In Flow'
    | 'Reviewing PR'
    | 'Building'
    | 'Pair Programming'
    | 'Debugging'
    | 'Idle'
    | 'Creating Concept'
    | 'Balancing Economy'
    | 'Drafting GDD'
    | 'Prototyping'
    | 'Scoring'
    | 'Mastering SFX'
    | 'Audio Mixing'
    | 'Sound Design';
  currentTaskTitle: string;
  isAssigned: boolean;
  assignedUserId?: string;
  isOnline?: boolean;
  isPresentInRoom?: boolean;
  seatOffset?: { x: number; y: number };
  externalWorkLink?: {
    label: string;
    url: string;
  };
  contextBubble?: string;
}

export interface ArtMoodboardItem {
  id: string;
  title: string;
  category: string;
  colorAccent: string;
  description: string;
  tags: string[];
  externalUrl?: string;
}

export interface ArtReviewItem {
  id: string;
  assetName: string;
  ownerName: string;
  category: string;
  reviewState: 'pending' | 'approved' | 'changes_requested';
  progressPercentage: number;
  feedbackNotes?: string;
  externalAssetUrl?: string;
}

export interface ArtDirectorOverview {
  directorName: string;
  roleTitle: string;
  currentVisualDirection: string;
  colorPaletteKeys: string[];
  activeMilestone: string;
  itemsWaitingReviewCount: number;
  blockers: string[];
}

export interface DesignMechanicItem {
  id: string;
  name: string;
  owner: string;
  category: 'Combat' | 'Traversal' | 'Progression' | 'Economy' | 'Narrative';
  status: 'In Concept' | 'Prototyped' | 'In Balance' | 'Approved';
  progress: number;
  reviewState: 'pending' | 'approved' | 'changes_requested';
  description: string;
}

export interface DesignFlowItem {
  id: string;
  title: string;
  levelOrPhase: string;
  targetPacing: string;
  summary: string;
  coreChallenge: string;
  externalDocUrl?: string;
}

export interface DesignBalancingItem {
  id: string;
  parameterName: string;
  category: 'Player Combat' | 'Enemy Stats' | 'Economy Drop' | 'Difficulty Curve';
  currentValue: string;
  targetBaseline: string;
  notes: string;
  reviewState: 'pending' | 'approved' | 'changes_requested';
}

export interface LeadDesignOverview {
  leadName: string;
  roleTitle: string;
  activeDesignGoals: string[];
  mechanicsInReviewCount: number;
  blockedItems: string[];
  overallDesignProgress: number;
  corePillars: string[];
}

export interface AudioMusicTrack {
  id: string;
  trackName: string;
  owner: string;
  progress: number;
  status: 'Composing' | 'Arranging' | 'Mixing' | 'Mastered' | 'Approved';
  reviewState: 'pending' | 'approved' | 'changes_requested';
  duration: string;
  bpm: number;
  category: 'Combat' | 'Exploration' | 'Boss' | 'Cutscene' | 'Menu';
  notes?: string;
  externalUrl?: string;
}

export interface AudioSfxItem {
  id: string;
  sfxName: string;
  category: 'Footsteps' | 'Weapons' | 'UI' | 'Ambience' | 'Creatures';
  owner: string;
  progress: number;
  status: 'Recording' | 'Synthesizing' | 'Mastering' | 'In Game Ready';
  variationCount?: number;
  reviewState: 'pending' | 'approved' | 'changes_requested';
  notes?: string;
}

export interface AudioListeningReviewItem {
  id: string;
  title: string;
  category: 'Music' | 'SFX' | 'Voice' | 'Ambience';
  author: string;
  duration: string;
  status: 'Awaiting Feedback' | 'Revision Submitted' | 'Final Mix Check';
  reviewState: 'pending' | 'approved' | 'changes_requested';
  waveformProfile: number[]; // Array of amplitudes (0-100) for mock visualizer
  feedbackNotes: string;
  tags: string[];
}

export interface AudioDirectionData {
  musicDirection: string;
  ambienceDirection: string;
  sfxStyle: string;
  currentPriorities: string[];
  blockedItems: string[];
  audioEngineStack: string;
  guidelines: string[];
}

export interface LeadAudioOverview {
  leadName: string;
  roleTitle: string;
  activeAudioGoals: string[];
  itemsWaitingReviewCount: number;
  blockedItems: string[];
  overallAudioProgress: number;
  pillarAesthetics: string[];
}

export interface MeetingSeatData {
  id: string;
  seatIndex: number;
  x: number;
  y: number;
  facing: 'up' | 'down' | 'left' | 'right';
  occupiedBy: string | null;
  occupantName?: string;
  occupantDiscipline?: UserDiscipline;
}

export interface MeetingAgendaItem {
  id: string;
  time: string;
  topic: string;
  presenter: string;
  status: 'done' | 'active' | 'upcoming';
}

export interface MeetingDecision {
  id: string;
  title: string;
  outcome: string;
  decidedBy: string;
}

export interface MeetingActionItem {
  id: string;
  task: string;
  assignee: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface MeetingParticipant {
  name: string;
  role: string;
  discipline: UserDiscipline;
  status: 'present' | 'remote' | 'speaking';
}

export interface MeetingSessionData {
  meetingTitle: string;
  leaderName: string;
  currentTopic: string;
  startedAt: string;
  participants: MeetingParticipant[];
  agenda: MeetingAgendaItem[];
  decisions: MeetingDecision[];
  actionItems: MeetingActionItem[];
}

export interface PresentationSlideData {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  type: 'slide' | 'figma' | 'document' | 'report';
  contentPreview: string;
  bulletPoints?: string[];
  metrics?: Array<{ label: string; value: string }>;
  externalUrl?: string;
}

export interface PresentationScreenData {
  deckTitle: string;
  activeSlideIndex: number;
  slides: PresentationSlideData[];
  presenterName: string;
}

export interface ProjectSummaryData {
  projectName: string;
  currentMilestone: string;
  targetReleaseDate: string;
  overallProgress: number;
  activeGoals: Array<{
    department: string;
    goal: string;
    progress: number;
    owner: string;
  }>;
  blockers: Array<{
    id: string;
    title: string;
    severity: 'critical' | 'high' | 'medium';
    department: string;
  }>;
  waitingReview: Array<{
    id: string;
    item: string;
    submittedBy: string;
    type: 'Code PR' | 'Art Asset' | 'Design Spec' | 'Audio Track';
  }>;
}

export interface StudioDirectoryRoom {
  id: string;
  name: string;
  discipline: string;
  purpose: string;
  directionGuide: string;
  onlineCount: number;
  activeLeads: string[];
  status: 'active' | 'in_review' | 'available' | 'future';
}

export interface StudioDirectoryData {
  studioName: string;
  currentProject: string;
  rooms: StudioDirectoryRoom[];
}

export interface TeamPresenceMember {
  id: string;
  name: string;
  role: string;
  discipline: UserDiscipline;
  isOnline: boolean;
  currentRoom: string;
  status: string;
  currentTask: string;
}

export interface TeamPresenceBoardData {
  studioName: string;
  totalMembers: number;
  onlineCount: number;
  members: TeamPresenceMember[];
}

export interface AnnouncementItem {
  id: string;
  title: string;
  category: 'Milestone' | 'Review' | 'Notice' | 'Social';
  author: string;
  date: string;
  priority: 'normal' | 'high' | 'urgent';
  content: string;
  actionText?: string;
  actionUrl?: string;
}

export interface AnnouncementBoardData {
  currentMilestone: string;
  announcements: AnnouncementItem[];
}

export interface PlazaProjectStatusData {
  projectName: string;
  milestone: string;
  overallProgress: number;
  blockedCount: number;
  waitingReviewCount: number;
  activeSprint: string;
  daysRemainingInSprint: number;
  topPriorityGoal: string;
  quickMetrics: Array<{ label: string; value: string }>;
}

export interface InteractiveObjectDef {
  id: string;
  name: string;
  type: InteractionType;
  x: number;
  y: number;
  width: number;
  height: number;
  roomType: StudioRoomType;
  title: string;
  description: string;
  actionText: string;
  icon?: string;
  workstationStatus?: WorkstationStatus;
  workstationData?: WorkstationMemberData;
  moodboardItems?: ArtMoodboardItem[];
  reviewItems?: ArtReviewItem[];
  artDirectorOverview?: ArtDirectorOverview;
  mechanicItems?: DesignMechanicItem[];
  flowItems?: DesignFlowItem[];
  balancingItems?: DesignBalancingItem[];
  leadDesignOverview?: LeadDesignOverview;
  musicTracks?: AudioMusicTrack[];
  sfxItems?: AudioSfxItem[];
  listeningItems?: AudioListeningReviewItem[];
  audioDirectionData?: AudioDirectionData;
  leadAudioOverview?: LeadAudioOverview;
  meetingSessionData?: MeetingSessionData;
  presentationScreenData?: PresentationScreenData;
  projectSummaryData?: ProjectSummaryData;
  meetingSeats?: MeetingSeatData[];
  directoryData?: StudioDirectoryData;
  teamPresenceData?: TeamPresenceBoardData;
  announcementData?: AnnouncementBoardData;
  plazaProjectStatusData?: PlazaProjectStatusData;
  contextBubble?: string;
}

export interface PlayerNetworkState {
  userId: string;
  displayName: string;
  username: string;
  discipline: UserDiscipline;
  avatarConfig?: AvatarConfig;
  x: number;
  y: number;
  vx: number;
  vy: number;
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  currentRoom: string;
  isWorkingAtDesk?: boolean;
  workstationId?: string;
  chatMessage?: string;
  chatTimestamp?: number;
  directChatTargetId?: string;
  directChatTargetName?: string;
  directChatTimestamp?: number;
  lastUpdated: number;
}

export interface StudioBridgeEvents {
  onRoomChange?: (room: RoomDefinition) => void;
  onZoneChange?: (zoneName: string | null) => void;
  onObjectInteract?: (object: InteractiveObjectDef) => void;
  onNearbyObjectChange?: (object: InteractiveObjectDef | null) => void;
  onNearbyMemberChange?: (member: WorkstationMemberData | PlayerNetworkState | null) => void;
  onNearbyMembersListChange?: (members: WorkstationMemberData[]) => void;
  onMemberInspect?: (member: WorkstationMemberData | PlayerNetworkState) => void;
  onPlayerClick?: (player: PlayerNetworkState) => void;
  onWorkstationSit?: (workstation: InteractiveObjectDef) => void;
  onWorkstationLeave?: () => void;
  onNetworkBroadcast?: (state: PlayerNetworkState) => void;
  onPresenceUpdate?: (onlineCount: number, members: PlayerNetworkState[]) => void;
  onPlayerChat?: (message: string) => void;
  onNearbyDiscussionChange?: (cluster: any | null) => void;
  onSceneReady?: () => void;
}
