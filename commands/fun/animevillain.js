export default {
  name: 'animevillain',
  description: 'Find out which anime villain represents you!',
  async execute(message) {
    const villains = [
      {
        name: 'Light Yagami',
        anime: 'Death Note',
        traits: 'Ruthless genius with a god complex.',
        image: 'https://static.wikia.nocookie.net/deathnote/images/e/e3/Light_Yagami.png'
      },
      {
        name: 'Dio Brando',
        anime: 'JoJo\'s Bizarre Adventure',
        traits: 'Immortal, manipulative, and stylish.',
        image: 'https://static.wikia.nocookie.net/jjba/images/f/f4/Dio_Brando.png'
      },
      {
        name: 'Frieza',
        anime: 'Dragon Ball Z',
        traits: 'Cruel, tyrannical alien warlord.',
        image: 'https://static.wikia.nocookie.net/dragonball/images/7/7d/Frieza_DBZ_Ep_87_001.png'
      },
      {
        name: 'Sosuke Aizen',
        anime: 'Bleach',
        traits: 'Master manipulator with a godlike presence.',
        image: 'https://static.wikia.nocookie.net/bleach/images/5/5c/Sosuke_Aizen_Infobox.png'
      },
      {
        name: 'Meruem',
        anime: 'Hunter x Hunter',
        traits: 'Complex, powerful, and philosophical king.',
        image: 'https://static.wikia.nocookie.net/hunterxhunter/images/2/2e/Meruem_Profile.png'
      },
      {
        name: 'Madara Uchiha',
        anime: 'Naruto',
        traits: 'Legendary ninja with world-shaking ambition.',
        image: 'https://static.wikia.nocookie.net/naruto/images/9/9b/Madara_Uchiha.png'
      },
      {
        name: 'Orochimaru',
        anime: 'Naruto',
        traits: 'Snake-like genius scientist obsessed with immortality.',
        image: 'https://static.wikia.nocookie.net/naruto/images/d/da/Orochimaru_Part_II.png'
      },
      {
        name: 'Shogo Makishima',
        anime: 'Psycho-Pass',
        traits: 'Charismatic anarchist who hates society.',
        image: 'https://static.wikia.nocookie.net/psychopass/images/4/43/ShogoMakishima.png'
      },
      {
        name: 'Yuno Gasai',
        anime: 'Future Diary',
        traits: 'Obsessive and dangerously loyal.',
        image: 'https://static.wikia.nocookie.net/future-diary/images/3/36/Yuno_Gasai.png'
      },
      {
        name: 'Envy',
        anime: 'Fullmetal Alchemist: Brotherhood',
        traits: 'Shapeshifter filled with hatred and jealousy.',
        image: 'https://static.wikia.nocookie.net/fma/images/e/e1/Envy_Brotherhood.png'
      }
      // 🔥 Add up to 100 more here using same format with valid static image URLs
    ];

    const chosen = villains[Math.floor(Math.random() * villains.length)];

    const embed = {
      color: 0x8B0000,
      title: `😈 You are ${chosen.name}!`,
      description: `From *${chosen.anime}*\n\n**Traits:** ${chosen.traits}`,
      image: {
        url: chosen.image
      },
      footer: {
        text: `Requested by ${message.author.tag}`,
        icon_url: message.author.displayAvatarURL()
      }
    };

    await message.channel.send({ embeds: [embed] });
  }
};

