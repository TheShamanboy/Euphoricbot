import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import ms from 'ms';

export default {
  data: new SlashCommandBuilder()
    .setName('gw')
    .setDescription('Giveaway system')
    .addSubcommand(sub =>
      sub.setName('create')
        .setDescription('Create a giveaway')
        .addStringOption(opt => opt.setName('description').setDescription('Giveaway description').setRequired(true))
        .addStringOption(opt => opt.setName('duration').setDescription('Duration (e.g. 1h, 2d)').setRequired(true))
        .addIntegerOption(opt => opt.setName('winners').setDescription('Number of winners').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('reroll')
        .setDescription('Reroll giveaway')
        .addStringOption(opt => opt.setName('message_id').setDescription('Giveaway message ID').setRequired(true))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'create') {
      const description = interaction.options.getString('description');
      const duration = ms(interaction.options.getString('duration'));
      const winnersCount = interaction.options.getInteger('winners');

      if (!duration || duration < 5000) {
        return interaction.reply({ content: '❌ Invalid duration.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('🎉 Giveaway!')
        .setDescription(description)
        .addFields(
          { name: 'Hosted By', value: interaction.user.toString(), inline: true },
          { name: 'Winners', value: `${winnersCount}`, inline: true },
          { name: 'Ends In', value: `<t:${Math.floor((Date.now() + duration) / 1000)}:R>`, inline: true }
        )
        .setImage('https://cdn.discordapp.com/attachments/1317924214598275184/1379491555244638293/Staff_Rules.png?ex=68406f20&is=683f1da0&hm=e28fe52b587956f2862b6218a7c4a614ed3e2132fc68673410612e392727fd0f&')
        .setColor('Random');

      // First reply without button to get the message ID
      await interaction.reply({ embeds: [embed], components: [] });
      const msg = await interaction.fetchReply();

      // Create button with giveaway_ prefix and message id
      const button = new ButtonBuilder()
        .setCustomId(`giveaway_${msg.id}`)
        .setLabel('🎉 Join Giveaway')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      // Edit message to add the button
      await msg.edit({ components: [row] });

      // Save giveaway data keyed by message id
      interaction.client.giveaways.set(msg.id, {
        participants: new Set(),
        message: msg,
        winnersCount,
        title: description,
        timeout: setTimeout(() => endGiveaway(interaction.client, msg.id), duration),
      });
    }

    if (sub === 'reroll') {
      const messageId = interaction.options.getString('message_id');
      const data = interaction.client.giveaways.get(messageId);
      if (!data) return interaction.reply({ content: '❌ Giveaway not found.', ephemeral: true });

      pickWinners(data, true, interaction);
    }

    async function endGiveaway(client, messageId) {
      const data = client.giveaways.get(messageId);
      if (!data) return;

      const participants = [...data.participants];
      const winners = [];

      if (participants.length === 0) {
        await data.message.channel.send('😢 No one participated in the giveaway.');
      } else {
        while (winners.length < data.winnersCount && participants.length > 0) {
          const winner = participants.splice(Math.floor(Math.random() * participants.length), 1)[0];
          winners.push(`<@${winner}>`);
        }

        await data.message.channel.send(`🎉 Congratulations ${winners.join(', ')}! You won **${data.title}**`);
      }

      client.giveaways.delete(messageId);
    }

    function pickWinners(data, reroll = false, interaction = null) {
      const participants = [...data.participants];
      const winners = [];

      if (participants.length === 0) {
        if (interaction) interaction.reply({ content: '❌ No participants to reroll.', ephemeral: true });
        return;
      }

      while (winners.length < data.winnersCount && participants.length > 0) {
        const winner = participants.splice(Math.floor(Math.random() * participants.length), 1)[0];
        winners.push(`<@${winner}>`);
      }

      if (interaction) interaction.reply({ content: `🔁 New winner(s): ${winners.join(', ')}` });
    }
  }
};
