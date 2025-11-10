import { Listener } from '@sapphire/framework';

import { Events, GuildScheduledEvent } from 'discord.js';

import { refreshScheduledEvents } from '../lib/discordRepostScheduledEvents';

export class GuildScheduledEventCreateListener extends Listener<
  typeof Events.GuildScheduledEventCreate
> {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: Events.GuildScheduledEventCreate,
    });
  }

  public run(createdEvent: GuildScheduledEvent) {
    this.container.logger.debug(this.event, 'event fired!');
    if (!createdEvent.guild)
      return this.container.logger.error(
        this.event,
        'was called but guild object is empty!',
        createdEvent.guildId
      );
    refreshScheduledEvents(createdEvent.guild);
  }
}
