const db = require('./../model/index');
const User = db.users;
const Group = db.groups;
const Channel = db.channels; // Assuming you have a channels model defined similarly to groups
const Message = db.messages;
const { Markup } = require('telegraf');

const restricted = async (ctx, next) => {
  const userId = ctx.from.id;
  const user = await User.findByPk(userId);
  if (!user) {
    ctx.reply('Please login');
    return;
  }
  if (user.role != 'admin') {
    ctx.reply('You do not have the right to perform this action');
    return;
  }
  next();
};

const commandButtons = Markup.inlineKeyboard([
  [Markup.button.callback('Group', 'group_button')],
  [Markup.button.callback('Channel', 'channel_button')],
  [Markup.button.callback('Message', 'message')],
  [Markup.button.callback('Help', 'help')],
]);

const commandGroupButtons = Markup.inlineKeyboard([
  [Markup.button.callback('Add Group', 'add_group')],
  [Markup.button.callback('Update Group', 'update_group')],
  [Markup.button.callback('Delete Group', 'delete_group')],
  [Markup.button.callback('Get Groups', 'get_group')],
]);

const commandChannelButtons = Markup.inlineKeyboard([
  [Markup.button.callback('Add Channel', 'add_channel')],
  [Markup.button.callback('Update Channel', 'update_channel')],
  [Markup.button.callback('Delete Channel', 'delete_channel')],
  [Markup.button.callback('Get Channels', 'get_channel')],
]);

const startCommand = async (ctx) => {
  ctx.reply(
    'Welcome to the Authentication Bot! Please login with /login <username> <password>'
  );
};

const login = async (ctx) => {
  try {
    const [username, password] = ctx.message.text.split(' ').slice(1);
    const userId = ctx.from.id;
    const userName = ctx.from.username;
    if (!username || !password) {
      ctx.reply('Please provide both username and password.');
      return;
    }

    if (username != 'admin' || password != 'admin2024') {
      ctx.reply('Username or password incorrect!');
      return;
    }
    const user = await User.findByPk(userId);
    if (!user) {
      await User.create({
        user_id: userId,
        user_name: userName,
        role: 'admin',
      });
    } else {
      user.role = 'admin';
      await user.save();
    }

    ctx.reply(
      'Login successful! You are now authorized to use this bot.',
      commandButtons
    );
  } catch (error) {
    console.log(error);
    ctx.reply('Botda nosozlik');
  }
};

const addGroup = async (ctx) => {
  try {
    const [group_name, group_link, group_count] = ctx.message.text
      .split(' ')
      .slice(1);
    const group = await Group.findOne({ where: { group_link: group_link } });
    if (group) {
      ctx.reply('A group with this link already exists');
      return;
    }
    await Group.update(
      { group_status: false },
      {
        where: {}, // This will match all rows
      }
    );
    await Group.create({
      group_name,
      group_link,
      group_count,
    });
    ctx.reply('You have successfully added a group', commandButtons);
  } catch (error) {
    console.log(error);
    ctx.reply('Botda nosozlik');
  }
};

const getGroup = async (ctx) => {
  try {
    const groups = await Group.findAll();
    if (!groups.length) {
      ctx.reply('No groups found.');
      return;
    }
    let message = 'Here are the groups:\n';
    groups.forEach((group) => {
      message += `\n*Group Id:* ${group.id}\n`;
      message += `*Group Name:* ${group.group_name}\n`;
      message += `*Group Link:* ${group.group_link}\n`;
      message += `*Group Count:* ${group.group_count}\n`;
      message += `*Group Status:* ${
        group.group_status ? 'Active' : 'Inactive'
      }\n`;
      message += `*Created At:* ${
        group.createdAt.toISOString().split('T')[0]
      }\n`;
      message += `*Updated At:* ${
        group.updatedAt.toISOString().split('T')[0]
      }\n`;
      message += `\n--------------------\n`;
    });
    ctx.replyWithMarkdown(message, commandButtons);
  } catch (error) {
    console.log(error);
    ctx.reply('Botda nosozlik');
  }
};

