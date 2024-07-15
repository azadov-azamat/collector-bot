const dotenv = require('dotenv');
dotenv.config();
const db = require("../model");
const Message = db.messages;
const User = db.users;
const {Sequelize} = require("sequelize");
const {Telegraf} = require("telegraf");

// const clientBot = new Telegraf(process.env.BOT_TOKEN, { polling: true });

async function sendScheduledMessages(clientBot) {
    const messages = await Message.findAll({
        where: {
            // sendAt: {
            //     [Sequelize.Op.lte]: new Date(),
            // },
            sent: false,
            status: true
        },
    });

    const users = await User.findAll({where: {role: 'user'}});

    for (const message of messages) {
        for (const user of users) {
            try {
                const options = {caption: message.caption || ''};

                switch (message.type) {
                    case 'text':
                        await clientBot.telegram.sendMessage(user.user_id, message.content);
                        break;
                    case 'photo':
                        await clientBot.telegram.sendPhoto(user.user_id, message.url, options);
                        break;
                    case 'video':
                        await clientBot.telegram.sendVideo(user.user_id, message.url, options);
                        break;
                    case 'audio':
                        await clientBot.telegram.sendAudio(user.user_id, message.url, options);
                        break;
                    case 'voice':
                        await clientBot.telegram.sendVoice(user.user_id, message.url, options);
                        break;
                    case 'video_note':
                        await clientBot.telegram.sendVideoNote(user.user_id, message.url);
                        break;
                    default:
                        console.error(`Aniqlanmagan type: ${message.type}`);
                }
            } catch (error) {
                console.error(`Failed to send message to user ${user.user_id}:`, error);
            }
        }
    }
}

module.exports = {sendScheduledMessages}