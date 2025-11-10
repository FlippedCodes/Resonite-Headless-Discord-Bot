import { Listener } from '@sapphire/framework';

import { Events, GuildScheduledEvent } from 'discord.js';

import { refreshScheduledEvents } from '../lib/discordRepostScheduledEvents';

export class GuildScheduledEventDelete extends Listener<typeof Events.GuildScheduledEventDelete> {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: Events.GuildScheduledEventDelete,
    });
  }

  public run(deletedEvent: GuildScheduledEvent) {
    this.container.logger.debug(this.event, 'event fired!');
    if (!deletedEvent.guild)
      return this.container.logger.error(
        this.event,
        'was called but guild object is empty!',
        deletedEvent.guildId
      );
    refreshScheduledEvents(deletedEvent.guild);
  }
}
