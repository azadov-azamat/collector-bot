const db = require('./../model/index');
const User = db.users;
const Count = db.counts;
const Group = db.groups;
const Channel = db.channels;
const Message = db.messages;
const { Markup } = require('telegraf');

const startCommand = async (ctx) => {
  try {
    const userId = ctx.from.id;

    const userName = ctx.from.username;
    const referralLink = `https://t.me/${ctx.botInfo.username}?start=${userId}`;
    const referrerId = ctx.message.text.split(' ')[1] || null;
    const user = await User.findByPk(userId);
    const group = await Group.findOne({ where: { group_status: true } });
    if (!group) {
      return ctx.reply("Hozirda active guruhlarimiz yo'q!");
    }
    if (!user) {
      await User.create({
        user_id: userId,
        user_name: userName,
        user_link: referralLink,
      });
      const count = await Count.findOne({
        where: {
          userId: referrerId,
          groupId: group.id,
        },
      });
      if (referrerId) {
        if (!count) {
          await Count.create({
            user_count: 1,
            userId: referrerId,
            groupId: group.id,
          });
        } else {
          count.user_count = count.user_count + 1;
          await count.save();
        }
      }
      ctx.reply(referralLink);
    } else {
      ctx.reply(user.user_link);
    }

    const channels = await Channel.findAll({ where: { channel_status: true } });
    const buttons = channels.map((channel) => {
      return [
        Markup.button.url(
          `Obuna bo'lish ${channel.channel_name}`,
          `https://t.me/${channel.channel_link.replace('@', '')}`
        ),
      ];
    });

    ctx.reply(
      `Guruh linkini olish uchun quyidagi kanallarga a'zo bo'ling va sizga berilgan referal linkni ${group.group_count} do'stingizga ulashing:`,
      Markup.inlineKeyboard([
        ...buttons,
        [
          {
            text: 'Forward referal link',
            switch_inline_query: `: ${referralLink}`,
          },
        ],
        [Markup.button.callback('Check', 'check')],
      ])
    );
  } catch (error) {
    console.log(error);
    ctx.reply("Noqulaylik uchun uzr so'rymiz!");
  }
};
const handleCheck = async (ctx) => {
  try {
    const userId = ctx.from.id;

    // Find the active group
    const group = await Group.findOne({ where: { group_status: true } });

    // Find all active channels
    const channels = await Channel.findAll({
      where: {
        channel_status: true,
      },
    });

    // Find the user's referral count for the active group
    let count = await Count.findOne({
      where: {
        userId: userId,
        groupId: group?.id,
      },
    });

    // Initialize count if it doesn't exist
    if (!count) {
      count = { user_count: 0 };
    }

    // Initialize a string to hold the subscription status
    let subscriptionStatus = '';

    // Check subscription status for each channel
    const channelUsernames = channels.map((channel) => channel.channel_link);
    for (const channelUsername of channelUsernames) {
      try {
        // Check if the user is a member of the channel
        const chatMember = await ctx.telegram.getChatMember(
          channelUsername,
          userId
        );
        if (
          chatMember.status === 'member' ||
          chatMember.status === 'administrator' ||
          chatMember.status === 'creator'
        ) {
          subscriptionStatus += `You are subscribed to ${channelUsername}\n`;
        } else {
          subscriptionStatus += `You are not subscribed to ${channelUsername}\n`;
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
        // Handle error if necessary
      }
    }

    // Construct the reply message with all the necessary details
    let replyMessage = '';
    if (count.user_count < group.group_count) {
      replyMessage += `You need to refer ${group.group_count} friends and subscribe channels to receive the group link.\n`;
    } else {
      if (subscriptionStatus.includes('not subscribed')) {
        replyMessage += `You have referred ${count.user_count} friends, but you need to subscribe to all channels to receive the group link.\n`;
      } else {
        replyMessage += `You have referred ${count.user_count} friends and subscribed to all channels. Here is the group link: ${group.group_link}\n`;
      }
    }

    replyMessage += `Total required users for this group: ${group.group_count}\n`;
    replyMessage += `Total users referred by you: ${count.user_count}\n`;

    // Reply to the user with the constructed message
    ctx.reply(replyMessage);
  } catch (error) {
    console.log(error);
    ctx.reply("Noqulaylik uchun uzr so'raymiz!");
  }
};
const messageFunc = async () => {
  try {
    const subscribers = await User.findAll();
    const message = await Message.findOne({ where: { message_status: true } });
    console.log(message);
    const users = subscribers.map((user) => user.user_id);
    await Message.update({ message_status: false }, { where: {} });
    return { users, message };
  } catch (error) {
    console.log(error);
  }
};

module.exports = { startCommand, handleCheck, messageFunc };
