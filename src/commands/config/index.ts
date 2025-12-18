import { Subcommand } from '@kaname-png/plugin-subcommands-advanced';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import {
  GuildMember,
  inlineCode,
  InteractionContextType,
  MessageFlags,
} from 'discord.js';
import { setTickrate } from '../../lib/resoniteCli';
import { get } from '../../lib/docker';
import config from '../../../config.json';
import { commandLog } from '../../lib/discordLogging';
import { logType } from '../../types';
import { getConfig, writeConfig } from '../../lib/resoniteConfigFile';

export class ParentCommand extends Subcommand {
  public constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
    super(context, {
      ...options,
      name: 'config',
      description: 'Change headless specific configurations.',
    });
  }

  public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
    // https://github.com/sawa-ko/neko-plugins/tree/main/packages/subcommands-advanced
    registry.registerChatInputCommand(
      (ctx) => {
				// It is necessary to call this hook and pass the builder context to register the subcommands stored in the subcommand registry in the subcommand groups of the parent command.
				this.hooks.groups(this, ctx);
				// It is necessary to call this hook and pass the builder context to register the subcommands stored in the subcommand register in the parent command.
				this.hooks.subcommands(this, ctx);
 				// Calling both hooks is only necessary if required, it is not mandatory.
				return ctx
					.setName(this.name)
					.setDescription(this.description)
          .setContexts([InteractionContextType.Guild]);
      },
      { idHints: ['1436170716805464186'] }
        // builder
        //   .setName(this.name)
        //   .setDescription(this.description)
        //   .setContexts([InteractionContextType.Guild])
        //   .addSubcommand((subcommand) => 
        //     subcommand
        //       .setName('change_world')
        //       .setDescription('Change the tickrate for the whole headless.')
        //       .addStringOption((option) =>
        //         option
        //           .setName('headlessname')
        //           .setDescription('Which headless do you want to see the open worlds on?')
        //           .setAutocomplete(true)
        //           .setRequired(true)
        //       )
        //       .addStringOption((option) =>
        //         option
        //           .setName('session_name')
        //           .setDescription('What session do you want to edit?')
        //           .setAutocomplete(true)
        //           .setRequired(false)
        //       )
        //       .addStringOption((option) =>
        //         option
        //           .setName('world_name')
        //           .setDescription('What world do you want to use?')
        //           .setAutocomplete(true)
        //           .setRequired(false)
        //       )
        //   )
        //   .addSubcommand((subcommand) =>
        //     subcommand
        //       .setName('change_tickrate')
        //       .setDescription('Change the tickrate for the whole headless.')
        //       .addStringOption((option) =>
        //         option
        //           .setName('headlessname')
        //           .setDescription('Which headless do you want to change the tickrate on?')
        //           .setAutocomplete(true)
        //           .setRequired(true)
        //       )
        //       .addNumberOption((option) =>
        //         option
        //           .setName('tickrate')
        //           .setMaxValue(config.headless.global.tickrateRange.max)
        //           .setMinValue(config.headless.global.tickrateRange.min)
        //           .setDescription('What tickrate do you want to set the headless on?')
        //           .setRequired(false)
        //       )
        //   ),
    );
  }
}
