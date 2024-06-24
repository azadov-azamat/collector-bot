const dotenv = require('dotenv');
dotenv.config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.ADMIN_BOT_TOKEN);

// Initialize session middleware

const {
  startCommand,
  login,
  addGroup,
  updateGroup,
  deleteGroup,
  restricted,
  getGroup,
  addChannel,
  updateChannel,
  deleteChannel,
  getChannel,
  commandButtons,
  helpCommand,
  commandGroupButtons,
  commandChannelButtons,
  addMessage,
} = require('./controller/admin');

bot.start(startCommand);
bot.command('login', login);
bot.command('get_group', restricted, getGroup);
bot.command('add_group', restricted, addGroup);
bot.command('update_group', restricted, updateGroup);
bot.command('delete_group', restricted, deleteGroup);

bot.command('get_channel', restricted, getChannel);
bot.command('add_channel', restricted, addChannel);
bot.command('update_channel', restricted, updateChannel);
bot.command('delete_channel', restricted, deleteChannel);

bot.command('send_message',addMessage);
bot.command('help', helpCommand);

bot.action('add_group', (ctx) => {
  ctx.reply(
    'Please provide group details in the format: /add_group <group_name> <group_link> <group_count>',
    commandButtons
  );
});

bot.action('update_group', (ctx) => {
  ctx.reply(
    'Please provide group update details in the format: /update_group <id> <group_name> <group_link> <group_count>',
    commandButtons
  );
});

bot.action('delete_group', (ctx) => {
  ctx.reply(
    'Please provide group ID to delete in the format: /delete_group <id>',
    commandButtons
  );
});

bot.action('get_group', (ctx) => {
  getGroup(ctx);
});

bot.action('add_channel', (ctx) => {
  ctx.reply(
    'Please provide channel details in the format: /add_channel <channel_name> <channel_link>',
    commandButtons
  );
});

bot.action('update_channel', (ctx) => {
  ctx.reply(
    'Please provide channel update details in the format: /update_channel <id> <channel_name> <channel_link> <channel_count>',
    commandButtons
  );
});

bot.action('delete_channel', (ctx) => {
  ctx.reply(
    'Please provide channel ID to delete in the format: /delete_channel <id>',
    commandButtons
  );
});

bot.action('get_channel', (ctx) => {
  getChannel(ctx);
});

bot.action('help', (ctx) => {
  helpCommand(ctx);
});

bot.action('group_button', (ctx) => {
  ctx.reply('Guruhlar uchun', commandGroupButtons);
});

bot.action('channel_button', (ctx) => {
  ctx.reply('Kanallar uchun', commandChannelButtons);
});
bot.action('message', (ctx) => {
  ctx.reply(
    'Please provide channel details in the format: /send_message <"Your message">',
    commandButtons
  );
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('Bot is running...');
