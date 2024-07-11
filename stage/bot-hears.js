const {getGroup} = require("../scene/group");
const {getChannels} = require("../scene/channel");

module.exports = function(bot) {
    bot.hears('Guruh qo\'shish', (ctx) => {
        ctx.scene.enter('addGroupScene');
    });

    bot.hears('Guruhlar ro\'yhati', getGroup);

    bot.hears('Guruh o\'zgartirish', (ctx) => {
        ctx.scene.enter('updateGroupScene');
    });

    bot.hears('Guruh o\'chirish', (ctx) => {
        ctx.scene.enter('deleteGroupScene');
    });

    bot.hears('Kanallar ro\'yhati', getChannels);

    bot.hears('Kanal qo\'shish', (ctx) => {
        ctx.scene.enter('addChannelScene');
    });

    bot.hears('Kanal o\'zgartirish', (ctx) => {
        ctx.scene.enter('updateChannelScene');
    });

    bot.hears('Kanal o\'chirish', (ctx) => {
        ctx.scene.enter('deleteChannelScene');
    });
}