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
  console.log(group.group_id);
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
      [Markup.button.callback('Forward', 'forward')],
      [Markup.button.callback('Check', 'check')],
    ])
  );
};
module.exports = { startCommand };
