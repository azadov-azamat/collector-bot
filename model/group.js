module.exports = (sequelize, DataTypes) => {
  return sequelize.define('cl_groups', {
    group_name: {
      type: DataTypes.STRING,
    },
    group_link: {
      type: DataTypes.STRING,
      unique: true,
    },
    group_count: {
      type: DataTypes.INTEGER,
    },
    group_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });
};
