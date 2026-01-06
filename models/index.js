const sequelize = require('../config/sequelize');
const User = require('./User');
const RefreshToken = require('./RefreshToken');

User.hasMany(RefreshToken, {
  foreignKey: 'userId',
  as: 'refreshTokens',
  onDelete: 'CASCADE'
});

RefreshToken.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

const db = {
  sequelize,
  User,
  RefreshToken
};

module.exports = db;
