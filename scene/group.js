const { Scenes, Markup} = require('telegraf');
const db = require('../model');
const {commandGroupButtons} = require("../keyboards");
const {removeKeyboard} = require("telegraf/markup");
const {messageTypes} = require("../utils/functions");
const Group = db.groups;

const { WizardScene } = Scenes;

const addGroupScene = new WizardScene(
    'addGroupScene',
    async (ctx) => {
        await ctx.reply('Iltimos, guruh nomini kiriting:', removeKeyboard());
        ctx.wizard.state.data = {};
        return ctx.wizard.next();
    },
    async (ctx) => {
        ctx.wizard.state.data.group_name = ctx.message.text;
        await ctx.reply('Iltimos, guruh linkini kiriting:');
        return ctx.wizard.next();
    },
    async (ctx) => {
        ctx.wizard.state.data.group_link = ctx.message.text;
        await ctx.reply('Iltimos, guruh a\'zolari sonini kiriting:');
        return ctx.wizard.next();
    },
    async (ctx) => {
        ctx.wizard.state.data.group_count = ctx.message.text;
        const { group_name, group_link, group_count } = ctx.wizard.state.data;

        try {
            const group = await Group.findOne({ where: { group_link: group_link } });
            if (group) {
                await ctx.reply('Berilgan link oldin qo\'shilgan! Tekshirib qayta urinib ko\'ring');
                return ctx.scene.leave();
            }

            await Group.update(
                { group_status: false },
                { where: {} }
            );

            await Group.create({
                group_name,
                group_link,
                group_count,
            });

            await ctx.reply('Guruhni muvoffaqiyatli qo\'shdingiz!');
            await ctx.reply('Kerakli bo\'limni tanlang', commandGroupButtons);
        } catch (error) {
            console.log(error);
            await ctx.reply('Botda nosozlik');
        }

        return ctx.scene.leave();
    }
);

const getGroup = async (ctx) => {
    try {
        const groups = await Group.findAll();
        if (!groups.length) {
            ctx.reply('Guruhlar topilmadi.');
            return;
        }
        groups.forEach((group) => {
            let message = '*Guruh haqida ma\'lumot:*\n\n';
            message += `*ID:* ${group.id}\n`;
            message += `*Nomi:* ${group.group_name}\n`;
            message += `*Linki:* ${group.group_link}\n`;
            message += `*A'zolari soni:* ${group.group_count}\n`;
            message += `*Holati:* ${group.group_status ? 'Faol' : 'Faol emas'}\n`;
            message += `*Yaratilgan sanasi:* ${group.createdAt.toISOString().split('T')[0]}\n`;
            message += `*Yangilangan sanasi:* ${group.updatedAt.toISOString().split('T')[0]}\n`;
            ctx.replyWithMarkdown(message);
        });
    } catch (error) {
        console.log(error);
        ctx.reply('Botda nosozlik');
    }
};

const updateGroupScene = new WizardScene(
    'updateGroupScene',
    async (ctx) => {
        const groups = await Group.findAll();
        if (!groups.length) {
            await ctx.reply('Guruhlar topilmadi.');
            return ctx.scene.leave();
        }
        const buttons = groups.map((group) => Markup.button.callback(group.group_name, `select_${group.id}`));

        await ctx.reply('Guruhlar ro\'yhati:', removeKeyboard());
        await ctx.reply('O\'zgartirmoqchi bo\'lgan guruhni tanlang:', Markup.inlineKeyboard(buttons).resize());

        ctx.wizard.state.data = {};
        return ctx.wizard.next();
    },
    async (ctx) => {
        await ctx.deleteMessage();
        const callbackData = ctx.callbackQuery.data;
        const groupId = callbackData.split('_')[1];
        ctx.wizard.state.data.id = groupId;
        const group = await Group.findByPk(groupId);

        if (!group) {
            ctx.reply('Guruh topilmadi.');
            return ctx.scene.leave();
        }

        let message = `*Guruh ID:* ${group.id}\n`;
        message += `*Guruh nomi:* ${group.group_name}\n`;
        message += `*Guruh linki:* ${group.group_link}\n`;
        message += `*Guruh a'zolari soni:* ${group.group_count}\n`;
        message += `*Guruh holati:* ${group.group_status ? 'Faol' : 'Faol emas'}\n`;
        message += `*Yaratilgan sanasi:* ${group.createdAt.toISOString().split('T')[0]}\n`;
        message += `*Yangilangan sanasi:* ${group.updatedAt.toISOString().split('T')[0]}\n`;

        const updateButtons = [
            Markup.button.callback('Guruh nomi', 'group_name'),
            Markup.button.callback('Guruh linki', 'group_link'),
            Markup.button.callback('Guruh a\'zolari soni', 'group_count'),
            Markup.button.callback('Guruh holati', 'group_status')
        ];

        await ctx.replyWithMarkdown(message, Markup.inlineKeyboard(updateButtons, { columns: 1 }).resize());
        return ctx.wizard.next();
    },
    async (ctx) => {
        await ctx.deleteMessage();
        const fieldToUpdate = ctx.callbackQuery.data;
        ctx.wizard.state.data.fieldToUpdate = fieldToUpdate;

        if (fieldToUpdate === 'group_status') {
            const statusButtons = [
                Markup.button.callback('Aktivlashtirish', 'status_active'),
                Markup.button.callback('Faolsizlashtirish', 'status_inactive')
            ];
            await ctx.reply('Guruh holatini tanlang:', Markup.inlineKeyboard(statusButtons).resize());
        } else {
            await ctx.reply(`Iltimos, yangi ${messageTypes(fieldToUpdate)} ni kiriting:`);
        }
        return ctx.wizard.next();
    },
    async (ctx) => {
        let newValue;
        const { id, fieldToUpdate } = ctx.wizard.state.data;

        if (fieldToUpdate === 'group_status') {
            newValue = ctx.callbackQuery.data === 'status_active';
        } else {
            newValue = ctx.message.text;
        }

        let updateData = {};
        updateData[fieldToUpdate] = newValue;

        try {
            await Group.update(updateData, { where: { id } });
            ctx.reply(`${messageTypes(fieldToUpdate)} muvaffaqiyatli yangilandi`, commandGroupButtons);
        } catch (error) {
            console.log(error);
            ctx.reply('Botda nosozlik', commandGroupButtons);
        }
        return ctx.scene.leave();
    }
);

