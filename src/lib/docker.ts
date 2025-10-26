import { randomUUIDv7 } from 'bun';

import type { container, responseResoniteWorlds } from '../types';

const dockerEndpoint = 'http://localhost/v1.51/containers/';
const unixEndpoint = '/var/run/docker.sock';

export async function get() {
  const allContainersRaw = await fetch(
    `${dockerEndpoint}json?${new URLSearchParams({ all: 'true' })}`,
    {
      method: 'GET',
      unix: unixEndpoint,
    }
  );
  const allContainers = (await allContainersRaw.json()) as container[];
  return allContainers.filter((container) => container.Labels.managedByResoniteBot === 'true');
}

export async function restart(containerId: string) {
  const responseRaw = await fetch(`${dockerEndpoint}${containerId}/restart`, {
    method: 'POST',
    unix: '/var/run/docker.sock',
  });
  return responseRaw;
}

export async function attach(containerId: string, command: string, rerun: boolean = false) {
  let refId = randomUUIDv7();
  const date = new Date();

  // FIXME: This really has to be refactored and made more reliable
  const kickoff = `AUTOMATED COMMAND START - ${refId} - ${date}`;
  const streamSend = new ReadableStream({
    start(controller) {
      controller.enqueue(kickoff);
      controller.enqueue(command);
      controller.enqueue(`AUTOMATED COMMAND END - ${refId} - ${date}`);
      // unicode ctrl-key + q for escape sequence
      controller.enqueue('\u001bq');
      controller.close();
    },
  });
  const sendCommandResponse = await fetch(
    `${dockerEndpoint}${containerId}/attach?${new URLSearchParams({
      detachKeys: 'ctrl-q',
      stream: 'true',
      stdin: 'true',
    })}`,
    {
      method: 'POST',
      unix: '/var/run/docker.sock',
      body: streamSend,
    }
  );
  if (!(sendCommandResponse.ok && sendCommandResponse.status === 200))
    return {
      successful: false,
      response: sendCommandResponse.statusText,
    } as responseResoniteWorlds;
  // timeout needed due to race condition with stream
  await new Promise((resolve) => setTimeout(resolve, 200));

  const logResponse = await fetch(
    `${dockerEndpoint}${containerId}/logs?${new URLSearchParams({ stdout: 'true', tail: '30' })}`,
    {
      method: 'GET',
      unix: '/var/run/docker.sock',
    }
  );
  if (!(logResponse.ok && logResponse.status === 200 && logResponse.body !== null))
    return { successful: false, response: logResponse.statusText } as responseResoniteWorlds;
  let logRaw = (await logResponse.body.text()) || '';

  // FIXME: this is a hack. needed as sometimes the first string os not sent or other shenanigans. stream needs to be made more reliable
  if (rerun) return { logRaw, refId } as responseResoniteWorlds;
  if (!logRaw.includes(kickoff)) {
    const returnRef = (await attach(containerId, command, true)) as { logRaw: string, refId: string };
    logRaw = returnRef.logRaw;
    refId = returnRef.refId;
  };
  // hack end

  // cut to important content and strip ansi coloring
  const log = logRaw
    .split(refId)[1]
    ?.split(refId)[0]
    ?.replace(/\u001b\[[0-9;]*m/g, '');
  return { successful: true, response: log } as responseResoniteWorlds;
}
