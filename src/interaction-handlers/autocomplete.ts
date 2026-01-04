import {
  InteractionHandler,
  InteractionHandlerTypes,
  ApplicationCommandRegistries,
} from '@sapphire/framework';
import { get } from '../lib/docker';
import type { AutocompleteInteraction, GuildMember } from 'discord.js';
import { getConfig } from '../lib/resoniteConfigFile';
import { getWorlds } from '../lib/discordGetResoniteWorldList';

export class AutocompleteHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Autocomplete,
    });
  }

  public override async run(
    interaction: AutocompleteInteraction,
    result: InteractionHandler.ParseResult<this>
  ) {
    return interaction.respond(result);
  }

  public override async parse(interaction: AutocompleteInteraction) {
    // TODO: name restart dynamic with class call
    const allowedCommands = [
      ApplicationCommandRegistries.acquire('restart').commandName,
      ApplicationCommandRegistries.acquire('sessions').commandName,
      ApplicationCommandRegistries.acquire('config').commandName,
    ];
    if (!allowedCommands.includes(interaction.commandName)) return this.none();

    // Get the focussed (current) option
    const focusedOption = interaction.options.getFocused(true);

    switch (focusedOption.name) {
      case 'headlessname': {
        const headlessContainers = await get();
        const guildMember = interaction.member as GuildMember;
        return this.some(
          headlessContainers
            // check if user is allowed
            .filter((container) =>
              container.Labels.discordBotAccessRole
                ? guildMember.roles.cache.has(container.Labels.discordBotAccessRole)
                : true
            )
            .map((container) => ({
              name: `${container.Names[0]?.replace('/', '')} | ${container.Status}`,
              value: container.Id,
            }))
        );
      }
      case 'sessionname': {
        const containerId = interaction.options.getString('headlessname', true);
        if (!containerId) return this.none();
        const containerAll = await get(containerId);
        const container = containerAll[0];
        if (!container) return this.none();

        const runningConfig = await getConfig(container);
        if (!(runningConfig.successful && runningConfig.contents)) {
          const err = `Getting config failed!\nResponse: ${runningConfig.response}`;
          this.none();
          throw new Error(err);
        }
        const sessions = runningConfig.contents.startWorlds
          ?.filter((world) => world?.customSessionId)
          .map((world) => ({
            name: world?.sessionName?.replaceAll(/<[^>]+>/gm, ''),
            value: world?.customSessionId,
          }));
        return this.some(sessions);
      }
      case 'worldname': {
        const containerId = interaction.options.getString('headlessname', true);
        if (!containerId) return this.none();
        const containerAll = await get(containerId);
        const container = containerAll[0];
        if (!container) return this.none();

        const customSessionId = interaction.options.getString('sessionname', true);
        if (!customSessionId) return this.none();

        const runningConfig = await getConfig(container);
        if (!(runningConfig.successful && runningConfig.contents)) {
          const err = `Getting config failed!\nResponse: ${runningConfig.response}`;
          this.none();
          throw new Error(err);
        }

        const worldSettings = runningConfig.contents.startWorlds
          ?.filter((world) => world?.customSessionId)
          .find((world) => world?.customSessionId === customSessionId);
        if (!(worldSettings && worldSettings.isEnabled === true)) this.none();

        const worldList = await getWorlds(container);
        if (!(worldList.successful && worldList.contents)) {
          const err = `Getting config failed!\nResponse: ${worldList.response}`;
          this.none();
          throw new Error(err);
        }
        const worlds = worldList.contents
          .filter(
            (world) =>
              world?.resoniteRecord &&
              !world?.disabled &&
              world?.displayName &&
              // check if world tags fit
              world.tags?.some((item) => worldSettings?.tags?.includes(item))
          )
          .map((world) => ({
            name: `${world?.displayName?.replaceAll(/<[^>]+>/gm, '')}${
              world?.description ? ' - ' : ''
            }${world?.description || ''}`,
            value: world?.resoniteRecord,
          }));
        return this.some(worlds);
      }
      default:
        return this.none();
    }
  }
}
