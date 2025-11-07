import { Command } from '@sapphire/framework';
import { InteractionContextType, MessageFlags } from 'discord.js';
import { setTickrate } from '../lib/resoniteCli';
import { get } from '../lib/docker';

export class TickrateCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Changes the tickrate of all open worlds.',
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
              .setDescription('Which headless do you want to change the tickrate on?')
              .setAutocomplete(true)
              .setRequired(true)
          )
          .addNumberOption((option) => 
            option
              .setName('tickrate')
              .setMaxValue(120)
              .setMinValue(30)
              .setDescription('What tickrate do you want to set the headless on?')
              .setRequired(true)
          ),
      { idHints: ['1436170716805464186'] }
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const containerId = interaction.options.getString('headlessname', true);
    const containerAll = await get(containerId);
    if (containerAll.length === 0)
      return interaction.editReply(`Setting tickrate failed!\nLost container reference.`);
    const container = containerAll[0];
    if (container!.Labels.discordBotAccessRole)
      if (!interaction.member?.roles.cache.has(container!.Labels.discordBotAccessRole))
        return interaction.editReply(
          `Setting tickrate failed!\nYou don't have permissions on that headless.`
        );
    const tickrate = interaction.options.getNumber('tickrate', true);
    const response = await setTickrate(containerId, tickrate);
    if (!response.successful) {
      const text = `Setting tickrate failed!\nResponse: ${response.response}`;
      await interaction.editReply(text);
      throw new Error(text);
    }
    if (!response.response.includes('Tick Rate Set!')) {
      return interaction.editReply('Unable to confirm set tickrate.\nMaybe this headless is currently restarting? Try again later...');
    }
    return interaction.editReply('Tick Rate Set!');
  }
}
