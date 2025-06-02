import { config } from 'dotenv';
config();

console.log('TOKEN:', process.env.TOKEN);
console.log('CLIENT_ID:', process.env.CLIENT_ID);
console.log('GUILD_ID:', process.env.GUILD_ID);

import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your commands folder (adjust if needed)
const commandsPath = path.join(__dirname, 'commands');

// Read all command files ending with .js or .mjs
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.mjs'));

const commands = [];

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(`file://${filePath}`);

  const data = command.data ?? command.default?.data;

  if (data) {
    commands.push(data.toJSON());
  } else {
    console.warn(`[WARNING] The command at ${file} is missing "data" export.`);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

try {
  console.log('🔄 Refreshing slash commands...');

  // You can choose to register globally or per guild
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );

  console.log('✅ Successfully reloaded slash commands.');
} catch (error) {
  console.error('❌ Failed to register slash commands:', error);
}
