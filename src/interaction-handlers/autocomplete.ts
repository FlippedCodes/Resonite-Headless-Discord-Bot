import { InteractionHandler, InteractionHandlerTypes, ApplicationCommandRegistries } from '@sapphire/framework';
import { get } from '../lib/docker';
import type { AutocompleteInteraction, GuildMember } from 'discord.js';

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
      ApplicationCommandRegistries.acquire('worlds').commandName,
      ApplicationCommandRegistries.acquire('tickrate').commandName,
    ]
    if (!allowedCommands.includes(interaction.command?.name!)) return this.none();

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
}
