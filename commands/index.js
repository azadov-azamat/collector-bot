const dotenv = require('dotenv');
dotenv.config();

async function setCommands(bot) {
    let commands = [
        {command: 'start', description: "Botni ishga tushirish"},
        {command: 'login', description: "Tizimga kirish"},
        {command: 'groups', description: "Guruhlaringiz"},
        {command: 'channels', description: "Kanallaringiz"},
        {command: 'ads', description: "E'lonlar"},
        {command: 'help', description: "Yordam olish"},
        {command: 'clear_ads', description: "Yuklangan reklamalarni o'chirish"},
        {command: 'logout', description: "Tizimdan chiqish"},
    ].filter(Boolean);

    try {
        await bot.telegram.setMyCommands(commands);
    } catch (error) {
        console.error('Error setting commands:', error);
    }
}

module.exports = {setCommands}