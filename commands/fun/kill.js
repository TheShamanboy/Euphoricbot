export default {
  name: 'kill',
  description: 'Kill another user (for fun, of course).',
  usage: '@user',
  async execute(message, args) {
    const target = message.mentions.users.first();
    if (!target || target.id === message.author.id) {
      return message.reply('You must mention someone else to kill!');
    }

    const gifs = [
      'https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/giphy.gif',
      'https://media.giphy.com/media/TqiwHbFBaZ4ti/giphy.gif',
      'https://media.giphy.com/media/26ufnwz3wDUli7GU0/giphy.gif',
      'https://media.giphy.com/media/l1J9EdzfOSgfyueLm/giphy.gif',
      'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif'
    ];

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    return message.channel.send({
      embeds: [{
        title: `${message.author.username} has killed ${target.username}! ⚔️`,
        image: { url: gif },
        color: 0xff0000,
        footer: { text: 'Rest in peace motherfucker' }
      }]
    });
  }
};
