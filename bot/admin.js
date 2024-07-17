require('dotenv').config();
const { Telegraf, Scenes, session } = require('telegraf');
const loginScene = require('../scene/login.js');
const {
    addGroupScene,
    updateGroupScene,
    deleteGroupScene
} = require('../scene/group.js');

const {
    deleteChannelScene,
    updateChannelScene
} = require('../scene/channel.js');
const {
    adsScene
} = require('../scene/ads.js');

const bot = new Telegraf(process.env.ADMIN_BOT_TOKEN);
const stage = new Scenes.Stage([
    loginScene,
    addGroupScene,
    updateGroupScene,
    deleteGroupScene,
    deleteChannelScene,
    updateChannelScene,
    adsScene
]);

const ensureAuth = require('../middleware/ensure-auth.js');
const db = require('../model/index.js');
const User = db.users;

const { commandGroupButtons, commandChannelButtons } = require("../keyboards/index.js");
const { setCommands } = require("../commands/index.js");
const { removeKeyboard } = require("telegraf/markup");
const {commandClearAds} = require("../keyboards");

bot.use(session());
bot.use(stage.middleware());

setCommands(bot);

bot.start(async (ctx) => {
    const userId = ctx.from.id; // Telegram foydalanuvchi IDsi
    const user = await User.findByPk(userId);

    if (ctx.scene) {
        ctx.scene.leave();
    }

    if (user && !user.token) {
        ctx.reply('Autentifikatsiya botiga xush kelibsiz! Iltimos, /login komandasi bilan tizimga kiring');
    } else if (user && user.token) {
        ctx.reply('Komandalar ro\'yhatini ko\'rib chiqing', removeKeyboard());
    } else {
        ctx.reply('Autentifikatsiya botiga xush kelibsiz! Iltimos, /login komandasi bilan tizimga kiring');
    }
});

bot.command('login', async (ctx) => {
    const userId = ctx.from.id; // Telegram foydalanuvchi IDsi
    const user = await User.findByPk(userId);

    if (ctx.scene) {
        ctx.scene.leave();
    }

    if (user && (!user.token || !user)) {
        ctx.scene.enter('loginScene');
    } else if (user && user.token) {
        ctx.reply('Siz tizimga kirgansiz!', removeKeyboard());
    } else {
        ctx.scene.enter('loginScene');
    }
});

bot.command('ads', ensureAuth(), (ctx) => {
    ctx.reply('Reklama xabarini yuboring:', removeKeyboard());
});
bot.command('groups', ensureAuth(), (ctx) => {
    ctx.reply('Guruhlarni boshqarish uchun variantni tanlang:', commandGroupButtons);
});

bot.command('channels', ensureAuth(), (ctx) => {
    ctx.reply('Kanallarni boshqarish uchun variantni tanlang:', commandChannelButtons);
});

bot.command('help', (ctx) => {
    ctx.reply('Muammo bo\'yicha @azamat_azadov bilan bog\'laning', removeKeyboard());
});

bot.command('clear_ads', async (ctx) => {
    await ctx.reply('Barcha media fayllar va xabarlarni o\'chirishni tasdiqlaysizmi?', commandClearAds);
});

bot.command('logout', async (ctx) => {
    const userId = ctx.from.id; // Telegram foydalanuvchi IDsi
    const user = await User.findByPk(userId);

    if (user) {
        user.token = null;
        await user.save();

        ctx.reply("Tizimdan chiqdingiz, qayta kirish uchun /login buyrug'idan foydalaning!", removeKeyboard());
    }
});

require('../stage/bot-hears.js')(bot);
require('../stage/bot-message.js')(bot);
require('../stage/bot-actions.js')(bot);

bot.catch((err, ctx) => {
    console.log(err);
    ctx.reply(`Xatolik yuz berdi: ${err}`);

    if (ctx.scene) {
        ctx.scene.leave();
    }
});

bot.launch();

process.once('SIGINT', () => {
    if (bot && bot.stop) bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    if (bot && bot.stop) bot.stop('SIGTERM');
});

console.log('Bot is running...');
