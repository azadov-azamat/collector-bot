const dotenv = require('dotenv');
dotenv.config();

const db = require("../model");

const {Markup} = require("telegraf");
const axios = require("axios");
const path = require('path');
const fs = require('fs');

const Channel = db.channels;
const Group = db.groups;
const Count = db.counts;
const User = db.users;
const Message = db.messages;

const firstPhoto = path.join(__dirname, '../assets/photo-1.jpg');

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

async function checkUserMembership(bot, ctx, userId, channels) {
    const results = {};
    for (const channel of channels) {
        let chatMember

        try {
            chatMember = await bot.telegram.getChatMember(`@${channel}`, userId);
        } catch (e) {
            console.log("Error: ", e)
            return ctx.reply("Muammo haqida xabar bering @Ramazon_Safarov: " + e);
        }
        if (chatMember) {
            results[channel] = chatMember.status !== 'left';
        }
    }
    return results;
}

async function checkUsersMembership(bot, users, channels) {
    try {
        let memberCount = 0;

        for (const user of users) {
            let chatMember
            let subscribedChannelsCount = 0

            for (const channel of channels) {

                chatMember = await bot.telegram.getChatMember(`@${channel}`, user.user_id);

                if (chatMember.status === 'member') {
                    subscribedChannelsCount++;
                }
            }

            if (subscribedChannelsCount === channels.length) {
                memberCount++;
            }
        }

        return memberCount;
    } catch (error) {
        console.error('Error checking membership:', error);
    }
}

async function handleSubscriptionCheck(bot, ctx, next = null, isStartCommand = false) {
    const userId = ctx.from?.id;
    const userName = ctx.from?.username;
    const referrerId = ctx?.startPayload;

    const referralLink = `tg://share?url=https://t.me/${ctx.botInfo.username}?start=${userId}&text=Ushbu link orqali siz ham ingliz tili marafonimizda qatnashing`;

    let buttons = [];
    let count;
    let referrerFriends = [];
    let memberCount = 0;

    const [group, channels, user] = await Promise.all([
        Group.findOne({where: {group_status: true}}),
        Channel.findAll({where: {channel_status: true}}),
        User.findByPk(userId)
    ]);

    if (group) {
        count = await Count.findOne({
            where: {
                userId: BigInt(userId),
                groupId: group?.id,
            },
        });
    } else {
        return ctx.reply("Hozirda active guruhlarimiz yo'q!");
    }

    if (referrerId) {
        if (!user) {
            let refererCount = await Count.findOne({
                where: {
                    userId: BigInt(referrerId),
                    groupId: group.id,
                },
            });

            refererCount.user_count = Number(refererCount.user_count) + 1;
            await refererCount.save();
        }
    }

    try {
        if (!user) {
            let userCreateData = {
                user_id: BigInt(userId),
                user_name: userName,
                user_link: referralLink,
                role: 'user'
            }

            if (referrerId) {
                userCreateData.invited_by = referrerId;
            }

            await User.create(userCreateData);
        }
    } catch (error) {
        console.error('Error while creating user:', error);
    }

    referrerFriends = await User.findAll({where: {invited_by: BigInt(userId)}});

    let currentCount = await Count.findOne({
        where: {
            userId: BigInt(userId),
            groupId: group.id,
        },
    });

    if (!currentCount) {
        count = await Count.create({
            user_count: 0,
            userId: BigInt(userId),
            groupId: group.id,
        });
    } else {
        count = currentCount;
    }

    const channelUsernames = channels.map((channel) => channel.channel_link);

    if (referrerFriends.length){
        memberCount = await checkUsersMembership(bot, referrerFriends, channelUsernames);
    }
    const membership = await checkUserMembership(bot, ctx, userId, channelUsernames);

    const notSubscribedChannels = Object.keys(membership).filter(channel => !membership[channel]);

    let replyMessage = `Bepul AUTHENTIC past exam papers va listeninglarni qo'lga kiritish uchun ${group.group_count} ta yangi do'stingizni ushbu botga taklif qilishingiz va do'stlaringiz botda yozilgan kanallarga ulanishlari kerak.`;

    if (notSubscribedChannels.length === 0 && Number(count.user_count) >= group.group_count && memberCount >= group.group_count) {
        replyMessage = `Guruhimiz havolasi: ${group.group_link}`;
    } else if (notSubscribedChannels.length > 0 && Number(count.user_count) >= group.group_count) {
        const filteredChannels = channels.filter(channel =>
            notSubscribedChannels.some(usernameObj => usernameObj === channel.channel_link)
        )
        buttons = filteredChannels.map(({channel_name, channel_link}) => {
            return [
                Markup.button.url(
                    channel_name,
                    `https://t.me/${channel_link.replace('@', '')}`
                ),
            ];
        });
        buttons.push(
            [
                Markup.button.callback('Tekshirish ✅', 'check_subscription')
            ]
        )
    } else if (notSubscribedChannels.length === 0 && Number(count.user_count) < group.group_count && memberCount < group.group_count) {
        buttons = [
            [
                Markup.button.url("Siz uchun havola", referralLink)
            ],
            [Markup.button.callback('Tekshirish ✅', 'check_subscription')]
        ]
    } else {
        const filteredChannels = channels.filter(channel =>
            notSubscribedChannels.some(usernameObj => usernameObj === channel.channel_link)
        )
        buttons = filteredChannels.map(({channel_name, channel_link}) => {
            return [
                Markup.button.url(
                    channel_name,
                    `https://t.me/${channel_link.replace('@', '')}`
                ),
            ];
        });

        buttons = [
            ...buttons,
            [Markup.button.url("Siz uchun havola", referralLink)],
            [Markup.button.callback('Tekshirish ✅', 'check_subscription')]
        ]
    }

    if (!isStartCommand && !(notSubscribedChannels.length === 0 && Number(count.user_count) >= group.group_count)) {
        replyMessage += `\n
📊 Statistika:
Siz taklif qilgan umumiy do'stlar: ${count.user_count}
Shartlarni to'liq bajargan do'stlar: ${memberCount}`
    }

    if (next) {
        next()
    } else {
        let message;
        if (buttons.length > 0) {
            message = isStartCommand
                ?
                await ctx.replyWithPhoto({source: firstPhoto}, {caption: replyMessage, ...Markup.inlineKeyboard(buttons)})
                :
                await ctx.reply(replyMessage, Markup.inlineKeyboard(buttons));
        } else {
            message = isStartCommand
                ?
                await ctx.replyWithPhoto({source: firstPhoto}, {caption: replyMessage})
                :
                await ctx.reply(replyMessage);
        }

        ctx.session.messageId = message.message_id;
    }
}

module.exports = {
    sendScheduledMessages,
    saveMediaMessage,
    messageTypes,
    mediaDir,
    clearMediaDirectory,
    clearMessageTable,
    handleSubscriptionCheck
}