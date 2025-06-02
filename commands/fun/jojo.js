export default {
  name: 'jojo',
  description: 'Find out which JoJo character represents you!',
  async execute(message) {
    const characters = [
      { name: 'Jotaro Kujo', traits: 'Stoic, cool-headed, insanely strong Stand user.', image: 'https://i.postimg.cc/TYxB07h6/jotaro.jpg' },
      { name: 'Joseph Joestar', traits: 'Clever, cheeky, unpredictable trickster.', image: 'https://i.postimg.cc/7LjsbX9t/joseph.jpg' },
      { name: 'Dio Brando', traits: 'Charismatic villain with thirst for power.', image: 'https://i.postimg.cc/wTqpx6LV/dio-brando.jpg' },
      { name: 'Josuke Higashikata', traits: 'Kind-hearted, loyal, with a serious pompadour.', image: 'https://i.postimg.cc/Lzx6fT9/josuke.jpg' },
      { name: 'Giorno Giovanna', traits: 'Calm, ambitious, dreams of being a gang leader.', image: 'https://i.postimg.cc/jc1oymu/giorno.jpg' },
      { name: 'Kakyoin Noriaki', traits: 'Intelligent, calm, loyal friend.', image: 'https://i.postimg.cc/7QZajVr/kakyoin.jpg' },
      { name: 'Rohan Kishibe', traits: 'Eccentric, artistic, mysterious manga artist.', image: 'https://i.postimg.cc/PxH4b7Wx/rohan.jpg' },
      { name: 'Okuyasu Nijimura', traits: 'Loyal, strong but a bit dim-witted.', image: 'https://i.postimg.cc/Rh7qTN43/okuyasu.jpg' },
      { name: 'Caesar Anthonio Zeppeli', traits: 'Passionate, brave, and proud.', image: 'https://i.postimg.cc/JnYL37Ff/caesar.jpg' },
      { name: 'Bruno Bucciarati', traits: 'Honorable, loyal, strong leader.', image: 'https://i.postimg.cc/jSnKG54t/bruno.jpg' },
      // … [Add 90 more characters like this]
    ];

    const random = characters[Math.floor(Math.random() * characters.length)];

    const embed = {
      color: 0xAA0000,
      title: `🌟 You are ${random.name}!`,
      description: `**Traits:** ${random.traits}`,
      image: { url: random.image },
      footer: {
        text: `Requested by ${message.author.tag}`,
        icon_url: message.author.displayAvatarURL()
      }
    };

    await message.channel.send({ embeds: [embed] });
  }
};
