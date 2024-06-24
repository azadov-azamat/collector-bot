module.exports = (sequelize, DataTypes) => {
  const message = sequelize.define('messages', {
    message: {
      type: DataTypes.STRING,
    },
    message_status: {
      type: DataTypes.BOOLEAN,
    },
  });
  return message;
};
