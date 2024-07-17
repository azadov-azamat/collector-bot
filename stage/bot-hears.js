const {getGroup} = require("../scene/group");
const {getChannels} = require("../scene/channel");
const {Markup} = require("telegraf");
const db = require("../model");

const Message = db.messages;

module.exports = function (bot) {
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
        ctx.reply("Kanal qo'shishdan oldin, admin va client bot larni kanal admini qiling!")
        ctx.reply("O'zingizning kanalingizni ro'yhatdan tanlang ", Markup.keyboard([
            Markup.button.channelRequest("Tanlash", 1)
        ]).resize().oneTime());
        // ctx.scene.enter('addChannelScene');
    });

    bot.hears('Kanal o\'zgartirish', (ctx) => {
        ctx.scene.enter('updateChannelScene');
    });

    bot.hears('Kanal o\'chirish', (ctx) => {
        ctx.scene.enter('deleteChannelScene');
    });

    bot.hears(/To'g'ri (\d+)/, async (ctx) => {
        const messageId = ctx.match[1];
        await Message.update({ status: true }, { where: { id: messageId } });
        await ctx.reply('Xabar saqlandi.');
    });

    bot.hears(/Noto'g'ri (\d+)/, async (ctx) => {
        const messageId = ctx.match[1];
        await Message.destroy({ where: { id: messageId } });
        await ctx.reply('Xabar rad etildi.');
    });

}