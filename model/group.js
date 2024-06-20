module.exports = (sequelize, DataTypes) => {
  const groups = sequelize.define('cl_groups', {
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
    group_status: {
      type: DataTypes.BOOLEAN,
    },
  });
  return groups;
};
