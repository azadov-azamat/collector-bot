const {message} = require('telegraf/filters');
const ensureAuth = require("../middleware/ensure-auth");
const {commandChannelButtons} = require("../keyboards");
const db = require("../model");
const fs = require('fs');
const {saveMediaMessage, mediaDir} = require("../utils/functions");
const axios = require("axios");
const path = require('path');

const Channel = db.channels;
const Message = db.messages;

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

    bot.on('voice', async (ctx) => {
        const fileId = ctx.message.voice.file_id;
        await saveMediaMessage(ctx, 'voice', fileId);
    });

    bot.on('video_note', async (ctx) => {
        const fileId = ctx.message.video_note.file_id;
        await saveMediaMessage(ctx, 'video_note', fileId);
    });

    bot.on('video', async (ctx) => {
        const fileId = ctx.message.video.file_id;
        await saveMediaMessage(ctx, 'video', fileId);
    });

    bot.on('audio', async (ctx) => {
        const fileId = ctx.message.audio.file_id;
        await saveMediaMessage(ctx, 'audio', fileId);
    });

    bot.on('photo', async (ctx) => {
        const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id; // Eng yuqori sifatli rasmni olish
        const caption = ctx.message.caption;
        await saveMediaMessage(ctx, 'photo', fileId, caption);
    });

    bot.on('text', async (ctx) => {
        const textContent = ctx.message.text;
        await saveMediaMessage(ctx, 'text', null, textContent);
    });

    bot.on('location', async (ctx) => {
        const location = ctx.message.location;
        await saveMediaMessage(ctx, 'location', null, null, location);
    });

    bot.on('poll', async (ctx) => {
        const poll = ctx.message.poll;
        const pollQuestion = poll.question;
        const pollOptions = poll.options.map(option => option.text);
        await saveMediaMessage(ctx, 'poll', null, null, null, pollQuestion, pollOptions);
    });

    bot.on('document', async (ctx) => {
        const fileId = ctx.message.document.file_id;
        const fileName = ctx.message.document.file_name;
        const caption = ctx.message.caption;
        const filePath = path.join(mediaDir, fileName);

        const fileUrl = await ctx.telegram.getFileLink(fileId);

        const response = await axios({
            url: fileUrl.href,
            method: 'GET',
            responseType: 'stream'
        });

        await new Promise((resolve, reject) => {
            response.data.pipe(fs.createWriteStream(filePath))
                .on('finish', resolve)
                .on('error', reject);
        });

        await saveMediaMessage(ctx, 'document', fileId, caption, null, null, null, filePath);
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
};