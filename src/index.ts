import {
  SapphireClient,
  ApplicationCommandRegistries,
  LogLevel,
  container,
} from '@sapphire/framework';

import { GatewayIntentBits, Partials } from 'discord.js';

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
console.log(client.user?.displayName);
