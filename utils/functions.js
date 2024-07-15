const dotenv = require('dotenv');
dotenv.config();
const db = require("../model");
const Message = db.messages;
const User = db.users;
const {Sequelize} = require("sequelize");
const {Telegraf} = require("telegraf");

const clientBot = new Telegraf(process.env.BOT_TOKEN);

async function sendScheduledMessages() {
    const messages = await Message.findAll({
        where: {
            sendAt: {
                [Sequelize.Op.lte]: new Date(),
            },
            sent: false
        },
    });

    const users = await User.findAll({where: {role: 'user'}});

    for (const message of messages) {
        for (const user of users) {
            switch (message.type) {
                case 'text':
                    await clientBot.telegram.sendMessage(user.user_id, message.content);
                    break;
                case 'photo':
                    await clientBot.telegram.sendPhoto(user.user_id, message.content);
                    break;
                case 'video':
                    await clientBot.telegram.sendVideo(user.user_id, message.content);
                    break;
                case 'audio':
                    await clientBot.telegram.sendAudio(user.user_id, message.content);
                    break;
            }
        }
        message.sent = true;
        await message.save();
    }
}

module.exports = { sendScheduledMessages}