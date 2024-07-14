const {message} = require('telegraf/filters');
const ensureAuth = require("../middleware/ensure-auth");
const {commandChannelButtons} = require("../keyboards");
const db = require("../model");
const {Markup} = require("telegraf");

const Channel = db.channels;
const Message = db.messages;

// const BOT_ID = parseInt(process.env.BOT_TOKEN.split(':')[0], 10);

module.exports = function (bot) {

    bot.on(message('chat_shared'), ensureAuth(), async ctx => {
        await ctx.replyWithChatAction('typing');
        let {chat_id: chatId} = ctx.update.message.chat_shared;

        // let admins;
        let channel;
        // let user;

        try {
            channel = await ctx.telegram.getChat(chatId);
            // admins = await ctx.telegram.getChatAdministrators(chatId);
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

        if (!exist) {
            await Channel.create({
                channel_name: channel.title,
                channel_link: channel.username,
            });
            ctx.reply(`${channel.title} kanalingiz qo'shildi`, commandChannelButtons);
        } else {
            ctx.reply(`${channel.title} kanalingiz oldin qo'shilgan`, commandChannelButtons);
        }

    });

    bot.on('message', ensureAuth(), async (ctx) => {
        const userId = ctx.from.id;
        const message = ctx.message;
        const messageId = message.message_id;
        const chatId = message.chat.id;
        const messageType = message.text ? 'text' : message.photo ? 'photo' : message.video ? 'video' : message.audio ? 'audio' : 'other';

        console.warn(message)

        let fileId = null;
        if (message.photo) {
            fileId = message.photo[message.photo.length - 1].file_id;
        } else if (message.video) {
            fileId = message.video.file_id;
        } else if (message.audio) {
            fileId = message.audio.file_id;
        }

        let pendingMessage = {
            message_id: messageId,
            chat_id: chatId,
            message_type: messageType,
            sent: false,
            message_status: false,
            owner_id: userId,
            file_id: fileId,
        };

       await Message.create(pendingMessage);

        if (messageType === 'text') {
            await ctx.reply(message.text);
        } else if (messageType === 'photo') {
            await ctx.replyWithPhoto(fileId, { caption: message.caption || '' });
        } else if (messageType === 'video') {
            await ctx.replyWithVideo(fileId, { caption: message.caption || '' });
        } else if (messageType === 'audio') {
            await ctx.replyWithAudio(fileId, { caption: message.caption || '' });
        }

        await ctx.reply(
            'Reklama ma\'lumotlari to\'g\'rimi?',
            Markup.keyboard([
                ['Toʻgʻri', 'Notoʻgʻri']
            ]).oneTime().resize()
        );
    });
    bot.catch((err, ctx) => {
        console.log(`Encountered an error for ${ctx.updateType}`, err);
    });
};