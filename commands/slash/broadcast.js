import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('broadcast')
    .setDescription('Send a DM to all server members')
    .addStringOption(option => 
      option.setName('message')
        .setDescription('Message to send to everyone')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const message = interaction.options.getString('message');
    const guild = interaction.guild;

    if (!guild) {
      return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
    }

    await interaction.reply({ content: `Sending message to all members...`, ephemeral: true });

    let sentCount = 0;
    let failedCount = 0;

    const members = await guild.members.fetch();

    for (const member of members.values()) {
      if (member.user.bot) continue; // skip bots

      try {
        await member.send(message);
        sentCount++;
      } catch {
        failedCount++;
      }
    }

    return interaction.followUp({ 
      content: `✅ Message sent to ${sentCount} members. Failed to send to ${failedCount} members.`,
      ephemeral: true,
    });
  }
};
