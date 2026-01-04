import { Command } from '@kaname-png/plugin-subcommands-advanced';
import {
  EmbedBuilder,
  GuildMember,
  inlineCode,
  MessageFlags,
  type APIEmbedField,
  type RestOrArray,
} from 'discord.js';
import { get } from '../../lib/docker';
import { commandLog } from '../../lib/discordLogging';
import { logType } from '../../types';
import { getConfig, writeConfig } from '../../lib/resoniteConfigFile';
import { codeBlock } from '@sapphire/utilities';
import { getWorlds } from '../../lib/discordGetResoniteWorldList';

export class TickrateCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      // preconditions: [],
      registerSubCommand: {
        parentCommandName: 'config',
        slashSubcommand: (builder) =>
          builder
            .setName('session')
            .setDescription('Change session specific settings.')
            .addStringOption((option) =>
              option
                .setName('headlessname')
                .setDescription('Which headless do you want to see the open worlds on?')
                .setAutocomplete(true)
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName('sessionname')
                .setDescription('What session do you want to edit or see more details of?')
                .setAutocomplete(true)
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName('worldname')
                .setDescription('What world do you want to use?')
                .setAutocomplete(true)
                .setRequired(false)
            )
            .addBooleanOption((option) =>
              option
                .setName('fullconfig')
                .setDescription('Fetch full list of the config of a session.')
                .setRequired(false)
            ),
      },
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    //#region get container
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const containerId = interaction.options.getString('headlessname', true);
    const containerAll = await get(containerId);
    const container = containerAll[0];
    if (!container)
      return interaction.editReply(`Session settings failed!\nLost container reference.`);
    if (container.Labels.discordBotAccessRole) {
      const guildMember = interaction.member as GuildMember;
      if (!guildMember.roles.cache.has(container.Labels.discordBotAccessRole)) {
        commandLog(logType.failed, container.Labels.discordBotLogChannel, interaction);
        return interaction.editReply(
          `Session settings failed!\nYou don't have permissions on that headless.`
        );
      }
    }
    //#endregion

    //#region get world list
    const worldList = await getWorlds(container, interaction);
    if (!(worldList.successful && worldList.contents)) {
      const err = `Getting world list failed!\nResponse: ${worldList.response}`;
      commandLog(logType.error, container.Labels.discordBotLogChannel, interaction, err);
      await interaction.editReply(err);
      throw new Error(err);
    }
    //#endregion

    //#region get headless config
    const runningConfig = await getConfig(container);
    if (!(runningConfig.successful && runningConfig.contents)) {
      const err = `Getting session failed!\nResponse: ${runningConfig.response}`;
      commandLog(logType.error, container.Labels.discordBotLogChannel, interaction, err);
      await interaction.editReply(err);
      throw new Error(err);
    }
    //#endregion

    //#region get world
    const customSessionId = interaction.options.getString('sessionname', true);
    const worldSettings = runningConfig.contents.startWorlds
      ?.filter((world) => world?.customSessionId)
      .find((world) => world?.customSessionId === customSessionId);
    if (!(worldSettings && worldSettings.isEnabled === true)) {
      const err = `Getting world config failed!\nLost config reference.`;
      commandLog(logType.error, container.Labels.discordBotLogChannel, interaction, err);
      await interaction.editReply(err);
      throw new Error(err);
    }
    //#endregion
    const worldname = interaction.options.getString('worldname', false);
    if (worldname) {
      //#region set world
      const selectedWorld = worldList.contents.find((world) => world.resoniteRecord === worldname)
      if (!(selectedWorld && selectedWorld.disabled === false)) {
        const err = `Getting world config failed!\nLost config reference.`;
        commandLog(logType.error, container.Labels.discordBotLogChannel, interaction, err);
        await interaction.editReply(err);
        throw new Error(err);
      }
      const newConfig = runningConfig.contents;
      if (worldSettings.loadWorldURL === selectedWorld.resoniteRecord) {
        const err = `Applying new world failed!\nThis session already uses this world.`;
        commandLog(logType.error, container.Labels.discordBotLogChannel, interaction, err);
        return interaction.editReply(err);
      }
      // update world url
      worldSettings.loadWorldURL = selectedWorld.resoniteRecord;
      // gets array index of startWorlds, so update it with the new world data.
      const sessionIndex = newConfig.startWorlds?.findIndex((session) => session?.customSessionId === customSessionId);
      if (!(sessionIndex !== undefined && sessionIndex !== -1 && newConfig.startWorlds)) {
        const err = `Applying new world failed!\nUnable to get startWorlds array index.`;
        commandLog(logType.error, container.Labels.discordBotLogChannel, interaction, err);
        await interaction.editReply(err);
        throw new Error(err);
      }
      newConfig.startWorlds[sessionIndex] = worldSettings;
      writeConfig(container, newConfig)
      commandLog(logType.success, container.Labels.discordBotLogChannel, interaction);
      return interaction.editReply(`Updated session "${worldSettings.sessionName}" (${inlineCode(customSessionId)}) with world "${selectedWorld.displayName}" (${inlineCode(selectedWorld.resoniteRecord || 'noRecord')})
-# Don't forget to restart the headless to apply your changes.`);
      //#endregion
    } else {
      //#region command response
      commandLog(logType.success, container.Labels.discordBotLogChannel, interaction);
      if (interaction.options.getBoolean('fullconfig', false))
        return interaction.editReply(codeBlock(JSON.stringify(worldSettings, null, '  ')));
      const prettyFields = [
        { name: 'Session Name', value: worldSettings.sessionName },
        { name: 'Custom Session ID', value: worldSettings.customSessionId },
        { name: 'Description', value: worldSettings.description },
        {
          name: 'Loaded World Name',
          value: worldList.contents.find(
            (world) => world.resoniteRecord === worldSettings.loadWorldURL
          )?.displayName,
        },
        {
          name: 'Loaded World URL',
          value: worldSettings.loadWorldURL,
        },
        { name: 'Max Users', value: `${worldSettings.maxUsers}` },
        { name: 'Access Level', value: worldSettings.accessLevel },
        {
          name: 'Permissions',
          value: codeBlock(JSON.stringify(worldSettings.defaultUserRoles, null, '  ')),
        },
        { name: 'Away Kick Minutes', value: `${worldSettings.awayKickMinutes}` },
        { name: 'Idle Restart Interval', value: `${worldSettings.idleRestartInterval}` },
      ].filter((e) => e.value) as RestOrArray<APIEmbedField>;
      const embed = new EmbedBuilder().addFields(...prettyFields);
      return interaction.editReply({ embeds: [embed] });
      //#endregion
    }
  }
}
