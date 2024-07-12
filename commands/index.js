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
        {command: 'login', description: "Tizimdan chiqish"},
    ].filter(Boolean);

    try {
        await bot.telegram.setMyCommands(commands);
    } catch (error) {
        console.error('Error setting commands:', error);
    }
}

async function handleSendAdsToUsers(ctx, pendingMessage) {

    console.log("pendingMessage", pendingMessage)
    console.log("pendingMessage.mes ========== ", pendingMessage.message_id);
    const users = await User.findAll({
        where: {
            role: "user"
        }
    });

    const userIds = users.map(row => row.user_id);

    for (const userId of userIds) {
        try {
            if (pendingMessage.message_type === 'text') {
                console.error("text ga tushdi apandim")
                await clientBot.telegram.sendMessage(userId, pendingMessage.message_id);
            } else if (pendingMessage.message_type === 'photo') {
                console.error("photo ga tushdi apandim")
                await clientBot.telegram.sendPhoto(userId, pendingMessage.file_id);
            } else if (pendingMessage.message_type === 'video') {
                await clientBot.telegram.sendVideo(userId, pendingMessage.file_id);
            } else if (pendingMessage.message_type === 'audio') {
                await clientBot.telegram.sendAudio(userId, pendingMessage.file_id);
            }
        } catch (err) {
            console.error(`Foydalanuvchi ${userId} ga xabar yuborishda xatolik: ${err.message}`);
        }
    }

    ctx.reply("Reklama foydalanuvchilarga jo'natildi!")
    pendingMessage.sent = true;
    await pendingMessage.save();
}

module.exports = {setCommands, handleSendAdsToUsers}