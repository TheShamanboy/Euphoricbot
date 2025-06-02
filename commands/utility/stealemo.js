import { PermissionsBitField } from 'discord.js';
import fetch from 'node-fetch'; // You need to install node-fetch@2 for ESM (or use native fetch if on Node 18+)

export default {
  name: 'stealemoji',
  description: 'Steal a custom emoji from another server and add it to this server',
  usage: '<emoji> [name]',
  args: true,
  guildOnly: true,

  async execute(message, args) {
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
      return message.reply('❌ I need the **Manage Emojis and Stickers** permission to do this.');
    }

    const emojiInput = args[0];
    const customName = args[1] || null;

    // Regex to match custom emoji format: <a:name:id> or <name:id>
    const emojiRegex = /<(a)?:\w+:(\d+)>/;
    const match = emojiRegex.exec(emojiInput);

    let emojiURL, name;

    if (match) {
      // It's a custom emoji
      const animated = Boolean(match[1]);
      const emojiId = match[2];
      const ext = animated ? 'gif' : 'png';
      emojiURL = `https://cdn.discordapp.com/emojis/${emojiId}.${ext}`;

      name = customName || `emoji_${emojiId}`;
    } else if (/^\p{Emoji}$/u.test(emojiInput)) {
      // Unicode emoji - can't steal
      return message.reply('❌ You can only steal custom emojis from other servers.');
    } else {
      // Maybe user inputted just an emoji ID?
      const emojiIdOnly = emojiInput.match(/\d{17,19}/);
      if (!emojiIdOnly) {
        return message.reply('❌ Please provide a valid custom emoji or emoji ID.');
      }
      emojiURL = `https://cdn.discordapp.com/emojis/${emojiIdOnly[0]}.png`;
      name = customName || `emoji_${emojiIdOnly[0]}`;
    }

    try {
      const response = await fetch(emojiURL);
      if (!response.ok) return message.reply('❌ Could not fetch that emoji.');

      const buffer = await response.buffer();
      const addedEmoji = await message.guild.emojis.create(buffer, name);

      return message.reply(`✅ Successfully added emoji: <:${addedEmoji.name}:${addedEmoji.id}>`);
    } catch (err) {
      console.error(err);
      return message.reply(`❌ Failed to add emoji: ${err.message}`);
    }
  }
};
