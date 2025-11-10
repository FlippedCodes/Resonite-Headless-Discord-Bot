import { Listener } from '@sapphire/framework';

import { Events, GuildScheduledEvent } from 'discord.js';

import { refreshScheduledEvents } from '../lib/discordRepostScheduledEvents';

export class GuildScheduledEventUpdate extends Listener<typeof Events.GuildScheduledEventUpdate> {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: Events.GuildScheduledEventUpdate,
    });
  }

  public run(oldEvent: GuildScheduledEvent, updatedEvent: GuildScheduledEvent) {
    this.container.logger.debug(this.event, 'event fired!');
    if (!updatedEvent.guild)
      return this.container.logger.error(
        this.event,
        'was called but guild object is empty!',
        updatedEvent.guildId
      );
    refreshScheduledEvents(updatedEvent.guild);
  }
}
