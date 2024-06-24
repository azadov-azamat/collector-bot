const dotenv = require('dotenv');
dotenv.config();
const { startCommand, handleCheck, messageFunc } = require('./controller/user');
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(startCommand);
// bot.help(helpCommand);
bot.action('check', handleCheck);
// bot.action('forward', handleForward);
// bot.on('text', handleText);

const sendMessage = async () => {
  const { users, message } = await messageFunc();
  if (!users || !message) {
    return;
  }
  for (const userId of users) {
    try {
      await bot.telegram.sendMessage(userId, message.message);
    } catch (error) {
      console.error(`Failed to send message to ${userId}:`, error);
    }
  }
};

setInterval(sendMessage, 30000);

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('Bot is running...');
