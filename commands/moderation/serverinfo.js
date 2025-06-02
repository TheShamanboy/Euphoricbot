import { EmbedBuilder } from 'discord.js';

export default {
    name: 'serverinfo',
    description: 'Displays information about the server.',
    async execute(message) {
        const { guild } = message;

        const embed = new EmbedBuilder()
            .setTitle(`🌐 Server Info: ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '📛 Name', value: guild.name, inline: true },
                { name: '🆔 ID', value: guild.id, inline: true },
                { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: '🗓️ Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
                { name: '💬 Channels', value: `${guild.channels.cache.size}`, inline: true },
                { name: '🛡️ Verification Level', value: `${guild.verificationLevel}`, inline: true },
                { name: '🌍 Region', value: guild.preferredLocale, inline: true }
            )
            .setColor(0x00AE86)
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
