module.exports = (sequelize, DataTypes) => {
  return sequelize.define('messages', {
    message: {
      type: DataTypes.STRING,
    },
    message_status: {
      type: DataTypes.BOOLEAN,
    },
  });
};
