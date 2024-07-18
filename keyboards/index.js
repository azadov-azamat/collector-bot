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
    Markup.button.callback('Bekor qilish ❌️', 'cancel_clear_all')
])

const commandDeleteButton = Markup.inlineKeyboard([
    Markup.button.callback('Tasdiqlash ✅', 'confirm_delete'),
    Markup.button.callback('Bekor qilish ❌️', 'cancel_delete')
]).resize();

const commandUpdateStatusButton = Markup.inlineKeyboard([
    Markup.button.callback('Aktivlashtirish ✅', 'status_active'),
    Markup.button.callback('Faolsizlashtirish 🚫 ', 'status_inactive')
]).resize();

module.exports = {
    commandGroupButtons,
    commandChannelButtons,
    commandClearAds,
    commandDeleteButton,
    commandUpdateStatusButton
};