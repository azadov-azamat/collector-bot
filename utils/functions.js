const dotenv = require('dotenv');
dotenv.config();

const db = require("../model");
const Message = db.messages;
const User = db.users;
const {Markup} = require("telegraf");
const axios = require("axios");
const path = require('path');
const fs = require('fs');

const mediaDir = path.join(__dirname, 'media');
if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir);
}

function clearMediaDirectory() {
    const mediaDir = path.join(__dirname, 'media');
    fs.readdir(mediaDir, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(mediaDir, file), err => {
                if (err) throw err;
            });
        }
    });
}

async function clearMessageTable() {
    await Message.destroy({
        where: {},
        truncate: true
    });
}

async function sendScheduledMessages(bot) {
    try {
        const messages = await Message.findAll({
            where: {send: false, status: true},
        });
        if (!messages.length) return;
        const users = await User.findAll({where: {role: 'user'}});

        for (const message of messages) {
            for (const user of users) {
                try {
                    const options = {caption: message.textContent || ''};

                    switch (message.messageType) {
                        case 'voice':
                            await bot.telegram.sendVoice(user.user_id, {source: message.filePath}, options);
                            break;
                        case 'video_note':
                            await bot.telegram.sendVideoNote(user.user_id, {source: message.filePath}, options);
                            break;
                        case 'video':
                            await bot.telegram.sendVideo(user.user_id, {source: message.filePath}, options);
                            break;
                        case 'audio':
                            await bot.telegram.sendAudio(user.user_id, {source: message.filePath}, options);
                            break;
                        case 'photo':
                            await bot.telegram.sendPhoto(user.user_id, {source: message.filePath}, options);
                            break;
                        case 'text':
                            await bot.telegram.sendMessage(user.user_id, message.textContent);
                            break;
                        case 'location':
                            await bot.telegram.sendLocation(user.user_id, message.location.latitude, message.location.longitude);
                            break;
                        case 'poll':
                            await bot.telegram.sendPoll(user.user_id, message.pollQuestion, message.pollOptions);
                            break;
                        case 'document':
                            await bot.telegram.sendDocument(user.user_id, {source: message.filePath}, options);
                            break;
                        default:
                            console.error('Noma`lum media turi.');
                    }

                } catch (error) {
                    if (error.response.error_code === 403 && error.response.description === 'Forbidden: bot was blocked by the user') {
                        console.log(`User ${user.user_id} has blocked the bot.`);
                        await User.destroy({where: {user_id: user.user_id}});
                        console.error(`${user.user_id}/${user.user_name} o'chirildi!`)
                    } else {
                        console.error(`Xabar yuborishda xatolik: ${user.user_id}`, error);
                    }
                }
            }
            await Message.update({send: true}, {where: {id: message.id}});
        }
    } catch (e) {
        console.error("Error sendScheduledMessages function: ", e)
    }
}

async function saveMediaMessage(ctx, messageType, fileId = null, textContent = null, location = null, pollQuestion = null, pollOptions = null, filePath = null) {
    if (fileId && !filePath) {
        const fileUrl = await ctx.telegram.getFileLink(fileId);
        filePath = path.join(mediaDir, `${fileId}.${messageType}`);

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
    }
    const message = await Message.create({
        userId: ctx.from.id,
        messageType: messageType,
        fileId: fileId,
        filePath: filePath,
        textContent: textContent,
        location: location,
        pollQuestion: pollQuestion,
        pollOptions: pollOptions
    });

    ctx.reply(`${messageTypes(messageType)} xabar saqlandi! Xabarni tekshiring.`, Markup.inlineKeyboard([
        Markup.button.callback('To\'g\'ri', `confirm_${message.id}`),
        Markup.button.callback('Noto\'g\'ri', `reject_${message.id}`)
    ]));
}

function messageTypes(type) {
    let messageText;
    switch (type) {
        case 'voice':
            messageText = 'Ovozli';
            break;
        case 'video_note':
            messageText = 'Video';
            break;
        case 'video':
            messageText = 'Video';
            break;
        case 'audio':
            messageText = 'Audio';
            break;
        case 'photo':
            messageText = 'Rasm';
            break;
        case 'text':
            messageText = 'Matnli';
            break;
        case 'location':
            messageText = 'Joylashuv';
            break;
        case 'poll':
            messageText = 'So\'rovnoma';
            break;
        case 'document':
            messageText = 'Fayl';
            break;
        case 'group_status':
        case 'channel_status':
            messageText = 'holat';
            break;
        case 'group_link':
        case 'channel_link':
            messageText = 'havola';
            break;
        case 'group_count':
            messageText = 'a\'zolar soni';
            break;
        case 'group_name':
        case 'channel_name':
            messageText = 'nom';
            break;
        default:
            messageText = type;
    }
    return messageText;
}

module.exports = {
    sendScheduledMessages,
    saveMediaMessage,
    messageTypes,
    mediaDir,
    clearMediaDirectory,
    clearMessageTable
}