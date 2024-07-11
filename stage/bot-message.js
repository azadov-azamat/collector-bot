const {message} = require('telegraf/filters');
const ensureAuth = require("../middleware/ensure-auth");
const {commandChannelButtons} = require("../keyboards");
const db = require("../model");

const Channel = db.channels;
const BOT_ID = parseInt(process.env.BOT_TOKEN.split(':')[0], 10);

module.exports = function (bot) {

    bot.on(message('chat_shared'), ensureAuth(), async ctx => {
        await ctx.replyWithChatAction('typing');
        let {chat_id: chatId, request_id: requestid} = ctx.update.message.chat_shared;

        let admins;
        let channel;
        let user;

        try {
            channel = await ctx.telegram.getChat(chatId);
            admins = await ctx.telegram.getChatAdministrators(chatId);
            // user = await ctx.telegram.getChatMember(chatId, BOT_ID);
        } catch (e) {
            return ctx.reply("Admin botni tanlangan kanalda admin ekanlikini tekshiring", commandChannelButtons);
        }
        // console.log(user)
        // console.log(BOT_ID)
        // admins.find(({user}) => console.log(user))
        //
        // let botAdminInfo = admins.find(({user}) => user.id === BOT_ID);
        //
        // if (!botAdminInfo) {
        //     return ctx.reply("Asosiy botni tanlangan kanalda admin ekanlikini tekshiring", commandChannelButtons);
        // }
        let exist = await Channel.findOne({where: {channel_link: channel.username}});

        if(!exist) {
          await Channel.create({
            channel_name: channel.title,
            channel_link: channel.username,
          });
          ctx.reply(`${channel.title} kanalingiz qo'shildi`, commandChannelButtons);
        } else {
          ctx.reply(`${channel.title} kanalingiz oldin qo'shilgan`, commandChannelButtons);
        }

    });


    bot.catch((err, ctx) => {
        console.log(`Encountered an error for ${ctx.updateType}`, err);
    });
};