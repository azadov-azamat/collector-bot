module.exports = (sequelize, DataTypes) => {
  return sequelize.define('messages', {
    message_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    chat_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    owner_id: {
      type: DataTypes.INTEGER,
    },
    file_id: {
      type: DataTypes.STRING,
    },
    sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    message_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });
};
