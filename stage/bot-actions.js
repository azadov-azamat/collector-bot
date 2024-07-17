const {clearMediaDirectory, clearMessageTable} = require("../utils/functions");
const db = require("../model");
const Message = db.messages;

module.exports = function (bot) {
    bot.action('confirm_clear_all', async (ctx) => {
        try {
            clearMediaDirectory();
            await clearMessageTable();
            await ctx.deleteMessage();
            await ctx.editMessageText('Barcha media fayllar va xabarlar o\'chirildi.');
        } catch (err) {
            console.error('Xatolik:', err);
            await ctx.editMessageText('O\'chirishda xatolik yuz berdi.');
        }
    });

    bot.action('cancel_clear_all', async (ctx) => {
        await ctx.deleteMessage();
        await ctx.editMessageText('O\'chirish bekor qilindi.');
    });

    bot.action(/confirm_(\d+)/, async (ctx) => {
        const messageId = ctx.match[1];
        await Message.update({ status: true }, { where: { id: messageId } });
        await ctx.deleteMessage();
        ctx.reply('Xabar saqlandi.');
    });

    bot.action(/reject_(\d+)/, async (ctx) => {
        const messageId = ctx.match[1];
        await Message.destroy({ where: { id: messageId } });
        await ctx.deleteMessage();
        ctx.reply('Xabar rad etildi.');
    });

    bot.catch((err, ctx) => {
        console.log(`Encountered an error for ${ctx.updateType}`, err);
    });
}