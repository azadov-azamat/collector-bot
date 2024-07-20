const dotenv = require('dotenv');
dotenv.config();

const {Telegraf, Markup} = require('telegraf');
const LocalSession = require('telegraf-session-local');
const {setClientCommands} = require("../commands");
const {handleSubscriptionCheck} = require("../utils/functions");

const bot = new Telegraf(process.env.BOT_TOKEN);

const localSession = new LocalSession({database: 'session-db.json'});
bot.use(localSession.middleware());

bot.use(async (ctx, next) => {
    if (ctx.chat) {
        await bot.telegram.sendChatAction(ctx.chat.id, 'typing');
    }
    return next();
});

setClientCommands(bot);

bot.start(async (ctx) => {
    await handleSubscriptionCheck(bot, ctx, null, true);
});

bot.action('check_subscription', async (ctx) => {
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    await handleSubscriptionCheck(bot, ctx);
});

// Har qanday action uchun middleware
bot.use(async (ctx, next) => {
    await handleSubscriptionCheck(bot, ctx, next)
});

bot.on(['text', 'photo', 'video'], async (ctx, next) => {
    await handleSubscriptionCheck(bot, ctx, next);
});

bot.launch()

process.once('SIGINT', () => {
    if (bot && bot.stop) bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    if (bot && bot.stop) bot.stop('SIGTERM');
});

console.log('Bot is running...');