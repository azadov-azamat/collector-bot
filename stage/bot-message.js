const {message} = require('telegraf/filters');
const ensureAuth = require("../middleware/ensure-auth");
const {commandChannelButtons} = require("../keyboards");
const db = require("../model");
const {Markup} = require("telegraf");
const moment = require("moment");
const fs = require('fs');

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
        const messageType =
            message.text ? 'text' :
                message.photo ? 'photo' :
                    message.video ? 'video' :
                        message.audio ? 'audio' :
                            message.voice ? 'voice' :
                                message.video_note ? 'video_note' : 'other';

        console.log(message);

        let fileUrl;
        let fileId = ctx.message.text;

        if (message.photo) {
            fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        } else if (message.video) {
            fileId = message.video.file_id;
        } else if (message.audio) {
            fileId = message.audio.file_id;
        } else if (message.voice) {
            fileId = message.voice.file_id;
        } else if (message.video_note) {
            fileId = message.video_note.file_id;
        }

        if (!message.text) {
            fileUrl = await bot.telegram.getFileLink(fileId);
        }

        const sendAt = moment("2024-07-15 12:00", 'YYYY-MM-DD HH:mm').toDate();

        let pendingMessage = {
            content: fileId,
            url: fileUrl.href,
            type: messageType,
            sendAt,
            chatId,
            messageId,
            status: false,
            ownerId: userId,
            caption: message.caption || ''
        };

        await Message.create(pendingMessage);

        if (messageType === 'text') {
            await ctx.reply(message.text);
        } else if (messageType === 'photo') {
            await ctx.replyWithPhoto(fileId, {caption: message.caption || ''});
        } else if (messageType === 'video') {
            await ctx.replyWithVideo(fileId, {caption: message.caption || ''});
        } else if (messageType === 'audio') {
            await ctx.replyWithAudio(fileId, {caption: message.caption || ''});
        } else if (messageType === 'voice') {
            await ctx.replyWithVoice(fileId, {caption: message.caption || ''});
        } else if (messageType === 'video_note') {
            await ctx.replyWithVideoNote(fileId, {caption: message.caption || ''});
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