import config from '../../config.json';
import { container } from '@sapphire/framework';
import {
  EmbedBuilder,
  GuildScheduledEventStatus,
  time,
  TimestampStyles,
  type Guild,
  type GuildScheduledEvent,
} from 'discord.js';

export async function refreshScheduledEvents(guild: Guild) {
  if (!config.discordEventMgmt.enabled)
    return container.logger.debug(
      'Event channel was suppose dto be updated, but feature is disabled.'
    );
  // check if guild is populated and is the correct guild to support
  if (!guild) return;

  // get event list channel
  const mgmtGuild = config.discordEventMgmt.managedGuilds.find((g) => g.guildId);
  if (!mgmtGuild) return;
  const channel = await guild.channels.fetch(mgmtGuild.channelId);
  if (!(channel && channel.isSendable()))
    return container.logger.error("Couldn't find event-list channel", mgmtGuild);

  // prepare array
  const groupedEvents: GuildScheduledEvent[][] = Array.from({ length: 7 }, () => []);

  // sort events after days with relevant data more accessible
  const guildEvents = await guild.scheduledEvents.fetch();
  guildEvents
    // TS moment
    .filter((event) => event.scheduledStartTimestamp)
    // sort list after starting timestamps for displaying the events in the correct order
    .sort((a, b) => a.scheduledStartTimestamp! - b.scheduledStartTimestamp!)
    // put every event into its own day
    .forEach((event) => {
      // Sunday = 0, Saturday = 6
      const weekdayIndex = new Date(event.scheduledStartTimestamp!).getUTCDay();
      groupedEvents[weekdayIndex]!.push(event);
    });

  const weekdayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const embeds = groupedEvents
    .map((weekdayEvents, i) => {
      // create embed for each day. discord allows 10 embeds
      const fields = weekdayEvents
        .map((event) => {
          // do not run
          if (event.description === null) return null;
          // remove extra info inside [] 
          const eventName = event.name.replace(/\[[^\]]*\]\s*/g, '');
          let name = `${event.recurrenceRule ? '🔁' : ''} ${eventName} @ ${time(
            event.scheduledStartAt!,
            TimestampStyles.ShortTime
          )}`;
          const offsetSpaces = '-'.repeat(Math.round(name.length / 4));
          const ongoingLabel =
            event.status === GuildScheduledEventStatus.Active
              ? `${config.discordEventMgmt.ongoingEmoji} ${offsetSpaces} **_ONGOING_** ${offsetSpaces} ${config.discordEventMgmt.ongoingEmoji}\n`
              : '';

          // check, if event has the same description as another one on the same day
          const foundDup = weekdayEvents
            .filter((dupEvent) => dupEvent.id !== event.id)
            .filter((dupEvent) => dupEvent.description === event.description);
          // set the duplicate to null and append the time from it to consolidate the event
          const dup = foundDup[0];
          if (dup) {
            dup.description = null;
            name += ` & ${time(dup.scheduledStartAt!, TimestampStyles.ShortTime)}`;
          }

          return {
            name,
            value: `${ongoingLabel}${event.description ? `> ${event.description.replaceAll('\n', '\n> ')}` : ''}`,
          };
          // filter out events that have been consolidated
        })
        .filter((event) => event !== null);
      // build embed message
      if (fields.length === 0) return null;
      const embed = new EmbedBuilder()
        .setTitle(`${weekdayNames[i]}`)
        .setColor(16762624)
        .addFields([...fields])
        .setTimestamp(weekdayEvents[0] ? weekdayEvents[0].scheduledStartAt! : null);
      return embed;
    })
    .filter((event) => event !== null);

  // clear out entire channel if there is no message object
  const messages = await channel.messages.fetch({ limit: 10 });
  const message = messages.find((message) => message.author.id === guild.client.id);
  if (message && message.editable) return await message.edit({ embeds });
  // send out message if no message object is found
  await channel.bulkDelete(10);
  await channel.send({ embeds });
}
