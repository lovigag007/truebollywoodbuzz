const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // can be anonymous
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('general', 'bug', 'suggestion', 'movie_request', 'other'),
    defaultValue: 'general',
  },
  status: {
    type: DataTypes.ENUM('new', 'read', 'replied', 'closed'),
    defaultValue: 'new',
  },
});

module.exports = Feedback;
