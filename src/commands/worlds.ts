import { Command } from '@sapphire/framework';
import {
  bold,
  EmbedBuilder,
  InteractionContextType,
  type APIEmbedField,
  type RestOrArray,
} from 'discord.js';
import { getActiveWorlds } from '../lib/resoniteCli';
import { get } from '../lib/docker';

export class RestartCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Gets all open worlds on selected headless.',
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
              .setDescription('Which headless do you want to see the open worlds on?')
              .setAutocomplete(true)
              .setRequired(true)
          ),
      { idHints: ['1432110124419514509', '1432161109003210846'] }
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();
    const containerId = interaction.options.getString('headlessname', true);
    const containerAll = await get(containerId);
    if (containerAll.length === 0) return interaction.editReply(`Getting Worlds Failed!\nLost container reference.`);
    const container = containerAll[0]
    if (!container) return interaction.editReply(`Getting Worlds Failed!\nLost container reference.`);
    if (container.Labels.discordBotAccessRole)
      if (!interaction.member?.roles.cache.has(container.Labels.discordBotAccessRole)) return interaction.editReply(`Getting Worlds Failed!\nYou don't have permissions on that headless.`);

    const response = await getActiveWorlds(containerId);
    if (!response.successful) {
      const text = `Getting Worlds Failed!\nResponse: ${response.response}`;
      await interaction.editReply(text);
      throw new Error(text);
    }
    if (!(response.worlds && response.worlds.length !== 0))
      return interaction.editReply(
        'There are currently no open worlds.\nMaybe this headless is currently restarting?\n-# But this command also sometimes fails so try re-running it.'
      );
    const prettyFields = response.worlds?.map((world) => {
      return {
        name: world.sessionName,
        value: `
${bold('Access Level')}: ${world.accessLevel}
${bold('Users')}: ${world.activeUsers} (${world.users - 1}) / ${world.maxUsers}
`,
      };
    }) as RestOrArray<APIEmbedField>;
    const embed = new EmbedBuilder()
      .addFields(...prettyFields)
      .setAuthor({ name: container.Names[0]!.replace('/', '') })
      .setTitle('Active Sessions')
      .setFooter({ text: 'Headless user is not counted.' });
    return interaction.editReply({ embeds: [embed] });
  }
}
