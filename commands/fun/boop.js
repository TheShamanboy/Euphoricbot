export default {
  name: 'boop',
  description: 'Boop someone on the nose!',
  usage: '@user',
  async execute(message) {
    const target = message.mentions.users.first() || message.author;

    const gifs = [
      'https://media.giphy.com/media/fxsqOYnIMEefC/giphy.gif',
      'https://media.giphy.com/media/10vXQwF0XayUUE/giphy.gif',
      'https://media.giphy.com/media/4no1U4N2uGHtS/giphy.gif'
    ];

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    const self = target.id === message.author.id;

    return message.channel.send({
      embeds: [{
        title: self
          ? `${message.author.username} boops their own nose... boop boop 🤏`
          : `${message.author.username} boops ${target.username} on the nose! 🐽`,
        image: { url: gif },
        color: 0xfadadd,
        footer: { text: self ? 'That’s cute tbh.' : 'Friendly boops increase serotonin.' }
      }]
    });
  }
};
