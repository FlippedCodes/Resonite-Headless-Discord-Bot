import {
  SapphireClient,
  ApplicationCommandRegistries,
  LogLevel,
  container,
} from '@sapphire/framework';

import { GatewayIntentBits } from 'discord.js';

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    // GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    // GatewayIntentBits.MessageContent,
  ],
  // partials: [Partials.Message, Partials.Reaction],
  logger: {
    level: process.env.NODE_ENV === 'development' ? LogLevel.Debug : LogLevel.Info,
  },
});

// TODO: Register all commands at Discord first. So we get all idHints
if (process.env.NODE_ENV === 'development')
  ApplicationCommandRegistries.setDefaultGuildIds([String(process.env.devGuild)]);

// discord connect
await client.login(process.env.DCtoken);
if (!client.user) throw new Error('Unable to login the bot. Is the Discord token correct?');
container.logger.info('Logged in as', client.user?.displayName);