const updateGroup = async (ctx) => {
  try {
    const [id, group_name, group_link, group_count] = ctx.message.text
      .split(' ')
      .slice(1);

    if (!group_name) {
      await Group.update(
        { group_status: false },
        {
          where: {}, // This will match all rows
        }
      );
      await Group.update(
        { group_status: true },
        {
          where: { id }, // This will match all rows
        }
      );
    }

    await Group.update(
      { group_name, group_link, group_count },
      {
        where: { id }, // This will match all rows
      }
    );
    ctx.reply('Updated', commandButtons);
  } catch (error) {
    console.log(error);
    ctx.reply('Botda nosozlik');
  }
};

const deleteGroup = async (ctx) => {
  try {
    const [id] = ctx.message.text.split(' ').slice(1);
    await Group.destroy({ where: { id } });
    ctx.reply('Deleted', commandButtons);
  } catch (error) {
    console.log(error);
    ctx.reply('Botda nosozlik');
  }
};

const addChannel = async (ctx) => {
  try {
    const [channel_name, channel_link] = ctx.message.text.split(' ').slice(1);
    console.log(channel_name);
    console.log(ctx.message.text);
    console.log(channel_name, channel_link);

    const channel = await Channel.findOne({
      where: { channel_link: channel_link },
    });
    if (channel) {
      ctx.reply('A channel with this link already exists');
      return;
    }
    await Channel.create({
      channel_name,
      channel_link,
    });
    ctx.reply('You have successfully added a channel', commandButtons);
  } catch (error) {
    console.log(error);
    ctx.reply('Botda nosozlik');
  }
};

const getChannel = async (ctx) => {
  try {
    const channels = await Channel.findAll();
    if (!channels.length) {
      ctx.reply('No channels found.');
      return;
    }
    let message = 'Here are the channels:\n';
    channels.forEach((channel) => {
      message += `\n*Channel Id:* ${channel.id}\n`;
      message += `*Channel Name:* ${channel.channel_name}\n`;
      message += `*Channel Link:* ${channel.channel_link}\n`;
      message += `*Channel Status:* ${
        channel.channel_status ? 'Active' : 'Inactive'
      }\n`;
      message += `*Created At:* ${
        channel.createdAt.toISOString().split('T')[0]
      }\n`;
      message += `*Updated At:* ${
        channel.updatedAt.toISOString().split('T')[0]
      }\n`;
      message += `\n--------------------\n`;
    });
    ctx.replyWithMarkdown(message, commandButtons);
  } catch (error) {
    console.log(error);
    ctx.reply('Botda nosozlik');
  }
};

const updateChannel = async (ctx) => {
  try {
    const [id, channel_name, channel_link] = ctx.message.text
      .split(' ')
      .slice(1);
    const channel = await Channel.findByPk(id);
    if (!channel_name) {
      await Channel.update(
        { channel_status: channel.channel_status ? false : true },
        {
          where: { id }, // This will match all rows
        }
      );
    }

    await Channel.update(
      { channel_name, channel_link },
      {
        where: { id }, // This will match all rows
      }
    );
    ctx.reply('Updated', commandButtons);
  } catch (error) {
    console.log(error);
    ctx.reply('Botda nosozlik');
  }
};

const deleteChannel = async (ctx) => {
  try {
    const [id] = ctx.message.text.split(' ').slice(1);
    await Channel.destroy({ where: { id } });
    ctx.reply('Deleted', commandButtons);
  } catch (error) {
    console.log(error);
    ctx.reply('Botda nosozlik');
  }
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
  login,
  addGroup,
  updateGroup,
  deleteGroup,
  restricted,
  getGroup,
  addChannel,
  updateChannel,
  deleteChannel,
  getChannel,
  commandButtons,
  commandGroupButtons,
  commandChannelButtons,
  helpCommand,
  addMessage,
};
