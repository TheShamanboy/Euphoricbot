import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Paths setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const triggersPath = path.join(__dirname, '../../data/triggers.json');

// Load and save helpers
function loadTriggers() {
  if (!fs.existsSync(triggersPath)) fs.writeFileSync(triggersPath, '{}');
  return JSON.parse(fs.readFileSync(triggersPath, 'utf-8'));
}

function saveTriggers(data) {
  fs.writeFileSync(triggersPath, JSON.stringify(data, null, 2), 'utf-8');
}

export default {
  data: new SlashCommandBuilder()
    .setName('autotrigger')
    .setDescription('Set a trigger word, image, and optional title.')
    .addStringOption(option =>
      option.setName('trigger')
        .setDescription('Trigger word (e.g. "cat")')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('image')
        .setDescription('Image URL to show when triggered')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Optional title to display with the image')
        .setRequired(false)),

  async execute(interaction) {
    const word = interaction.options.getString('trigger').toLowerCase();
    const image = interaction.options.getString('image');
    const title = interaction.options.getString('title') || '';

    const triggers = loadTriggers();
    triggers[word] = { title, image };
    saveTriggers(triggers);

    await interaction.reply(`✅ Auto-trigger added:\n**Trigger word:** \`${word}\`\n**Image:** ${image}${title ? `\n**Title:** ${title}` : ''}`);
  }
};
