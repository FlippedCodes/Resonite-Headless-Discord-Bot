import { Command } from '@sapphire/framework';
import { InteractionContextType } from 'discord.js';
import { get, restart } from '../lib/docker';

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
      { idHints: ['1421507374233161748'] }
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();
    const containerId = interaction.options.getString('headlessname', true);
    const containerAll = await get(containerId);
    if (containerAll.length === 0) return interaction.editReply(`Restart Failed!\nLost container reference.`);
    const container = containerAll[0]
    if (container!.Labels.discordBotAccessRole)
      if (!interaction.member?.roles.cache.has(container!.Labels.discordBotAccessRole)) return interaction.editReply(`Restart Failed!\nYou don't have permissions on that headless.`); 
    const restartReplyRaw = await restart(containerId);
    if (!(restartReplyRaw.ok && restartReplyRaw.status === 204))
      return interaction.editReply(`Restart Failed!\nStatus-Code: ${restartReplyRaw.status}`);
    return interaction.editReply(`Restart issued!\nPlease wait for headless restart...`);
  }
}
