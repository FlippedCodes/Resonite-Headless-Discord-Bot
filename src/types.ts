// type sonething = {
//   anyObject: object,
//   labels: {[key:string]: string},
//   definedObject: {value: string, value2: number}
// }

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
  Labels: { [key: string]: string; managedByResoniteBot: string };
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
