async function setCommands(bot) {
    let commands = [
        { command: 'start', description: "Botni ishga tushirish" },
        { command: 'login', description: "Tizimga kirish" },
        { command: 'groups', description: "Guruhlaringiz" },
        { command: 'channels', description: "Kanallaringiz" },
        { command: 'help', description: "Yordam olish" },
    ].filter(Boolean);

    try {
        await bot.telegram.setMyCommands(commands);
    } catch (error) {
        console.error('Error setting commands:', error);
    }
}

module.exports = {setCommands}