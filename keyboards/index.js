const {Markup} = require("telegraf");

const commandGroupButtons = Markup.keyboard([
    ['Guruh qo\'shish', 'Guruh o\'zgartirish'],
    ['Guruh o\'chirish', 'Guruhlar ro\'yhati']
]).resize();

const commandChannelButtons = Markup.keyboard([
    ['Kanal qo\'shish', 'Kanal o\'zgartirish'],
    ['Kanal o\'chirish', 'Kanallar ro\'yhati']
]).resize();


module.exports = {commandGroupButtons, commandChannelButtons};