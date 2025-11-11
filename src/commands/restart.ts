import { Command } from '@sapphire/framework';
import { GuildMember, InteractionContextType, MessageFlags } from 'discord.js';
import { get, restart } from '../lib/docker';
import { commandLog } from '../lib/discordLogging';
import { logType } from '../types';

export class RestartCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Gracefully restarts the headless Docker container.',
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .setContexts([InteractionContextType.Guild])
          .addStringOption((option) =>
            option
              .setName('headlessname')
              .setDescription('Which headless do you want to restart?')
              .setAutocomplete(true)
              .setRequired(true)
          ),
      { idHints: ['1421507374233161748', '1432161106373378223'] }
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const containerId = interaction.options.getString('headlessname', true);
    const containerAll = await get(containerId);
    const container = containerAll[0];
    if (!container) return interaction.editReply(`Restart Failed!\nLost container reference.`);
    if (container.Labels.discordBotAccessRole) {
      const guildMember = interaction.member as GuildMember;
      if (!guildMember.roles.cache.has(container.Labels.discordBotAccessRole)) {
        commandLog(logType.failed, container.Labels.discordBotLogChannel, interaction);
        return interaction.editReply(
          `Restart Failed!\nYou don't have permissions on that headless.`
        );
      }
    }
    const restartReplyRaw = await restart(containerId);
    if (!(restartReplyRaw.ok && restartReplyRaw.status === 204)) {
      const err = `Restart Failed!\nStatus-Code: ${restartReplyRaw.status}`;
      commandLog(logType.error, container.Labels.discordBotLogChannel, interaction, err);
      return interaction.editReply(err);
    }
    commandLog(logType.success, container.Labels.discordBotLogChannel, interaction, 'Restart issued.');
    return interaction.editReply(`Restart issued!\nPlease wait for headless restart...`);
  }
}
