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

    const users = await User.findAll({
        where: {
            role: "user"
        }
    });

    const userIds = users.map(row => row.user_id);

    for (const userId of userIds) {
        switch (pendingMessage.message_type) {
            case 'text':
                await clientBot.telegram.sendMessage(userId, pendingMessage.message_id);
                break;
            case 'photo':
                await clientBot.telegram.sendPhoto(userId, pendingMessage.message_id);
                break;
            case 'video':
                await clientBot.telegram.sendVideo(userId, pendingMessage.message_id);
                break;
            case 'audio':
                await clientBot.telegram.sendAudio(userId, pendingMessage.message_id);
                break;
            default:
                console.log('Unsupported message type');
        }
    }

    ctx.reply("Reklama foydalanuvchilarga jo'natildi!")
    pendingMessage.sent = true;
    await pendingMessage.save();
}

module.exports = {setCommands, handleSendAdsToUsers}