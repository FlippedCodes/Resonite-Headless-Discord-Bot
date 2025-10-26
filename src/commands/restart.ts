import { Command } from '@sapphire/framework';
import { InteractionContextType } from 'discord.js';
import { restart } from '../lib/docker';

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
    const restartReplyRaw = await restart(interaction.options.getString('headlessname', true));
    if (!(restartReplyRaw.ok && restartReplyRaw.status === 204))
      return interaction.editReply(`Restart Failed!\nStatus-Code: ${restartReplyRaw.status}`);
    return interaction.editReply(`Restart issued!\nPlease wait for headless restart...`);
  }
}