updateGroupScene.action(/select_\d+/, (ctx) => ctx.wizard.steps[ctx.wizard.cursor](ctx));
updateGroupScene.action(/update_.+/, (ctx) => ctx.wizard.steps[ctx.wizard.cursor](ctx));

const deleteGroupScene = new Scenes.WizardScene(
    'deleteGroupScene',
    async (ctx) => {
        const groups = await Group.findAll();
        if (!groups.length) {
            ctx.reply('Guruhlar topilmadi.');
            return ctx.scene.leave();
        }
        const buttons = groups.map((group) => [Markup.button.callback(group.group_name, `select_${group.id}`)]);
        await ctx.reply('Iltimos, o\'chirmoqchi bo\'lgan guruhni tanlang:', Markup.removeKeyboard());
        await ctx.reply('Guruhni tanlang:', Markup.inlineKeyboard(buttons).resize());
        ctx.wizard.state.data = {};
        return ctx.wizard.next();
    },
    async (ctx) => {
        await ctx.deleteMessage();
        const callbackData = ctx.callbackQuery.data;
        const groupId = callbackData.split('_')[1];
        ctx.wizard.state.data.id = groupId;
        const group = await Group.findByPk(groupId);

        if (!group) {
            ctx.reply('Guruh topilmadi.');
            return ctx.scene.leave();
        }

        let message = `*Guruh ID:* ${group.id}\n`;
        message += `*Guruh nomi:* ${group.group_name}\n`;
        message += `*Guruh linki:* ${group.group_link}\n`;
        message += `*Guruh a'zolari soni:* ${group.group_count}\n`;
        message += `*Guruh holati:* ${group.group_status ? 'Faol' : 'Faol emas'}\n`;
        message += `*Yaratilgan sanasi:* ${group.createdAt.toISOString().split('T')[0]}\n`;
        message += `*Yangilangan sanasi:* ${group.updatedAt.toISOString().split('T')[0]}\n`;

        const deleteButton = Markup.inlineKeyboard([
            Markup.button.callback('Tasdiqlash', 'confirm_delete'),
            Markup.button.callback('Bekor qilish', 'cancel_delete')
        ]).resize();

        await ctx.replyWithMarkdown(message);
        await ctx.reply('Iltimos, guruhni o\'chirishni tasdiqlang:', deleteButton);
        return ctx.wizard.next();
    },
    async (ctx) => {
        await ctx.deleteMessage();
        const callbackData = ctx.callbackQuery.data;
        if (callbackData === 'confirm_delete') {
            const groupId = ctx.wizard.state.data.id;

            try {
                await Group.destroy({ where: { id: groupId } });
                ctx.reply('Guruh muvaffaqiyatli o\'chirildi', commandGroupButtons);
            } catch (error) {
                console.log(error);
                ctx.reply('Botda nosozlik');
            }
        } else if (callbackData === 'cancel_delete') {
            ctx.reply('Guruhni o\'chirish bekor qilindi.', commandGroupButtons);
        }
        return ctx.scene.leave();
    }
);

deleteGroupScene.action(/select_\d+/, (ctx) => ctx.wizard.steps[ctx.wizard.cursor](ctx));
deleteGroupScene.action('confirm_delete', (ctx) => ctx.wizard.steps[ctx.wizard.cursor](ctx));

module.exports = {addGroupScene, getGroup, updateGroupScene, deleteGroupScene};
