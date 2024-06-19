module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    user_name: {
      type: DataTypes.STRING,
    },
  });
  return users;
};
