module.exports = (sequelize, DataTypes) => {
  return sequelize.define('counts', {
    user_count: {
      type: DataTypes.BIGINT,
    },
  });
};
