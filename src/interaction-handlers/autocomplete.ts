import { ps } from 'docker-compose'

import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';

import type { AutocompleteInteraction } from 'discord.js';

import type { container } from '../types'

export class AutocompleteHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Autocomplete
    });
  }

  public override async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>) {
    return interaction.respond(result);
  }

  public override async parse(interaction: AutocompleteInteraction) {
    // TODO: name restart dynamic with class call
    if (interaction.command?.name !== 'restart') return this.none();

    const allContainersRaw = await fetch(`http://localhost/v1.51/containers/json?${new URLSearchParams({ all: true })}`, {
      method: 'GET',
      unix: '/var/run/docker.sock',
    });
    const allContainers = await allContainersRaw.json() as container[];
    const headlessContainers = allContainers.filter((container) => container.Labels.managedByResoniteBot === 'true');
    return this.some(headlessContainers.map((container) => ({ name: `${container.Names[0]} | ${container.Status}`, value: container.Id })));
  }
}