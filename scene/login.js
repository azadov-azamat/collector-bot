const db = require('./../model/index');
const User = db.users;
const {v4: uuidv4} = require('uuid');

const {Scenes} = require('telegraf');
const {WizardScene} = Scenes;

module.exports = new WizardScene(
    'loginScene',
    (ctx) => {
        ctx.reply('Iltimos, foydalanuvchi nomingizni kiriting:');
        ctx.wizard.state.data = {}; // Barcha holatni wizard ichida saqlaymiz
        return ctx.wizard.next();
    },
    (ctx) => {
        ctx.wizard.state.data.username = ctx.message.text;
        ctx.reply('Iltimos, parolingizni kiriting:');
        return ctx.wizard.next();
    },
    async (ctx) => {
        const password = ctx.message.text;
        const {username} = ctx.wizard.state.data;

        if (!username || !password) {
            ctx.reply('Iltimos, foydalanuvchi nomi va parolni to\'liq kiriting.');
            return ctx.scene.leave();
        }

        if (username !== 'admin' || password !== 'admin2024') {
            ctx.reply('Foydalanuvchi nomi yoki parol noto\'g\'ri! Qayta urinib ko\'ring.');
            return ctx.scene.reenter(); // Wizardni qayta ishga tushirish
        }

        const userId = ctx.from.id;
        const userName = ctx.from.username;
        let token = uuidv4();

        let user = await User.findByPk(userId);
        if (!user) {
            await User.create({
                user_id: userId,
                user_name: userName,
                role: 'admin',
                token
            });
        } else {
            user.role = 'admin';
            user.token = token;
            await user.save();
        }

        ctx.reply('Tizimga muvaffaqiyatli kirdingiz! \n Kommandalar bo\'limidan kerakli bo\'limni tanlang');
        return ctx.scene.leave();
    }
);
