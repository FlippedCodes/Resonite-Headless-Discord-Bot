import {
  SapphireClient,
  ApplicationCommandRegistries,
  LogLevel,
} from '@sapphire/framework';
import '@sapphire/plugin-hmr/register';
import '@sapphire/plugin-scheduled-tasks/register';
import { GatewayIntentBits } from 'discord.js';

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    // GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildScheduledEvents,
    // GatewayIntentBits.MessageContent,
  ],
  // partials: [Partials.Message, Partials.Reaction],
  logger: {
    level: process.env.NODE_ENV === 'development' ? LogLevel.Debug : LogLevel.Info,
  },
  hmr: { enabled: process.env.NODE_ENV === 'development' },
  tasks: { bull: { connection: { host: process.env.redisHost } } },
});

// TODO: Register all commands at Discord first. So we get all idHints
if (process.env.NODE_ENV === 'development')
  ApplicationCommandRegistries.setDefaultGuildIds([String(process.env.devGuild)]);

// discord connect
await client.login(process.env.DCtoken);
