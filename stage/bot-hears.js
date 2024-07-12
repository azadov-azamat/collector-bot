const {getGroup} = require("../scene/group");
const {getChannels} = require("../scene/channel");
const {Markup} = require("telegraf");
const db = require("../model");
const {handleSendAdsToUsers} = require("../commands");

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

    bot.hears('Toʻgʻri', async (ctx) => {
        const message = ctx.message;
        const userId = ctx.from.id;
        const chatId = message.chat.id;

        try {
            let currentAds = await Message.findOne({
                where: {
                    owner_id: Number(userId),
                    message_status: false,
                    chat_id: String(chatId)
                }
            })
            currentAds.message_status = true;
            await currentAds.save();

            await ctx.reply('Reklama saqlandi!', Markup.removeKeyboard());

            await handleSendAdsToUsers(ctx, currentAds);

        } catch (err) {
            console.error(err);
            await ctx.reply('Xato yuz berdi, qaytadan urinib ko‘ring.', Markup.removeKeyboard());
        }
    });

    bot.hears('Notoʻgʻri', async (ctx) => {
        const userId = ctx.from.id;
        const message = ctx.message;
        const chatId = message.chat.id;

        try {
            await Message.destroy({
                where: {
                    owner_id: userId,
                    message_status: false,
                    chat_id: chatId
                }
            })

            await ctx.reply('Reklama saqlash bekor qilindi.', Markup.removeKeyboard());
        } catch (e) {
            console.log("Error: ", e);
        }
    });
}