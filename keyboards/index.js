const {Markup} = require("telegraf");

const commandGroupButtons = Markup.keyboard([
    ['Guruh qo\'shish ➕', 'Guruh o\'zgartirish 🔄'],
    ['Guruh o\'chirish 🗑', 'Guruhlar ro\'yhati 🤔']
]).resize();

const commandChannelButtons = Markup.keyboard([
    ['Kanal qo\'shish ➕', 'Kanal o\'zgartirish 🔄'],
    ['Kanal o\'chirish 🗑', 'Kanallar ro\'yhati 🤔']
]).resize();

const commandClearAds = Markup.inlineKeyboard([
    Markup.button.callback('Tasdiqlash ✅', 'confirm_clear_all'),
    Markup.button.callback('Bekor qilish', 'cancel_clear_all')
])

module.exports = {commandGroupButtons, commandChannelButtons, commandClearAds};