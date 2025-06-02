import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import database from '../../utils/database.js';

// ESM doesn't support __dirname natively, so define it manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const data = new SlashCommandBuilder()
  .setName('additem')
  .setDescription('Add a new item to the shop (Admin only)')
  .addStringOption(option =>
    option.setName('id').setDescription('Unique ID for the item').setRequired(true))
  .addStringOption(option =>
    option.setName('name').setDescription('Display name of the item').setRequired(true))
  .addIntegerOption(option =>
    option.setName('price').setDescription('Price in coins').setRequired(true))
  .addStringOption(option =>
    option.setName('type')
      .setDescription('Type of item')
      .setRequired(true)
      .addChoices(
        { name: 'Spins', value: 'spins' },
        { name: 'XP', value: 'xp' },
        { name: 'Currency', value: 'currency' },
        { name: 'Role - Colors', value: 'role_colors' },
        { name: 'Role - Badges', value: 'role_badges' },
        { name: 'Role - Misc', value: 'role_misc' },
        { name: 'Custom', value: 'custom' }
      ))
  .addIntegerOption(option =>
    option.setName('quantity').setDescription('Amount/quantity of the item').setRequired(true))
  .addStringOption(option =>
    option.setName('description').setDescription('Description of the item').setRequired(true))
  .addStringOption(option =>
    option.setName('emoji').setDescription('Emoji for the item (optional)').setRequired(false))
  .addRoleOption(option =>
    option.setName('role')
      .setDescription('Discord role to give (required for role types)')
      .setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: '❌ You need Administrator permissions to use this command!',
      ephemeral: true
    });
    return;
  }

  const id = interaction.options.getString('id');
  const name = interaction.options.getString('name');
  const price = interaction.options.getInteger('price');
  const type = interaction.options.getString('type');
  const quantity = interaction.options.getInteger('quantity');
  const description = interaction.options.getString('description');
  const emoji = interaction.options.getString('emoji') || '🎁';
  const role = interaction.options.getRole('role');

  if (price < 1) {
    await interaction.reply({ content: '❌ Price must be at least 1 coin!', ephemeral: true });
    return;
  }

  if (quantity < 1) {
    await interaction.reply({ content: '❌ Quantity must be at least 1!', ephemeral: true });
    return;
  }

  if (type.startsWith('role_') && !role) {
    await interaction.reply({
      content: '❌ You must select a Discord role when adding a role type item!',
      ephemeral: true
    });
    return;
  }

  try {
    const shopData = database.getShopData();

    if (shopData.items.find(item => item.id === id)) {
      await interaction.reply({
        content: `❌ An item with ID '${id}' already exists!`,
        ephemeral: true
      });
      return;
    }

    const newItem = { id, name, price, type, quantity, description, emoji };

    if (type.startsWith('role_')) {
      const category = type.replace('role_', '');
      const rolesData = database.getRolesData();

      if (!rolesData.categories[category]) {
        await interaction.reply({
          content: `❌ Invalid role category: ${category}`,
          ephemeral: true
        });
        return;
      }

      const roleItem = { id, name, roleId: role.id, emoji };
      rolesData.categories[category].roles.push(roleItem);

      const rolesPath = path.join(__dirname, '../data/roles.json');
      fs.writeFileSync(rolesPath, JSON.stringify(rolesData, null, 2));

      const successEmbed = new EmbedBuilder()
        .setTitle('✅ Role Added to Spinner!')
        .setColor('#00ff00')
        .addFields(
          { name: 'Role', value: `${emoji} ${role.name}`, inline: true },
          { name: 'Category', value: category, inline: true },
          { name: 'ID', value: id, inline: true }
        )
        .setDescription(`The role has been added to the ${category} category and will now appear in spins!`)
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed], ephemeral: true });
      return;
    }

    shopData.items.push(newItem);
    const shopPath = path.join(__dirname, '../data/shop.json');
    fs.writeFileSync(shopPath, JSON.stringify(shopData, null, 2));

    const successEmbed = new EmbedBuilder()
      .setTitle('✅ Item Added Successfully!')
      .setColor('#00ff00')
      .addFields(
        { name: 'ID', value: id, inline: true },
        { name: 'Name', value: `${emoji} ${name}`, inline: true },
        { name: 'Price', value: `${price} coins`, inline: true },
        { name: 'Type', value: type, inline: true },
        { name: 'Quantity', value: quantity.toString(), inline: true },
        { name: 'Description', value: description, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [successEmbed], ephemeral: true });

  } catch (error) {
    console.error('Error adding item to shop:', error);
    await interaction.reply({
      content: '❌ An error occurred while adding the item to the shop!',
      ephemeral: true
    });
  }
}
