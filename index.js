import dotenv from 'dotenv';
dotenv.config();
console.log('DISCORD_TOKEN:', process.env.DISCORD_TOKEN);

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Client, GatewayIntentBits, Collection, REST, Routes, PermissionFlagsBits } from 'discord.js';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.DirectMessages,
  ],
});

client.giveaways = new Map();

const prefix = '&';
client.commands = new Collection();
client.snipes = new Map();

const marriagesPath = path.join(__dirname, 'data', 'marriages.json');
function loadMarriages() {
  try {
    if (!fs.existsSync(marriagesPath)) return new Map();
    const data = fs.readFileSync(marriagesPath, 'utf-8');
    return new Map(Object.entries(JSON.parse(data)));
  } catch (err) {
    console.error('Failed to load marriages:', err);
    return new Map();
  }
}
function saveMarriages(map) {
  try {
    fs.writeFileSync(marriagesPath, JSON.stringify(Object.fromEntries(map), null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save marriages:', err);
  }
}
client.marriages = loadMarriages();

client.on('messageDelete', (message) => {
  if (message.partial || !message.content) return;
  client.snipes.set(message.channel.id, {
    content: message.content,
    author: message.author,
    time: message.createdAt,
  });
  setTimeout(() => client.snipes.delete(message.channel.id), 60000);
});

// ✅  Disboard bump detection
import bumpReminderCommand from './commands/slash/bumpreminder.js';

client.on('messageCreate', (message) => {
  const disboardId = '302050872383242240';
  if (
    message.author.id === disboardId &&
    message.embeds.length &&
    message.embeds[0].description?.includes('Bump done')
  ) {
    const userMatch = message.embeds[0].description.match(/<@!?(\d+)>/);
    if (userMatch) {
      const userId = userMatch[1];
      const guildId = message.guild.id;

      bumpReminderCommand.bumpData[guildId] = {
        userId,
        time: Date.now()
      };

      bumpReminderCommand.saveBumpData();

      console.log(`[BumpReminder] Registered bump from user ${userId} in guild ${guildId}`);
    }
  }
});

async function loadCommands(dir) {
  const folders = fs.readdirSync(dir);
  for (const folder of folders) {
    const files = fs.readdirSync(path.join(dir, folder)).filter(file => file.endsWith('.js'));
    for (const file of files) {
      const commandPath = pathToFileURL(path.join(dir, folder, file)).href;
      try {
        const commandModule = await import(commandPath);
        const command = commandModule.default;
        if (command?.name) {
          client.commands.set(command.name, command);
          console.log(`✅ Loaded command: ${command.name}`);
        }
      } catch (err) {
        console.error(`❌ Failed to load command ${file}:`, err);
      }
    }
  }
}

const loadSlashCommands = async () => {
  const slashDir = path.join(__dirname, 'commands', 'slash');
  const slashCommands = [];

  if (!fs.existsSync(slashDir)) return;

  const files = fs.readdirSync(slashDir).filter(file => file.endsWith('.js'));
  for (const file of files) {
    const commandPath = pathToFileURL(path.join(slashDir, file)).href;
    const commandModule = await import(commandPath);
    const command = commandModule.default;

    if (command?.data) {
      slashCommands.push(command.data.toJSON());
      client.commands.set(command.data.name, command);
      console.log(`✅ Loaded slash command: ${command.data.name}`);
    }
  }

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: slashCommands }
    );
    console.log('📤 Slash commands registered.');
  } catch (err) {
    console.error('❌ Failed to register slash commands:', err);
  }
};

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'Euphoric discord server', type: 3 }],
    status: 'online',
  });

  client.giveaways.set('test123', { participants: new Set() });
});

client.on('guildMemberAdd', async (member) => {
  const blacklistPath = path.join(__dirname, 'data', 'blacklist.json');
  if (!fs.existsSync(blacklistPath)) return;

  try {
    const blacklist = JSON.parse(fs.readFileSync(blacklistPath, 'utf-8'));
    if (blacklist.includes(member.id)) {
      await member.send({
        embeds: [{
          title: 'Access Denied',
          description: `You are blacklisted and have been removed from **${member.guild.name}**.`,
          color: 0xff0000,
          timestamp: new Date(),
          footer: { text: 'Blacklist Enforcement' }
        }]
      }).catch(() => { });
      await member.kick('User is blacklisted');
      console.log(`🚫 Kicked blacklisted user ${member.user.tag}`);
    }
  } catch (err) {
    console.error('Failed to handle blacklist:', err);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) return;

  if (command.guildOnly && !message.guild) {
    return message.reply('This command can only be used in a server.');
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;
    if (command.usage) {
      reply += `\nProper usage: \`${prefix}${command.name} ${command.usage}\``;
    }
    return message.reply(reply);
  }

  try {
    await command.execute(message, args, client, saveMarriages);
  } catch (err) {
    console.error(err);
    message.reply('There was an error executing that command.');
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: '❌ There was an error.', ephemeral: true });
      } else {
        await interaction.reply({ content: '❌ Command error.', ephemeral: true });
      }
    }

  } else if (interaction.isButton()) {
    if (!interaction.customId.startsWith('giveaway_')) return;

    const giveawayId = interaction.customId.split('_')[1];
    const giveaway = client.giveaways.get(giveawayId);

    if (!giveaway) {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Giveaway not found or expired.',
          ephemeral: true,
        });
      }
      return;
    }

    if (!giveaway.participants) {
      giveaway.participants = new Set();
    }

    if (giveaway.participants.has(interaction.user.id)) {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ You have already joined this giveaway.',
          ephemeral: true,
        });
      }
      return;
    }

    giveaway.participants.add(interaction.user.id);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: `🎉 You have successfully joined the giveaway **${giveawayId}**! Good luck!`,
        ephemeral: true,
      });
    }

  } else if (interaction.isStringSelectMenu()) {
    const [action, , userId] = interaction.customId.split('_');
    const roleId = interaction.values[0];
    const member = await interaction.guild.members.fetch(userId).catch(() => null);
    const role = interaction.guild.roles.cache.get(roleId);

    if (!member || !role) {
      return interaction.reply({ content: '❌ Member or role not found.', ephemeral: true });
    }

    try {
      if (action === 'assign') {
        await member.roles.add(role);
        await interaction.reply({
          content: `✅ Assigned **${role.name}** to **${member.user.tag}**.`,
          ephemeral: true,
        });
      } else if (action === 'remove') {
        await member.roles.remove(role);
        await interaction.reply({
          content: `✅ Removed **${role.name}** from **${member.user.tag}**.`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({ content: '❌ Unknown action.', ephemeral: true });
      }
    } catch (err) {
      await interaction.reply({
        content: `❌ Failed to modify role: ${err.message}`,
        ephemeral: true,
      });
    }
  }
});

(async () => {
  await loadCommands(path.join(__dirname, 'commands'));
  await loadSlashCommands();

  client.login(process.env.DISCORD_TOKEN);
})();
