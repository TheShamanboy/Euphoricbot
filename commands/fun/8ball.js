import { EmbedBuilder } from 'discord.js';

export default {
    name: '8ball',
    description: 'Ask the magic 8-ball a question.',
    async execute(message, args) {
        if (!args.length) {
            return message.reply("🎱 You need to ask a question!");
        }

        const responses = [
            "Yes.", "No.", "Definitely.", "Absolutely not.",
            "Ask again later.", "I don't know.", "Maybe.", "Of course!",
            "Not in a million years.", "Without a doubt!"
        ];

        const embed = new EmbedBuilder()
            .setTitle("🎱 Magic 8-Ball")
            .addFields(
                { name: "❓ Question", value: args.join(" ") },
                { name: "🎯 Answer", value: responses[Math.floor(Math.random() * responses.length)] }
            )
            .setColor(0x9b59b6)
            .setFooter({ text: `Asked by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
