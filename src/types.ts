// type sonething = {
//   anyObject: object,
//   labels: {[key:string]: string},
//   definedObject: {value: string, value2: number}
// }

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
