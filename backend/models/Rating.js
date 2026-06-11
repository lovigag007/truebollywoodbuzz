const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  starRating: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: { min: 1, max: 5 },
  },
  realPercent: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 0, max: 100 },
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  helpfulCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = Rating;
