const dotenv = require('dotenv');
dotenv.config();
const db = require('../model');
const {Telegraf, Markup} = require('telegraf');
const LocalSession = require('telegraf-session-local');
const {schedule} = require("node-cron");
const {sendScheduledMessages} = require("../utils/functions");

const bot = new Telegraf(process.env.BOT_TOKEN);
const Channel = db.channels;
const Group = db.groups;
const Count = db.counts;
const User = db.users;

const localSession = new LocalSession({database: 'session-db.json'});
bot.use(localSession.middleware());

bot.use(async (ctx, next) => {
    // Typing actionni yuborish
    if (ctx.chat) {
        await bot.telegram.sendChatAction(ctx.chat.id, 'typing');
    }
    return next();
});

async function checkUserMembership(ctx, userId, channels) {
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

bot.start(async (ctx) => {
    await handleSubscriptionCheck(ctx);
});

bot.action('check_subscription', async (ctx) => {
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    await handleSubscriptionCheck(ctx);
});

async function handleSubscriptionCheck(ctx, next) {
    const userId = ctx.from.id;
    const userName = ctx.from.username;
    const referrerId = ctx.startPayload;
    const referralLink = `https://t.me/${ctx.botInfo.username}?start=${userId}`;

    let buttons = [];
    let count;

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
        let refererCount = await Count.findOne({
            where: {
                userId: BigInt(referrerId),
                groupId: group.id,
            },
        });

        refererCount.user_count = Number(refererCount.user_count) + 1;
        await refererCount.save(); // Taklif qilgan user ning count ini oshirish
    }

    try {
        if (!user) {
            await User.create({
                user_id: BigInt(userId),
                user_name: userName,
                user_link: referralLink,
                role: 'user'
            });
        }
    } catch (error) {
        console.error('Error while creating user:', error);
    }

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

    const membership = await checkUserMembership(ctx, userId, channelUsernames);

    const notSubscribedChannels = Object.keys(membership).filter(channel => !membership[channel]);

    let replyMessage = '';
    if (notSubscribedChannels.length === 0 && count.user_count >= group.group_count) {
        replyMessage += `Siz ${count.user_count} ta do'stingizni taklif qildingiz va barcha kanallarga obuna bo'ldingiz. \n Mana guruhning havolasi: ${group.group_link}\n`;
    } else if (notSubscribedChannels.length > 0 && count.user_count >= group.group_count) {
        replyMessage += `Siz ${count.user_count} ta do'stingizni taklif qildingiz, ammo guruh havolasini olish uchun barcha kanallarga obuna bo'lishingiz kerak.\n`;
        buttons = notSubscribedChannels.map((channel) => {
            return [
                Markup.button.url(
                    `Obuna bo'lish ${channel}`,
                    `https://t.me/${channel.replace('@', '')}`
                ),
            ];
        });
        buttons.push(
            [
                Markup.button.callback('Tekshirish ✅', 'check_subscription')
            ]
        )
    } else if (notSubscribedChannels.length === 0 && count.user_count < group.group_count) {
        replyMessage += `Guruh havolasini olish uchun siz ${group.group_count} ta do'stingizni taklif qilishingiz kerak.\n`;
        buttons = [
            [
                {
                    text: 'Siz uchun havola',
                    switch_inline_query: `: ${referralLink}`,
                }
            ],
            [Markup.button.callback('Tekshirish ✅', 'check_subscription')]
        ]
    } else {
        replyMessage += 'Iltimos, quyidagi kanallarga obuna bo\'ling va havolani ulashing:'
        buttons = notSubscribedChannels.map((channel) => {
            return [
                Markup.button.url(
                    `Obuna bo'lish ${channel}`,
                    `https://t.me/${channel.replace('@', '')}`
                ),
            ];
        });

        buttons = [
            ...buttons,
            [
                {
                    text: 'Siz uchun havola',
                    switch_inline_query: `: ${referralLink}`,
                }
            ],
            [Markup.button.callback('Tekshirish ✅', 'check_subscription')]
        ]
    }

    if (next) {
        next()
    } else {
        let message;
        if (buttons.length > 0) {
            message = await ctx.reply(replyMessage, Markup.inlineKeyboard(buttons));
        } else {
            message = await ctx.reply(replyMessage);
        }

        ctx.session.messageId = message.message_id;
    }
}

// Har qanday action uchun middleware
bot.use(async (ctx, next) => {
    await handleSubscriptionCheck(ctx, next)
});

// Rasm, video yoki tekst yuborganda handle qilish
bot.on(['text', 'photo', 'video'], async (ctx, next) => {
    await handleSubscriptionCheck(ctx, next);
});

// schedule('* * * * *', sendScheduledMessages);
// setTimeout(sendScheduledMessages, 1000);
setInterval(()=> sendScheduledMessages(bot), 5000);
bot.launch()

process.once('SIGINT', () => {
    if (bot && bot.stop) bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    if (bot && bot.stop) bot.stop('SIGTERM');
});

console.log('Bot is running...');