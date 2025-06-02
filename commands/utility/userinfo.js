import { EmbedBuilder } from 'discord.js';

export default {
  name: 'userinfo',
  description: 'Displays information about a user',
  usage: '[@user]',
  args: false,
  guildOnly: true,

  async execute(message, args) {
    // Get the target user or fallback to message author
    const member = message.mentions.members.first() || message.member;

    const roles = member.roles.cache
      .filter(role => role.id !== message.guild.id) // exclude @everyone
      .map(role => role.toString())
      .join(', ') || 'No roles';

    const embed = new EmbedBuilder()
      .setTitle(`${member.user.tag} Info`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
      .addFields(
        { name: 'User ID', value: member.id, inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Joined Server', value: member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown', inline: true },
        { name: `Roles [${member.roles.cache.size - 1}]`, value: roles, inline: false }
      )
      .setColor('Blurple')
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
