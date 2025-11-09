export type accessLevel =
  | 'Anyone'
  | 'RegisteredUsers'
  | 'FriendsOfFriends'
  | 'Private'
  | 'Contacts';

  export type container = {
  Id: string;
  Names: string[];
  Image: string;
  ImageID: string;
  Command: string;
  Created: number;
  Ports: string[];
  // Labels: { [key: string]: string | null; discordBot: string, discordBotAccessRole: string, discordBotLogChannel: string | null };
  Labels: { discordBot: string, discordBotAccessRole: string, discordBotLogChannel: string | null };
  State: 'exited' | 'created' | 'running';
  Status: string;
  HostConfig: { [key: string]: string };
  NetworkSettings: {
    Networks: { [key: string]: { [key: string]: string } };
  };
  Mounts: string[];
};

export type responseResoniteWorlds = {
  successful: boolean;
  response: string;
  worlds?: {
    sessionName: string;
    users: number;
    activeUsers: number;
    maxUsers: number;
    accessLevel: accessLevel;
  }[];
};

export type responseDefaultCommand = {
  successful: boolean;
  response: string;
};
