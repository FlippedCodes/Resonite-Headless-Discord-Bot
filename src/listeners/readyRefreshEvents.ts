import { Listener } from '@sapphire/framework';

import { type Client, Events } from 'discord.js';

import { refreshScheduledEvents } from '../lib/discordRepostScheduledEvents';

import config from '../../config.json';

export class ReadyListener extends Listener<typeof Events.ClientReady> {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      once: true,
      event: Events.ClientReady,
    });
  }

  public run(client: Client) {
    if (process.env.NODE_ENV === 'development') return this.container.logger.debug('Did not run initial refreshScheduledEvents in debug.');
    this.container.logger.info('Updating event tables!');
    config.discordEventMgmt.managedGuilds.forEach(async (mgmt) => {
      const guild = await client.guilds.fetch(mgmt.guildId);
      refreshScheduledEvents(guild);
    });
  }
}
