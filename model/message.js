module.exports = (sequelize, DataTypes) => {
  return sequelize.define('messages', {
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      messageType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fileId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      filePath: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      textContent: {
          type: DataTypes.TEXT,
      },
      status: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
      },
      send: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
      },
      location: {
          type: DataTypes.JSON,
      },
      pollQuestion: {
          type: DataTypes.TEXT,
          allowNull: true,
      },
      pollOptions: {
          type: DataTypes.JSON,
          allowNull: true,
      },
  });
};