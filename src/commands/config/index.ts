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
			// preconditions: [],
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
        //   .addSubcommand((subcommand) => 
        //     subcommand
        //       .setName('change_world')
        //       .setDescription('Change the tickrate for the whole headless.')

        //       .addStringOption((option) =>
        //         option
        //           .setName('session_name')
        //           .setDescription('What session do you want to edit?')
        //           .setAutocomplete(true)
        //           .setRequired(false)
        //       )
        //   )
    );
  }
}
