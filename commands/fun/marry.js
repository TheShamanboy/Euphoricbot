import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  name: 'marry',
  description: 'Propose marriage to another user, who can accept or reject.',
  usage: '<@user>',
  args: true,
  guildOnly: true,

  async execute(message, args, client) {
    const target = message.mentions.users.first();

    if (!target || target.bot) return message.reply('Please mention a valid user to marry.');
    if (target.id === message.author.id) return message.reply("You can't marry yourself.");

    // Initialize marriages Map
    if (!client.marriages) client.marriages = new Map();

    // Check if either user is already married
    for (const [partner1, partner2] of client.marriages.entries()) {
      if ([partner1, partner2].includes(message.author.id)) {
        return message.reply("You are already married. Divorce first to marry someone else.");
      }
      if ([partner1, partner2].includes(target.id)) {
        return message.reply(`${target.username} is already married.`);
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('💍 Marriage Proposal')
      .setDescription(`<@${message.author.id}> has proposed to <@${target.id}>!`)
      .setColor(0xFFC0CB)
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('marry_accept')
        .setLabel('Accept 💖')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('marry_reject')
        .setLabel('Reject ❌')
        .setStyle(ButtonStyle.Danger),
    );

    const proposalMessage = await message.channel.send({ embeds: [embed], components: [row] });

    const filter = i => i.user.id === target.id;
    const collector = proposalMessage.createMessageComponentCollector({ filter, time: 60000, max: 1 });

    collector.on('collect', async i => {
      if (i.customId === 'marry_accept') {
        client.marriages.set(message.author.id, target.id);

        const acceptedEmbed = new EmbedBuilder()
          .setTitle('💍 Marriage Accepted!')
          .setDescription(`💞 Congratulations to <@${message.author.id}> and <@${target.id}> on their new union!`)
          .setColor(0xFFC0CB)
          .setTimestamp();

        await i.update({ embeds: [acceptedEmbed], components: [] });
      } else if (i.customId === 'marry_reject') {
        const rejectedEmbed = new EmbedBuilder()
          .setTitle('💔 Marriage Rejected')
          .setDescription(`<@${target.id}> has rejected <@${message.author.id}>'s proposal.`)
          .setColor(0x808080)
          .setTimestamp();

        await i.update({ embeds: [rejectedEmbed], components: [] });
      }
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle('⌛ Proposal Timed Out')
          .setDescription(`<@${target.id}> did not respond to <@${message.author.id}>'s proposal in time.`)
          .setColor(0xAAAAAA)
          .setTimestamp();

        await proposalMessage.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }
};
