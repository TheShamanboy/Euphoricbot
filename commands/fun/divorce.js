import { EmbedBuilder } from 'discord.js';

export default {
  name: 'divorce',
  description: 'Divorce your current partner.',
  usage: '',
  guildOnly: true,

  async execute(message, args, client) {
    if (!client.marriages) client.marriages = new Map();

    const partnerEntry = [...client.marriages.entries()].find(
      ([user1, user2]) =>
        user1 === message.author.id || user2 === message.author.id
    );

    if (!partnerEntry) {
      return message.reply("You're not married to anyone.");
    }

    const [user1, user2] = partnerEntry;
    const partnerId = user1 === message.author.id ? user2 : user1;

    client.marriages.delete(user1);

    const embed = new EmbedBuilder()
      .setTitle('💔 Divorce Finalized')
      .setDescription(`💔 <@${message.author.id}> and <@${partnerId}> are now divorced.`)
      .setColor(0x808080)
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
