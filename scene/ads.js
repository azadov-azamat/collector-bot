const { Scenes, Markup} = require('telegraf');
const db = require('../model');
const Message = db.messages;

const { WizardScene } = Scenes;

const adsScene = new Scenes.WizardScene(
    'adsScene',
    (ctx) => {
        ctx.reply('Iltimos, tarqatmoqchi bo\'lgan xabaringizni yuboring:');
        return ctx.wizard.next();
    },
    async (ctx) => {
        const message = ctx.message;
        try {
            // Reklama bazaga saqlanadi
            await Message.create({
                message_id: message.message_id,
                chat_id: message.chat.id,
                message_type: message.type || 'message'
            });
            ctx.reply('Xabar muvaffaqiyatli saqlandi.');
        } catch (error) {
            console.error(`Xato: ${error.toString()}`);
            ctx.reply('Xabar saqlashda xato yuz berdi.');
        }
        return ctx.scene.leave();
    }
);

module.exports = {
    adsScene
};
