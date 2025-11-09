import {
  Colors,
  EmbedBuilder,
  type ColorResolvable,
  type CommandInteraction,
  type GuildMember,
} from 'discord.js';
import { container } from '@sapphire/framework';
import type { logSuccessType, container as containerType } from '../types';

// function to log who ran what command
export async function commandLog(
  successType: logSuccessType,
  channelId: containerType['Labels']['discordBotLogChannel'],
  interaction: CommandInteraction,
  customMessage?: string
) {
  if (!channelId) return;
  const guildMember = interaction.member as GuildMember;
  const logChannel = await interaction.client.channels.fetch(channelId);
  if (!(logChannel && logChannel.isSendable()))
    return container.logger.error(
      'Unable to get the configured log channel',
      channelId,
      'for',
      guildMember.user.id,
      'running',
      interaction.commandName
    );
  let color: ColorResolvable;
  let description: string = `${guildMember} (${guildMember.id}) `;
  switch (successType) {
    case 'error': {
      description += `command request failed.`;
      color = Colors.Red;
      break;
    }
    case 'failed': {
      description += `tried to run a command but doesn't have permissions.`;
      color = Colors.Orange;
      break;
    }
    case 'success': {
      description += `successfully ran a command.`;
      color = Colors.Green;
      break;
    }
    default: {
      description += `ran a command (Unknown successType).`;
      color = Colors.Default;
      container.logger.warn(
        'Something went wrong with calling the correct successType on the logger.',
        interaction.commandName
      );
      break;
    }
  }
  const embed = new EmbedBuilder()
    .setTitle(interaction.commandName? `/${interaction.commandName}` : 'Unknown command')
    .setDescription(`${description}\n\nReason: ${customMessage || 'Not specified'}`)
    .setColor(color)
    .setTimestamp();
  logChannel.send({ embeds: [embed] });
}
