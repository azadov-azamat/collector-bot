const {Markup} = require("telegraf");
const commandButtons = Markup.inlineKeyboard([
    [Markup.button.callback('Guruhlar', 'group_button')],
    [Markup.button.callback('Kanallar', 'channel_button')],
    [Markup.button.callback('Xabar', 'message')],
    [Markup.button.callback('Yordam', 'help')],
]);

const commandGroupButtons = Markup.keyboard([
    ['Guruh qo\'shish', 'Guruh o\'zgartirish'],
    ['Guruh o\'chirish', 'Guruhlar ro\'yhati']
]).resize();

const commandChannelButtons = Markup.keyboard([
    ['Kanal qo\'shish', 'Kanal o\'zgartirish'],
    ['Kanal o\'chirish', 'Kanallar ro\'yhati']
]).resize();


module.exports = {commandGroupButtons, commandChannelButtons, commandButtons};