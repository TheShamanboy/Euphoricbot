import {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Report a user for breaking rules')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user you are reporting')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for the report')
        .setRequired(true))
    .addAttachmentOption(option =>
      option.setName('proof')
        .setDescription('Upload proof or screenshot (optional)')),

  async execute(interaction) {
    const reportedUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const attachment = interaction.options.getAttachment('proof');

    const reportEmbed = new EmbedBuilder()
      .setTitle('🚨 User Report')
      .addFields(
        { name: 'Reported User', value: `<@${reportedUser.id}>`, inline: true },
        { name: 'Reporter', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Reason', value: reason }
      )
      .setColor(0xFF0000)
      .setTimestamp();

    if (attachment) {
      reportEmbed.setImage(attachment.url);
    }

    const reportChannelId = process.env.REPORT_CHANNEL_ID;
    const reportChannel = await interaction.client.channels.fetch(reportChannelId).catch(() => null);

    if (!reportChannel) {
      return interaction.reply({ content: '❌ Report channel not found or not configured.', ephemeral: true });
    }

    await reportChannel.send({ embeds: [reportEmbed] });
    await interaction.reply({ content: '✅ Your report has been submitted.', ephemeral: true });
  }
};
