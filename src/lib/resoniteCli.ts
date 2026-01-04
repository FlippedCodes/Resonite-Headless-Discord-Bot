import type { responseDefaultCommand, responseResoniteWorlds, SessionAccessLevel } from '../types';
import { attach } from './docker';

export async function setTickrate(containerId: string, tickrate: number) {
  let output = (await attach(containerId, `tickrate ${tickrate}`)) as responseDefaultCommand;
  if (!output.successful) return output;
  // FIXME: This is a hack in response to unreliable docker command stream
  if (!output.response)
    output = (await attach(containerId, `tickrate ${tickrate}`)) as responseDefaultCommand;
  if (!output.successful) return output;
  return output;
  // TODO: also update the config file
}

export async function getActiveSessions(containerId: string) {
  let output = await attach(containerId, 'worlds');

  if (!output.successful) return output;
  // FIXME: This is a hack in response to unreliable docker command stream
  if (!output.response) output = await attach(containerId, 'worlds');
  if (!(output.successful && output.response)) return output;

  let response = output as responseResoniteWorlds;
  response.worlds = output.response
    .split('\r\n')
    .filter((entry) => entry.search('Users: ') !== -1)
    .map((world) => {
      const maxUsers = world.split('\tMaxUsers: ');
      if (!maxUsers.length) return null;

      const accessLevel = maxUsers[0]?.split('\tAccessLevel: ');
      if (!accessLevel || !accessLevel.length) return null;

      const activeUsers = accessLevel[0]?.split('\tPresent: ');
      if (!activeUsers || !activeUsers.length) return null;

      const users = activeUsers[0]?.split('Users: ');
      if (!users || !users.length) return null;

      const sessionName = users[0]?.replace(/\[\d*\]/g, '').trim();
      if (!sessionName) return null;

      return {
        sessionName: sessionName || 'Failed to Parse',
        users: parseInt(users[1] || '-1'),
        activeUsers: parseInt(activeUsers[1] || '-1'),
        maxUsers: parseInt(maxUsers[1] || '-1'),
        accessLevel: accessLevel[1] as SessionAccessLevel,
      };
    })
    .filter((entry) => entry !== null);

  return response;
}
