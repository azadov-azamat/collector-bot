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
    owner_id: {
      type: DataTypes.BIGINT,
    },
    sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  });
};
