export default {
  name: 'beastar',
  description: 'Find out which Beastars character represents you!',
  async execute(message) {
    const characters = [
      { name: 'Legoshi', traits: 'Introverted, kind-hearted gray wolf with a complex personality.', image: 'https://i.postimg.cc/76xxtQzr/legoshi.jpg' },
      { name: 'Haru', traits: 'Bold, independent, strong-willed dwarf rabbit.', image: 'https://i.postimg.cc/6qMf28Xz/haru.jpg' },
      { name: 'Louis', traits: 'Confident, proud red deer, drama club leader.', image: 'https://i.postimg.cc/V6T2fGXd/louis.jpg' },
      { name: 'Juno', traits: 'Determined and charismatic gray wolf.', image: 'https://i.postimg.cc/cH2vZ1KC/juno.jpg' },
      { name: 'Gohin', traits: 'Wise, quirky panda, mentor to Legoshi.', image: 'https://i.postimg.cc/9Xc15wpG/gohin.jpg' },
      { name: 'Ibuki', traits: 'Energetic and competitive Bengal tiger.', image: 'https://i.postimg.cc/8z0gVNLv/ibuki.jpg' },
      { name: 'Tem', traits: 'Mysterious and stoic llama.', image: 'https://i.postimg.cc/MH5km2yR/tem.jpg' },
      { name: 'Dom', traits: 'Friendly, relaxed brown bear.', image: 'https://i.postimg.cc/1tJr7Wyn/dom.jpg' },
      { name: 'Els', traits: 'Proud and confident giant panda.', image: 'https://i.postimg.cc/MGJ2P5jZ/els.jpg' },
      { name: 'Harmony', traits: 'Wise and gentle deer.', image: 'https://i.postimg.cc/hjBqfjcn/harmony.jpg' },
      // … [Add 90 more characters like this]
    ];

    const random = characters[Math.floor(Math.random() * characters.length)];

    const embed = {
      color: 0x006400,
      title: `🐺 You are ${random.name}!`,
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
