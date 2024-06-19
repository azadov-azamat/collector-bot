module.exports = (sequelize, DataTypes) => {
  const groups = sequelize.define('groups', {
    group_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    group_name: {
      type: DataTypes.STRING,
    },
    group_link: {
      type: DataTypes.STRING,
    },
    group_count: {
      type: DataTypes.BIGINT,
    },
  });
  return groups;
};
