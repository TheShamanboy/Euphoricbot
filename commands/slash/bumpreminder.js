// commands/slash/bumpreminder.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

// Simple in-memory store (or export this from another shared file if needed)
const bumpData = new Map();

const command = {
  data: new SlashCommandBuilder()
    .setName('bumpreminder')
    .setDescription('Reminds the last person who bumped (via Disboard) if 2 hours have passed.'),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const data = bumpData.get(guildId);

    if (!data) {
      return interaction.reply({ content: 'No bump recorded yet.', ephemeral: true });
    }

    const now = Date.now();
    const elapsed = now - data.time;
    const twoHours = 2 * 60 * 60 * 1000;

    if (elapsed >= twoHours) {
      const embed = new EmbedBuilder()
        .setTitle('⏰ Time to bump again!')
        .setDescription(`<@${data.userId}>, it’s been 2 hours since your last bump.`)
        .setColor('Green')
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } else {
      const remaining = Math.ceil((twoHours - elapsed) / 60000);
      return interaction.reply({ content: `Please wait ${remaining} more minute(s) before bumping again.`, ephemeral: true });
    }
  },

  bumpData
};

export default command;
