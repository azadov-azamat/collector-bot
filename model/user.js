module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      unique: true,
    },
    user_name: {
      type: DataTypes.STRING,
      unique: true,
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
  return users;
};
