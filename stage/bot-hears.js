const {getGroup} = require("../scene/group");
const {getChannels} = require("../scene/channel");
const {Markup} = require("telegraf");
const db = require("../model");
const ensureAuth = require("../middleware/ensure-auth");

const Message = db.messages;

module.exports = function (bot) {
    bot.hears('Guruh qo\'shish ➕', ensureAuth(), (ctx) => {
        ctx.scene.enter('addGroupScene');
    });

    bot.hears('Guruhlar ro\'yhati 🤔', ensureAuth(), getGroup);

    bot.hears('Guruh o\'zgartirish 🔄', ensureAuth(), (ctx) => {
        ctx.scene.enter('updateGroupScene');
    });

    bot.hears('Guruh o\'chirish 🗑', ensureAuth(), (ctx) => {
        ctx.scene.enter('deleteGroupScene');
    });

    bot.hears('Kanallar ro\'yhati 🤔', ensureAuth(), getChannels);

    bot.hears('Kanal qo\'shish ➕', ensureAuth(), (ctx) => {
        ctx.reply("Kanal qo'shishdan oldin, admin va client bot larni kanal admini qiling!")
        ctx.reply("O'zingizning kanalingizni ro'yhatdan tanlang ", Markup.keyboard([
            Markup.button.channelRequest("Tanlash", 1)
        ]).resize().oneTime());
        // ctx.scene.enter('addChannelScene');
    });

    bot.hears('Kanal o\'zgartirish 🔄', ensureAuth(), (ctx) => {
        ctx.scene.enter('updateChannelScene');
    });

    bot.hears('Kanal o\'chirish 🗑', ensureAuth(), (ctx) => {
        ctx.scene.enter('deleteChannelScene');
    });

    bot.hears(/To'g'ri (\d+)/, ensureAuth(), async (ctx) => {
        const messageId = ctx.match[1];
        await Message.update({status: true}, {where: {id: messageId}});
        await ctx.reply('Xabar saqlandi.');
    });

    bot.hears(/Noto'g'ri (\d+)/, ensureAuth(), async (ctx) => {
        const messageId = ctx.match[1];
        await Message.destroy({where: {id: messageId}});
        await ctx.reply('Xabar rad etildi.');
    });

}