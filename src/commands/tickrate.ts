import { Command } from '@sapphire/framework';
import { GuildMember, inlineCode, InteractionContextType, MessageFlags } from 'discord.js';
import { setTickrate } from '../lib/resoniteCli';
import { get } from '../lib/docker';
import config from '../../config.json';
import { commandLog } from '../lib/discordLogging';
import { logType } from '../types';
import { getConfig } from '../lib/resoniteConfigFile';

export class TickrateCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Read or change the tickrate of all open worlds.',
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
              .setMaxValue(config.headless.global.tickrateRange.max)
              .setMinValue(config.headless.global.tickrateRange.min)
              .setDescription('What tickrate do you want to set the headless on?')
              .setRequired(false)
          ),
      { idHints: ['1436170716805464186', '1436177225358508153'] }
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const containerId = interaction.options.getString('headlessname', true);
    const containerAll = await get(containerId);
    const container = containerAll[0];
    if (!container)
      return interaction.editReply(`Setting tickrate failed!\nLost container reference.`);
    if (container.Labels.discordBotAccessRole) {
      const guildMember = interaction.member as GuildMember;
      if (!guildMember.roles.cache.has(container.Labels.discordBotAccessRole)) {
        commandLog(logType.failed, container.Labels.discordBotLogChannel, interaction);
        return interaction.editReply(
          `Setting tickrate failed!\nYou don't have permissions on that headless.`
        );
      }
    }
    const tickrate = interaction.options.getNumber('tickrate', false);
    if (tickrate) {
      const response = await setTickrate(containerId, tickrate);
      if (!response.successful) {
        const err = `Setting tickrate failed!\nResponse: ${response.response}`;
        commandLog(logType.error, container.Labels.discordBotLogChannel, interaction, err);
        await interaction.editReply(err);
        throw new Error(err);
      }
      const confirmMessage = 'Tick Rate Set!';
      if (!response.response.includes(confirmMessage)) {
        const err =
          'Unable to confirm set tickrate.\nMaybe this headless is currently restarting? Please try again...';
        commandLog(logType.error, container.Labels.discordBotLogChannel, interaction, err);
        return interaction.editReply(err);
      }
      commandLog(logType.success, container.Labels.discordBotLogChannel, interaction);
      return interaction.editReply(confirmMessage);
    }
    const runningConfig = await getConfig(container);
    if (!runningConfig.successful) {
      const err = `Getting tickrate failed!\nResponse: ${runningConfig.response}`;
      commandLog(logType.error, container.Labels.discordBotLogChannel, interaction, err);
      await interaction.editReply(err);
      throw new Error(err);
    }
    const configuredTickrate = runningConfig.contents?.tickRate;
    if (configuredTickrate === undefined) {
      const err = 'Unable to find tickrate in config file.';
      commandLog(logType.error, container.Labels.discordBotLogChannel, interaction, err);
      return await interaction.editReply(err);
    }
    commandLog(logType.success, container.Labels.discordBotLogChannel, interaction);
    return interaction.editReply(
      `The current Tickrate is ${inlineCode(configuredTickrate.toString())}`
    );
  }
}
