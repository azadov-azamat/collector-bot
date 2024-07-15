module.exports = (sequelize, DataTypes) => {
  return sequelize.define('messages', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sendAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.BIGINT,
    },
    chatId: {
      type: DataTypes.TEXT,
    },
    messageId: {
      type: DataTypes.TEXT,
    },
    url: {
      type: DataTypes.TEXT,
    },
    sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  });
};
