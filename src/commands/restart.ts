import { HttpResponse } from '@microsoft/signalr';
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
import { InteractionContextType, MessageFlags } from 'discord.js';

export class RestartCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Gracefully restarts the headless Docker container.',
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
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
    // const restartReplyRaw = await fetch(`http://localhost/v1.51/containers/${interaction.options.getString('headlessname', true)}/restart`, {
    const restartReplyRaw = await fetch(`http://localhost/v1.51/containers/${interaction.options.getString('headlessname', true)}/restart`, {
      method: 'POST',
      unix: '/var/run/docker.sock',
    });
    if (!restartReplyRaw.ok && restartReplyRaw.status !== 204) return interaction.reply(`Restart Failed!\nStatus-Code: ${restartReplyRaw.status}`)
    return interaction.reply(`Restart issued!\nPlease wait for headless restart...\nStatus-Code: ${restartReplyRaw.status}`)
  }
}
