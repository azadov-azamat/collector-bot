const db = require('./../model/index');
const User = db.users;
const Group = db.groups;
const Channel = db.channels; // Assuming you have a channels model defined similarly to groups
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
};

const addGroup = async (ctx) => {
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
};

const getGroup = async (ctx) => {
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
    message += `*Created At:* ${group.createdAt.toISOString().split('T')[0]}\n`;
    message += `*Updated At:* ${group.updatedAt.toISOString().split('T')[0]}\n`;
    message += `\n--------------------\n`;
  });
  ctx.replyWithMarkdown(message, commandButtons);
};

const updateGroup = async (ctx) => {
  const [id, group_name, group_link, group_count] = ctx.message.text
    .split(' ')
    .slice(1);
  const group = await Group.findByPk(id);

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
};

const deleteGroup = async (ctx) => {
  const [id] = ctx.message.text.split(' ').slice(1);
  await Group.destroy({ where: { id } });
  ctx.reply('Deleted', commandButtons);
};

const addChannel = async (ctx) => {
  const [channel_name, channel_link] = ctx.message.text.split(' ').slice(1);
  console.log(channel_name);
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
};

const getChannel = async (ctx) => {
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
};

const updateChannel = async (ctx) => {
  const [id, channel_name, channel_link] = ctx.message.text.split(' ').slice(1);
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
};

const deleteChannel = async (ctx) => {
  const [id] = ctx.message.text.split(' ').slice(1);
  await Channel.destroy({ where: { id } });
  ctx.reply('Deleted', commandButtons);
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
};
