const db = require('./../model/index');
const User = db.users;
const Group = db.groups;
const Channel = db.channels; // Assuming you have a channels model defined similarly to groups
const Message = db.messages;
const { Markup } = require('telegraf');
const {commandButtons, commandChannelButtons, commandGroupButtons} = require("../keyboards");

const restricted = async (ctx, next) => {
  const userId = ctx.from.id;
  const user = await User.findByPk(userId);
  if (!user) {
    ctx.reply('Please login');
    return;
  }
  if (user.role !== 'admin') {
    ctx.reply('You do not have the right to perform this action');
    return;
  }
  next();
};

const startCommand = async (ctx) => {
  ctx.reply('Autentifikatsiya botiga xush kelibsiz! Iltimos, /login komandasi bilan tizimga kiring');
};

const helpCommand = (ctx) => {
  const helpMessage = `
<b>Here are the available commands:</b>
- <code>/start</code> - Start the bot
- <code>/login &lt;username&gt; &lt;password&gt;</code> - Login to the bot
- <code>/add_group &lt;group_name&gt; &lt;group_link&gt; &lt;group_count&gt;</code> - Add a new group
- <code>/update_group &lt;id&gt; &lt;group_name&gt; &lt;group_link&gt; &lt;group_count&gt;</code> - Update a group by ID
- <code>/delete_group &lt;id&gt;</code> - Delete a group by ID
- <code>/get_group</code> - List all groups
- <code>/add_channel &lt;channel_name&gt; &lt;channel_link&gt;</code> - Add a new channel
- <code>/update_channel &lt;id&gt; &lt;channel_name&gt; &lt;channel_link&gt;</code> - Update a channel by ID
- <code>/delete_channel &lt;id&gt;</code> - Delete a channel by ID
- <code>/get_channel</code> - List all channels
  `;
  ctx.replyWithHTML(helpMessage, commandButtons);
};

const addMessage = async (ctx) => {
  try {
    const messageText = ctx.message.text;
    const regex = /\/send_message\s+"([^"]+)"/;
    const match = messageText.match(regex);

    if (!match) {
      ctx.reply(
        'Please provide the message in the format: /send_message "Your message"'
      );
      return;
    }

    const message = match[1];
    await Message.update(
      { message_status: false },
      {
        where: {}, // This will match all rows
      }
    );
    await Message.create({
      message: message,
      message_status: true,
    });
    ctx.reply('Message send');
  } catch (error) {
    console.log(error);
    ctx.reply("Meesage wasn't send");
  }
};

module.exports = {
  startCommand,
  restricted,
  helpCommand,
  addMessage,
};
