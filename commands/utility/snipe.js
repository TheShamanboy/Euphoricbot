import { EmbedBuilder } from 'discord.js';

export default {
    name: 'snipe',
    description: 'Snipe the last deleted message in the channel.',
    async execute(message, args, client) {
        const snipes = client.snipes || new Map();
        const snipe = snipes.get(message.channel.id);

        if (!snipe) {
            return message.channel.send("⚠️ There's nothing to snipe!");
        }

        const embed = new EmbedBuilder()
            .setAuthor({ name: snipe.author.tag, iconURL: snipe.author.displayAvatarURL() })
            .setDescription(snipe.content)
            .setFooter({ text: `Sniped by ${message.author.tag}` })
            .setTimestamp(snipe.time)
            .setColor(0x5865F2); // Discord blurple

        message.channel.send({ embeds: [embed] });
    }
};
