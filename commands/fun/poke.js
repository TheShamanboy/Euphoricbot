export default {
  name: 'poke',
  description: 'Poke someone!',
  usage: '@user',
  async execute(message) {
    const target = message.mentions.users.first() || message.author;

    const gifs = [
      'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
      'https://media.giphy.com/media/Lb3vIJjaSIQWA/giphy.gif',
      'https://media.giphy.com/media/Zau0yrl17uzdK/giphy.gif'
    ];

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    const self = target.id === message.author.id;

    return message.channel.send({
      embeds: [{
        title: self
          ? `${message.author.username} pokes themselves... odd choice 🤨`
          : `${message.author.username} pokes ${target.username}! 👉`,
        image: { url: gif },
        color: 0xffa07a,
        footer: { text: self ? 'Need attention?' : 'Playful vibes!' }
      }]
    });
  }
};
