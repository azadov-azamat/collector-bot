module.exports = (sequelize, DataTypes) => {
  const counts = sequelize.define('counts', {
    user_count: {
      type: DataTypes.BIGINT,
    },
  });
  return counts;
};
