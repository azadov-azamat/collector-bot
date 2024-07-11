const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  "collector_bot", // database
  "collector", // user
  "root123", // password
  {
    host: "45.136.17.222",
    dialect: 'postgres',
    operatorsAliases: false,
  }
);

const users = require('./user');
const groups = require('./group');
const channels = require('./channel');
const counts = require('./count');
const messages = require('./message');
sequelize
  .authenticate()
  .then(() => {
    console.log('connected..');
  })
  .catch((err) => {
    console.log('Error' + err);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = users(sequelize, DataTypes);
db.groups = groups(sequelize, DataTypes);
db.counts = counts(sequelize, DataTypes);
db.channels = channels(sequelize, DataTypes);
db.messages = messages(sequelize, DataTypes);
db.counts.belongsTo(db.users, {
  foreignKey: 'userId',
});
db.counts.belongsTo(db.groups, {
  foreignKey: 'groupId',
});

db.groups.hasMany(db.counts, {
  foreignKey: 'groupId',
});
db.users.hasMany(db.counts, {
  foreignKey: 'userId',
});

db.sequelize.sync({ force: false }).then(() => {
  console.log('yes re-sync done!');
});

module.exports = db;
