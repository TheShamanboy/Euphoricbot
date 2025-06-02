import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { spin } from '../../utils/spinner.js'; 
import { handleGameAction, startBlackjack, startRoulette } from '../../utils/games.js'; 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config.json'), 'utf8'));

const { dailyReward, spinCosts } = config;


export const data = new SlashCommandBuilder()
    .setName('economy')
    .setDescription('Access the economy system');
export async function execute(interaction) {
    const mainEmbed = Embeds.createMainEmbed();
    const mainButtons = Embeds.createMainButtons();

    await interaction.reply({
        embeds: [mainEmbed],
        components: [mainButtons],
        ephemeral: false
    });
}
export async function handleButtonInteraction(interaction) {
    const userId = interaction.user.id;
    const userData = getUser(userId);

    switch (interaction.customId) {
        case 'profile':
            await this.handleProfile(interaction, userData);
            break;
        case 'spin':
            await this.handleSpin(interaction, userData);
            break;
        case 'shop':
            await this.handleShop(interaction, userData);
            break;
        case 'inventory':
            await this.handleInventory(interaction, userData);
            break;
        case 'claim_daily':
            await this.handleDailyReward(interaction, userData);
            break;
        case 'spin_x1':
        case 'spin_x2':
        case 'spin_x3':
            await this.handleSpinAction(interaction, userData);
            break;
        case 'play_blackjack':
            await this.handleBlackjack(interaction, userData);
            break;
        case 'play_roulette':
            await this.handleRoulette(interaction, userData);
            break;
    }

    if (interaction.customId.startsWith('claim_role_')) {
        await this.handleRoleClaim(interaction, userData);
    }

    if (interaction.customId.startsWith('bj_') || interaction.customId.startsWith('roulette_')) {
        await handleGameAction(interaction, userData);
    }
}
export async function handleSelectMenuInteraction(interaction) {
    const userId = interaction.user.id;
    const userData = getUser(userId);

    if (interaction.customId === 'shop_select') {
        await this.handleShopPurchase(interaction, userData);
    }
}
export async function handleProfile(interaction, userData) {
    const canClaim = canClaimDaily(userData.userId);
    const profileEmbed = Embeds.createProfileEmbed(userData, canClaim);

    const profileButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('claim_daily')
                .setLabel(canClaim ? 'Claim Daily Reward' : 'Daily Claimed')
                .setStyle(canClaim ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setDisabled(!canClaim),
            new ButtonBuilder()
                .setCustomId('play_blackjack')
                .setLabel('Play Blackjack')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('play_roulette')
                .setLabel('Play Roulette')
                .setStyle(ButtonStyle.Primary)
        );

    await interaction.reply({
        embeds: [profileEmbed],
        components: [profileButtons],
        ephemeral: true
    });
}
export async function handleSpin(interaction, userData) {
    const spinEmbed = Embeds.createSpinEmbed(userData);
    const spinButtons = Embeds.createSpinButtons(userData);

    await interaction.reply({
        embeds: [spinEmbed],
        components: [spinButtons],
        ephemeral: true
    });
}
export async function handleShop(interaction, userData) {
    const shopEmbed = Embeds.createShopEmbed(userData);
    const shopMenu = Embeds.createShopMenu();

    await interaction.reply({
        embeds: [shopEmbed],
        components: [shopMenu],
        ephemeral: true
    });
}
export async function handleInventory(interaction, userData) {
    const inventoryEmbed = Embeds.createInventoryEmbed(userData);
    const inventoryButtons = Embeds.createInventoryButtons(userData);

    await interaction.reply({
        embeds: [inventoryEmbed],
        components: [inventoryButtons],
        ephemeral: true
    });
}
export async function handleDailyReward(interaction, userData) {
    if (!canClaimDaily(userData.userId)) {
        await interaction.reply({
            content: '❌ You have already claimed your daily reward!',
            ephemeral: true
        });
        return;
    }

    userData.currency += dailyReward;
    userData.lastDaily = Date.now();
    userData.xp += 25;
    saveUser(userData.userId, userData);

    const rewardEmbed = new EmbedBuilder()
        .setTitle('🎉 Daily Reward Claimed!')
        .setDescription(`You received **${dailyReward}** coins and **25** XP!`)
        .setColor('#00ff00')
        .addFields(
            { name: 'New Balance', value: `${userData.currency} coins`, inline: true },
            { name: 'XP', value: `${userData.xp}`, inline: true }
        );

    await interaction.reply({
        embeds: [rewardEmbed],
        ephemeral: true
    });
}
export async function handleSpinAction(interaction, userData) {
    const spinType = interaction.customId.split('_')[1];
    const spins = parseInt(spinType.substring(1));
    const cost = spinCosts[spinType];

    if (userData.currency < cost) {
        await interaction.reply({
            content: `❌ You need **${cost}** coins to spin ${spins} time(s). You have **${userData.currency}** coins.`,
            ephemeral: true
        });
        return;
    }

    userData.currency -= cost;
    const results = [];

    for (let i = 0; i < spins; i++) {
        const result = spin();

        if (!result) {
            await interaction.reply({
                content: '❌ No roles available to spin! Ask an admin to add roles using `/additem`.',
                ephemeral: true
            });
            return;
        }

        results.push(result);

        if (!userData.inventory[result.category]) {
            userData.inventory[result.category] = [];
        }
        userData.inventory[result.category].push(result);
    }

    saveUser(userData.userId, userData);

    const resultsEmbed = Embeds.createSpinResultsEmbed(results, userData.currency);

    await interaction.reply({
        embeds: [resultsEmbed],
        ephemeral: true
    });
}
export async function handleShopPurchase(interaction, userData) {
    try {
        const itemId = interaction.values[0];
        const shopData = getShopData();
        const item = shopData.items.find(i => i.id === itemId);

        if (!item) {
            await interaction.reply({ content: '❌ Item not found!', ephemeral: true });
            return;
        }

        if (userData.currency < item.price) {
            await interaction.reply({ content: `❌ You need **${item.price}** coins to buy **${item.name}**. You have **${userData.currency}** coins.`, ephemeral: true });
            return;
        }

        userData.currency -= item.price;

        // Handle different item types safely
        switch (item.type) {
            case 'spins':
                if (typeof userData.spins !== 'number') userData.spins = 0;
                userData.spins += item.quantity;
                break;
            case 'xp':
                userData.xp += item.quantity;
                break;
            case 'currency':
                userData.currency += item.quantity;
                break;
            default:
                console.warn(`Unknown item type: ${item.type}`);
        }

        saveUser(userData.userId, userData);

        const purchaseEmbed = new EmbedBuilder()
            .setTitle('🛒 Purchase Successful!')
            .setDescription(`You bought **${item.name}** for **${item.price}** coins!`)
            .setColor('#00ff00')
            .addFields({ name: 'New Balance', value: `${userData.currency} coins`, inline: true });

        await interaction.reply({ embeds: [purchaseEmbed], ephemeral: true });

    } catch (error) {
        console.error('Error in handleShopPurchase:', error);
        await interaction.reply({ content: '❌ There was an error processing your purchase.', ephemeral: true });
    }
}
export async function handleRoleClaim(interaction, userData) {
    const roleId = interaction.customId.replace('claim_role_', '');
    const guild = interaction.guild;
    const member = interaction.member;

    try {
        const role = guild.roles.cache.get(roleId);
        if (!role) {
            await interaction.reply({
                content: '❌ Role not found!',
                ephemeral: true
            });
            return;
        }

        const ownsRole = Object.values(userData.inventory).flat().some(item => item.roleId === roleId);

        if (!ownsRole) {
            await interaction.reply({
                content: '❌ You do not own this role!',
                ephemeral: true
            });
            return;
        }

        await member.roles.add(role);

        await interaction.reply({
            content: `✅ Successfully claimed the **${role.name}** role!`,
            ephemeral: true
        });
    } catch (error) {
        console.error('Error claiming role:', error);
        await interaction.reply({
            content: '❌ Failed to claim role. Please contact an administrator.',
            ephemeral: true
        });
    }
}
export async function handleBlackjack(interaction, userData) {
    await startBlackjack(interaction, userData);
}
export async function handleRoulette(interaction, userData) {
    await startRoulette(interaction, userData);
}
