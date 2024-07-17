const { Scenes, Markup} = require('telegraf');
const db = require('../model');
const { commandChannelButtons} = require("../keyboards");
const {messageTypes} = require("../utils/functions");
const Channel = db.channels;

const { WizardScene } = Scenes;


const updateChannelScene = new WizardScene(
    'updateChannelScene',
    async (ctx) => {
        const channels = await Channel.findAll();
        if (!channels.length) {
            ctx.reply('Kanallar topilmadi.');
            return ctx.scene.leave();
        }
        const buttons = channels.map((channel) => Markup.button.callback(channel.channel_name, `select_${channel.id}`));

        await ctx.reply('Kanallar ro\'yhati:', Markup.removeKeyboard());
        await ctx.reply('O\'zgartirmoqchi bo\'lgan kanalni tanlang:', Markup.inlineKeyboard(buttons).resize());

        ctx.wizard.state.data = {};
        return ctx.wizard.next();
    },
    async (ctx) => {
        await ctx.deleteMessage();
        const callbackData = ctx.callbackQuery.data;
        const channelId = callbackData.split('_')[1];
        ctx.wizard.state.data.id = channelId;
        const channel = await Channel.findByPk(channelId);

        if (!channel) {
            ctx.reply('Kanal topilmadi.');
            return ctx.scene.leave();
        }

        let message = `*Kanal ID:* ${channel.id}\n`;
        const channelName = channel.channel_name.replace(/_/g, '\\_');
        const channelLink = channel.channel_link.replace(/_/g, '\\_');
        message += `*ID:* ${channel.id}\n`;
        message += `*Nomi:* ${channelName}\n`;
        message += `*Linki:* @${channelLink}\n`;
        message += `*Holati:* ${channel.channel_status ? 'Faol' : 'Faol emas'}\n`;
        message += `*Yaratilgan sanasi:* ${channel.createdAt.toISOString().split('T')[0]}\n`;
        message += `*Yangilangan sanasi:* ${channel.updatedAt.toISOString().split('T')[0]}\n`;

        const updateButtons = [
            Markup.button.callback('Kanal nomi', 'channel_name'),
            Markup.button.callback('Kanal linki', 'channel_link'),
            Markup.button.callback('Kanal holati', 'channel_status')
        ];

        ctx.replyWithMarkdown(message, Markup.inlineKeyboard(updateButtons, { columns: 1 }).resize());
        return ctx.wizard.next();
    },
    async (ctx) => {
        await ctx.deleteMessage();
        const fieldToUpdate = ctx.callbackQuery.data;
        ctx.wizard.state.data.fieldToUpdate = fieldToUpdate;

        if (fieldToUpdate === 'channel_status') {
            const statusButtons = [
                Markup.button.callback('Aktivlashtirish', 'status_active'),
                Markup.button.callback('Faolsizlashtirish', 'status_inactive')
            ];
            await ctx.reply('Kanal holatini tanlang:', Markup.inlineKeyboard(statusButtons).resize());
        } else {
            await ctx.reply(`Iltimos, yangi ${messageTypes(fieldToUpdate)} ni kiriting:`);
        }
        return ctx.wizard.next();
    },
    async (ctx) => {
        let newValue;
        const { id, fieldToUpdate } = ctx.wizard.state.data;

        if (fieldToUpdate === 'channel_status') {
            newValue = ctx.callbackQuery.data === 'status_active';
        } else {
            newValue = ctx.message.text;
        }

        let updateData = {};
        updateData[fieldToUpdate] = newValue;

        try {
            await Channel.update(updateData, { where: { id } });
            ctx.reply(`Kanal ${messageTypes(fieldToUpdate)} muvaffaqiyatli yangilandi.`, commandChannelButtons);
        } catch (error) {
            console.log(error);
            ctx.reply('Botda nosozlik.', commandChannelButtons);
        }
        return ctx.scene.leave();
    }
);

updateChannelScene.action(/select_\d+/, (ctx) => ctx.wizard.steps[ctx.wizard.cursor](ctx));
updateChannelScene.action(/channel_.+/, (ctx) => ctx.wizard.steps[ctx.wizard.cursor](ctx));

