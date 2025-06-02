import { EmbedBuilder } from 'discord.js';

export default {
    name: 'coinflip',
    description: 'Flip a coin!',
    async execute(message) {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';

        const embed = new EmbedBuilder()
            .setTitle("🪙 Coin Flip")
            .setDescription(`The coin landed on **${result}**!`)
            .setColor(0xf1c40f)
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
