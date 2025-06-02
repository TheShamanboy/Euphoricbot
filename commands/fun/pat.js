export default {
  name: 'pat',
  description: 'Pat someone affectionately.',
  usage: '@user',
  async execute(message, args) {
    const target = message.mentions.users.first();
    
    if (!target || target.id === message.author.id) {
      return message.reply('You need to mention someone else to pat!');
    }

    const gifs = [
      'https://media.giphy.com/media/ARSp9T7wwxNcs/giphy.gif',
      'https://media.giphy.com/media/L2z7dnOduqEow/giphy.gif',
      'https://media.giphy.com/media/109ltuoSQT212w/giphy.gif',
      'https://media.giphy.com/media/ye7OTQgwmVuVy/giphy.gif',
      'https://media.giphy.com/media/4HP0ddZnNVvKU/giphy.gif',
      'https://media.giphy.com/media/osYdfUptPqV0s/giphy.gif'
    ];

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    return message.channel.send({
      embeds: [{
        title: `${message.author.username} pats ${target.username}! 🥺💕`,
        image: { url: gif },
        color: 0xffc0cb,
        footer: { text: 'So wholesome!' }
      }]
    });
  }
};
