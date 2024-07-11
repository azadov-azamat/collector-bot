module.exports = (sequelize, DataTypes) => {
  return sequelize.define('users', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
    },
    user_name: {
      type: DataTypes.STRING,
      unique: true,
    },
    token: {
      type: DataTypes.STRING,
    },
    user_link: {
      type: DataTypes.STRING,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
    },
  });
};
