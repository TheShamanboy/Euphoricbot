import { EmbedBuilder } from 'discord.js';

export default {
    name: 'say',
    description: 'Make the bot say something.',
    async execute(message, args) {
        if (!args.length) {
            return message.reply("🗣️ What should I say?");
        }

        const embed = new EmbedBuilder()
            .setTitle("📢 Bot Says")
            .setDescription(args.join(" "))
            .setColor(0x3498db)
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        try {
            await message.delete();
        } catch {}

        message.channel.send({ embeds: [embed] });
    }
};
