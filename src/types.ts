export enum SessionAccessLevel {
  Private = 'Private',
  LAN = 'LAN',
  Contacts = 'Contacts',
  ContactsPlus = 'ContactsPlus',
  RegisteredUsers = 'RegisteredUsers',
  Anyone = 'Anyone',
}

export enum logType {
  error = 'error',
  failed = 'failed',
  success = 'success',
}

export enum SaveAsOwner {
  LocalMachine = 'LocalMachine',
  CloudUser = 'CloudUser',
}

export interface RecordId {
  recordId?: string | null;
  ownerId?: string | null;
}

export type dockerMount = {
  Destination: string;
  Mode: 'ro' | 'rw';
  RW: boolean;
  Source: string;
  Type: string;
  Propagation: string;
};

export type container = {
  Id: string;
  Names: string[];
  Image: string;
  ImageID: string;
  Command: string;
  Created: number;
  Ports: string[];
  // Labels: { [key: string]: string | null; discordBot: string, discordBotAccessRole: string, discordBotLogChannel: string | null };
  Labels: {
    discordBot: string;
    discordBotAccessRole: string;
    discordBotLogChannel: string | null;
    'com.docker.compose.project': string | null;
  };
  State: 'exited' | 'created' | 'running';
  Status: string;
  HostConfig: { [key: string]: string };
  NetworkSettings: {
    Networks: { [key: string]: { [key: string]: string } };
  };
  Mounts: dockerMount[];
};

export type responseResoniteWorlds = {
  successful: boolean;
  response: string;
  worlds?: {
    sessionName: string;
    users: number;
    activeUsers: number;
    maxUsers: number;
    accessLevel: SessionAccessLevel;
  }[];
};

export type responseDefaultCommand = {
  successful: boolean;
  response: string;
};

export interface WorldStartupParameters {
  isEnabled?: boolean;
  sessionName?: string | null;
  customSessionId?: string | null;
  description?: string | null;
  maxUsers?: number;
  accessLevel?: SessionAccessLevel;
  useCustomJoinVerifier?: boolean;
  hideFromPublicListing?: boolean | null;
  tags?: (string | null)[] | null;
  mobileFriendly?: boolean;
  loadWorldURL?: string | null;
  loadWorldPresetName?: string | null;
  overrideCorrespondingWorldId?: RecordId | null;
  forcePort?: number | null;
  keepOriginalRoles?: boolean;
  defaultUserRoles?: Record<string, string | null> | null;
  roleCloudVariable?: string | null;
  allowUserCloudVariable?: string | null;
  denyUserCloudVariable?: string | null;
  requiredUserJoinCloudVariable?: string | null;
  requiredUserJoinCloudVariableDenyMessage?: string | null;
  awayKickMinutes?: number;
  parentSessionIds?: (string | null)[] | null;
  autoInviteUsernames?: (string | null)[] | null;
  autoInviteMessage?: string | null;
  saveAsOwner?: SaveAsOwner | null;
  autoRecover?: boolean;
  idleRestartInterval?: number;
  forcedRestartInterval?: number;
  saveOnExit?: boolean;
  autosaveInterval?: number;
  autoSleep?: boolean;
  waitForLogin?: boolean;
}

export interface HeadlessConfig {
  sourceFile?: string | null;
  $schema?: string | null;
  comment?: string | null;
  universeID?: string | null;
  tickRate?: number;
  maxConcurrentAssetTransfers?: number;
  usernameOverride?: string | null;
  loginCredential?: string | null;
  loginPassword?: string | null;
  startWorlds?: (WorldStartupParameters | null)[] | null;
  dataFolder?: string | null;
  cacheFolder?: string | null;
  logsFolder?: string | null;
  allowedUrlHosts?: (string | null)[] | null;
  autoSpawnItems?: (string | null)[] | null;
}
