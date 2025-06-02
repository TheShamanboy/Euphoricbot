import { PermissionFlagsBits } from 'discord.js';

export default {
  name: 'clear',
  description: 'Delete a number of messages from the channel',
  usage: '<amount>',
  args: true,
  guildOnly: true,
  async execute(message, args) {
    // Check if the user has Manage Messages permission
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply("❌ You need the **Manage Messages** permission to use this command.");
    }

    const amount = parseInt(args[0], 10);
    if (!amount || amount < 1 || amount > 100) {
      return message.reply('❌ Please provide a number between 1 and 100.');
    }

    try {
      // Delete the specified number of messages + the command message itself
      await message.channel.bulkDelete(amount + 1, true);
      const replyMsg = await message.channel.send(`✅ Deleted ${amount} messages.`);
      setTimeout(() => replyMsg.delete(), 5000); // delete confirmation after 5 seconds
    } catch (error) {
      console.error(error);
      message.reply('❌ Error trying to delete messages in this channel.');
    }
  }
};
