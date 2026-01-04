import {
  Colors,
  EmbedBuilder,
  type ColorResolvable,
  type CommandInteraction,
  type GuildMember,
} from 'discord.js';
import { container } from '@sapphire/framework';
import type { container as containerType } from '../types';

// function to get information about one session.
export async function getWorlds(dockerContainer: containerType, interaction?: CommandInteraction) {
  // TEMP: couldn't restart the container due to ongoing events and i was impatient to try prod.
  // const channelId = dockerContainer.Labels.discordBotWorldListChannel;
  const channelId = '1040278418173993070';
  if (!channelId) return { successful: false, response: 'No channel for a world list was set.' };
  // const guildMember = interaction.member as GuildMember;
  // FIXME: fetch is not working and never returns
  // const worldListChannel = await container.client.channels.fetch(channelId);
  const worldListChannel = await container.client.channels.cache.get(channelId);
  if (!(worldListChannel && worldListChannel.isTextBased()))
    return { successful: false, response: 'Channel was not found or is not a text channel.' };
  const messages = await worldListChannel.messages.fetch();
  // cleanup world list
  const worldList = messages.map((message) => {
    const content = message.content.split('\n').map((line) => line.trim());
    const tagsRaw = content.find((e) => e.startsWith('tags:'));
    return {
      content: message.content,
      disabled: !!message.reactions.cache.get('❌'),
      displayName: content[0],
      description: content[1],
      resoniteRecord: content.find((e) => e.startsWith('resrec:///')),
      link: content.find((e) => e.startsWith('https://')),
      tags: tagsRaw ? tagsRaw.replace('tags:', '').split(',').map((e) => e.trim()) : null,
      
    }
  })
  return { successful: true, contents: worldList };
}
