export default {
  name: 'hug',
  description: 'Hug someone!',
  usage: '@user',
  async execute(message) {
    const target = message.mentions.users.first() || message.author;

    const gifs = [
      'https://media.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif',
      'https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif',
      'https://media.giphy.com/media/143v0Z4767T15e/giphy.gif'
    ];

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    const self = target.id === message.author.id;

    return message.channel.send({
      embeds: [{
        title: self
          ? `${message.author.username} gives themselves a hug... 🫂`
          : `${message.author.username} hugs ${target.username}! 💖`,
        image: { url: gif },
        color: 0xff69b4,
        footer: { text: self ? 'You are loved too!' : 'Friendship level +1 💕' }
      }]
    });
  }
};
