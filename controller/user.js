const db = require('./../model/index');
const User = db.users;
const Count = db.counts;
const Group = db.groups;
const { Markup } = require('telegraf');
const startCommand = async (ctx) => {
  const userId = ctx.from.id;
  const userName = ctx.from.username;
  const referralLink = `https://t.me/${ctx.botInfo.username}?start=${userId}`;
  const referrerId = ctx.message.text.split(' ')[1] || null;
  const user = await User.findByPk(userId);
  const group = await Group.findOne({ where: { group_status: 1 } });
  if (!user) {
    await User.create({
      user_id: userId,
      user_name: userName,
      user_link: referralLink,
    });
    const count = await Count.findOne({
      where: {
        userId: referrerId,
        groupId: group.group_id,
      },
    });
    if (!count) {
      await Count.create({
        user_count: 1,
        userId: referrerId,
        groupId: group.group_id,
      });
    } else {
      count.user_count = count.user_count + 1;
      await count.save();
    }
    ctx.reply(referralLink);
  } else {
    ctx.reply(user.user_link);
  }

  await ctx.reply(
    'Choose an action:',
    Markup.inlineKeyboard([
      [
        {
          text: 'Forward this message',
          switch_inline_query: `: ${referralLink}`,
        },
      ],
      [Markup.button.callback('Check', 'check')],
    ])
  );
};
const handleCheck = async (ctx) => {
  const userId = ctx.from.id;
  const group = await Group.findOne({ where: { group_status: 1 } });
  const count = await Count.findOne({
    where: {
      userId: userId,
      groupId: group.group_id,
    },
  });
  if (count.user_count < group.group_count) {
    ctx.reply(
      `Sizda qabul qilingan foydalanuvchilar yetarli emas. \n Bu guruh uchun qo'shilishi kerak bo'lgan jami foydalanuvchilar: ${group.group_count} \n Siz orqali qo'shilgan foydalanuvchilar: ${count.user_count}`
    );
  } else {
    ctx.reply(group.group_link);
  }
};
module.exports = { startCommand, handleCheck };
