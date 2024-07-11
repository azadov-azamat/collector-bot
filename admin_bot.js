const dotenv = require('dotenv');
dotenv.config();
const {Telegraf, Scenes, session} = require('telegraf');
const loginScene = require('./scene/login');
const {
    addGroupScene,
    updateGroupScene,
    deleteGroupScene
} = require('./scene/group');

const {
    deleteChannelScene,
    addChannelScene,
    updateChannelScene
} = require('./scene/channel');
const {
    adsScene
} = require('./scene/ads');

const bot = new Telegraf(process.env.ADMIN_BOT_TOKEN);
const stage = new Scenes.Stage([
    loginScene,
    addGroupScene,
    updateGroupScene,
    deleteGroupScene,
    deleteChannelScene,
    addChannelScene,
    updateChannelScene,
    adsScene
]);

const ensureAuth = require('./middleware/ensure-auth');
const db = require('./model/index');
const User = db.users;

const {
    helpCommand,
    addMessage,
} = require('./controller/admin');

const {commandButtons, commandGroupButtons, commandChannelButtons} = require("./keyboards");
const {setCommands} = require("./commands");

bot.use(session());
bot.use(stage.middleware());

bot.start(async (ctx) => {
    const userId = ctx.from.id; // Telegram foydalanuvchi IDsi
    const user = await User.findByPk(userId);

    if (user && !user.token) {
        ctx.reply('Autentifikatsiya botiga xush kelibsiz! Iltimos, /login komandasi bilan tizimga kiring');
    } else {
        ctx.reply('Komandalar ro\'yhatini ko\'rib chiqing');
    }
});


setCommands(bot);

bot.command('login', async (ctx) => {
    const userId = ctx.from.id; // Telegram foydalanuvchi IDsi
    const user = await User.findByPk(userId);

    if (user && !user.token) {
        ctx.scene.enter('loginScene');
    } else {
        ctx.reply('Siz tizimga kirgansiz!');
    }
});

bot.command('groups', ensureAuth(), (ctx) => {
    ctx.reply('Guruhlarni boshqarish uchun variantni tanlang:', commandGroupButtons);
});

bot.command('channels', (ctx) => {
    ctx.reply('Kanallarni boshqarish uchun variantni tanlang:', commandChannelButtons);
});


require('./stage/bot-hears')(bot);

bot.command('send_message', addMessage);
bot.command('help', helpCommand);


bot.action('help', (ctx) => {
    helpCommand(ctx);
});

bot.action('message', (ctx) => {
    ctx.reply(
        'Please provide channel details in the format: /send_message <"Your message">',
        commandButtons
    );
});

bot.catch((err, ctx) => {
    console.log(err);
    ctx.reply('Xatolik yuz berdi.');

    if (ctx.scene) {
        ctx.scene.leave();
    }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('Bot is running...');
