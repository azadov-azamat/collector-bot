const {clearMediaDirectory, clearMessageTable, sendScheduledMessages} = require("../utils/functions");
const db = require("../model");
const ensureAuth = require("../middleware/ensure-auth");
const {Telegraf} = require("telegraf");
const Message = db.messages;

const clientBot = new Telegraf(process.env.BOT_TOKEN);

module.exports = function (bot) {
    bot.action('confirm_clear_all', ensureAuth(), async (ctx) => {
        try {
            clearMediaDirectory();
            await clearMessageTable();
            await ctx.editMessageText('Barcha media fayllar va xabarlar o\'chirildi.');
        } catch (err) {
            console.error('Xatolik:', err);
            await ctx.editMessageText('O\'chirishda xatolik yuz berdi.');
        }
    });

    bot.action('cancel_clear_all',ensureAuth(), async (ctx) => {
        await ctx.editMessageText('Tozalash bekor qilindi.');
    });

    bot.action(/confirm_(\d+)/, ensureAuth(), async (ctx) => {
        const messageId = ctx.match[1];
        await Message.update({status: true}, {where: {id: messageId}});
        await ctx.deleteMessage();
        ctx.reply('Xabar saqlandi.');
        await sendScheduledMessages(clientBot);
    });

    bot.action(/reject_(\d+)/, ensureAuth(), async (ctx) => {
        const messageId = ctx.match[1];
        await Message.destroy({where: {id: messageId}});
        await ctx.deleteMessage();
        ctx.reply('Xabar rad etildi.');
    });

    bot.catch((err, ctx) => {
        console.log(`Encountered an error for ${ctx.updateType}`, err);
    });
}