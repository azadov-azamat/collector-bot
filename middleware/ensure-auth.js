const db = require('../model/index');
const {removeKeyboard} = require("telegraf/markup");
const User = db.users;

function ensureAuth() {
    return async function(ctx, next) {
        const userId = ctx.from.id;
        const user = await User.findByPk(userId);

        if (user && user.token) {
            next()
        } else {
            ctx.reply('Siz tizimga kirmagansiz. Iltimos, tizimga kirish uchun /login buyrug\'idan foydalaning', removeKeyboard());
        }
    }
}

module.exports = ensureAuth;