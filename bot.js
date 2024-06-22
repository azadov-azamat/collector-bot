const dotenv = require('dotenv');
dotenv.config();
const { startCommand, handleCheck } = require('./controller/user');
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(startCommand);
// bot.help(helpCommand);
bot.action('check', handleCheck);
// bot.action('forward', handleForward);
// bot.on('text', handleText);

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('Bot is running...');
