const db = require("../model");
const {Telegraf} = require("telegraf");
const Message = db.messages;
const User = db.users;

const clientBot = new Telegraf(process.env.BOT_TOKEN);

async function setCommands(bot) {
    let commands = [
        {command: 'start', description: "Botni ishga tushirish"},
        {command: 'login', description: "Tizimga kirish"},
        {command: 'groups', description: "Guruhlaringiz"},
        {command: 'channels', description: "Kanallaringiz"},
        {command: 'ads', description: "E'lonlar"},
        {command: 'help', description: "Yordam olish"},
        {command: 'logout', description: "Tizimdan chiqish"},
    ].filter(Boolean);

    try {
        await bot.telegram.setMyCommands(commands);
    } catch (error) {
        console.error('Error setting commands:', error);
    }
}

async function handleSendAdsToUsers(ctx, pendingMessage) {

    const users = await User.findAll({
        where: {
            role: "user"
        }
    });

    const userIds = users.map(row => row.user_id);

    for (const userId of userIds) {
        try {
            await clientBot.telegram.forwardMessage(userId, pendingMessage.chat_id, pendingMessage.message_id);
        } catch (err) {
            console.error(`Foydalanuvchi ${userId} ga xabar yuborishda xatolik: ${err.message}`);
        }
    }

    ctx.reply("Reklama foydalanuvchilarga jo'natildi!")
    pendingMessage.sent = true;
    await pendingMessage.save();
}

module.exports = {setCommands, handleSendAdsToUsers}