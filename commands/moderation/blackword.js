import fs from 'fs';
import path from 'path';

const blackwordPath = path.join(process.cwd(), 'data', 'blackword.json');

function loadBlackwords() {
  if (!fs.existsSync(blackwordPath)) {
    return { words: [] };
  }
  return JSON.parse(fs.readFileSync(blackwordPath, 'utf-8'));
}

function saveBlackwords(data) {
  fs.writeFileSync(blackwordPath, JSON.stringify(data, null, 2), 'utf-8');
}

export default {
  name: 'blackword',
  description: 'Manage blacklisted words',
  guildOnly: true,
  args: true,
  usage: '<add|remove|list> [word]',
  async execute(message, args) {
    const subcommand = args[0]?.toLowerCase();

    if (!['add', 'remove', 'list'].includes(subcommand)) {
      return message.reply(`Invalid subcommand. Use \`add\`, \`remove\`, or \`list\`.`);
    }

    const blackwordsData = loadBlackwords();

    if (subcommand === 'list') {
      if (blackwordsData.words.length === 0) {
        return message.channel.send('The blackword list is currently empty.');
      }
      return message.channel.send(`Blacklisted words: \`${blackwordsData.words.join('`, `')}\``);
    }

    const word = args[1]?.toLowerCase();
    if (!word) {
      return message.reply('Please specify a word.');
    }

    if (subcommand === 'add') {
      if (blackwordsData.words.includes(word)) {
        return message.reply(`The word \`${word}\` is already blacklisted.`);
      }
      blackwordsData.words.push(word);
      saveBlackwords(blackwordsData);
      return message.channel.send(`Added \`${word}\` to the blackword list.`);
    }

    if (subcommand === 'remove') {
      if (!blackwordsData.words.includes(word)) {
        return message.reply(`The word \`${word}\` is not in the blackword list.`);
      }
      blackwordsData.words = blackwordsData.words.filter(w => w !== word);
      saveBlackwords(blackwordsData);
      return message.channel.send(`Removed \`${word}\` from the blackword list.`);
    }
  },
};