const deleteChannelScene = new WizardScene(
    'deleteChannelScene',
    async (ctx) => {
        const channels = await Channel.findAll();
        if (!channels.length) {
            ctx.reply('Kanallar topilmadi.');
            return ctx.scene.leave();
        }
        const buttons = channels.map((channel) => Markup.button.callback(channel.channel_name, `select_${channel.id}`));
        await ctx.reply('Iltimos, o\'chirmoqchi bo\'lgan kanalni tanlang:', Markup.removeKeyboard());
        await ctx.reply('Kanalni tanlang:', Markup.inlineKeyboard(buttons).resize());
        ctx.wizard.state.data = {};
        return ctx.wizard.next();
    },
    async (ctx) => {
        await ctx.deleteMessage();
        const callbackData = ctx.callbackQuery.data;
        const channelId = callbackData.split('_')[1];
        ctx.wizard.state.data.id = channelId;
        const channel = await Channel.findByPk(channelId);

        if (!channel) {
            ctx.reply('Kanal topilmadi.');
            return ctx.scene.leave();
        }

        let message = `*Kanal ID:* ${channel.id}\n`;
        message += `*Kanal nomi:* ${channel.channel_name}\n`;
        message += `*Kanal linki:* ${channel.channel_link}\n`;
        message += `*Yaratilgan sanasi:* ${channel.createdAt.toISOString().split('T')[0]}\n`;
        message += `*Yangilangan sanasi:* ${channel.updatedAt.toISOString().split('T')[0]}\n`;

        const deleteButton = Markup.inlineKeyboard([
            Markup.button.callback('Tasdiqlash', 'confirm_delete'),
            Markup.button.callback('Bekor qilish', 'cancel_delete')
        ]).resize();

        await ctx.replyWithMarkdown(message);
        await ctx.reply('Iltimos, kanalni o\'chirishni tasdiqlang:', deleteButton);
        return ctx.wizard.next();
    },
    async (ctx) => {
        await ctx.deleteMessage();
        const callbackData = ctx.callbackQuery.data;
        if (callbackData === 'confirm_delete') {
            const channelId = ctx.wizard.state.data.id;

            try {
                await Channel.destroy({ where: { id: channelId } });
                ctx.reply('Kanal muvaffaqiyatli o\'chirildi.', commandChannelButtons);
            } catch (error) {
                console.log(error);
                ctx.reply('Botda nosozlik.');
            }
        } else {
            ctx.reply('Kanalni o\'chirish bekor qilindi.', commandChannelButtons);
        }
        return ctx.scene.leave();
    }
);

deleteChannelScene.action(/select_\d+/, (ctx) => ctx.wizard.steps[ctx.wizard.cursor](ctx));
deleteChannelScene.action('confirm_delete', (ctx) => ctx.wizard.steps[ctx.wizard.cursor](ctx));

const getChannels = async (ctx) => {
    try {
        const channels = await Channel.findAll();
        if (!channels.length) {
            ctx.reply('Kanallar topilmadi.');
            return;
        }

        ctx.replyWithMarkdown('*Kanallar ro\'yxati:*\n \n');

        channels.forEach((channel ) => {
            let message = '*Kanal haqida m\'lumot:*\n \n';
            const channelName = channel.channel_name.replace(/_/g, '\\_');
            const channelLink = channel.channel_link.replace(/_/g, '\\_');
            message += `*ID:* ${channel.id}\n`;
            message += `*Nomi:* ${channelName}\n`;
            message += `*Linki:* @${channelLink}\n`;
            message += `*Holati:* ${channel.channel_status ? 'Faol' : 'Faol emas'}\n`;
            message += `*Yaratilgan sanasi:* ${channel.createdAt.toISOString().split('T')[0]}\n`;
            message += `*Yangilangan sanasi:* ${channel.updatedAt.toISOString().split('T')[0]}\n\n`;

            ctx.replyWithMarkdown(message);
        });

    } catch (error) {
        console.log(error);
        ctx.reply('Botda nosozlik.');
    }
};

module.exports = {
    updateChannelScene,
    deleteChannelScene,
    getChannels
};
