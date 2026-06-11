const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Movie = sequelize.define('Movie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(220),
    allowNull: false,
    unique: true,
  },
  hindiTitle: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  releaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true,
  },
  language: {
    type: DataTypes.STRING(50),
    defaultValue: 'Hindi',
  },
  genre: {
    type: DataTypes.JSON, // array of genres
    allowNull: true,
  },
  director: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  producer: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  cast: {
    type: DataTypes.JSON, // [{name, role, character}]
    allowNull: true,
  },
  posterUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  bannerUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  trailerUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  synopsis: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  trueEventDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  realEventDate: {
    type: DataTypes.STRING(100),
    allowNull: true, // e.g., "1971", "March 1993"
  },
  realPersonNames: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  realEventLocation: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  streamingOn: {
    type: DataTypes.JSON, // ["Netflix", "Prime", "Hotstar"]
    allowNull: true,
  },
  defaultRealPercent: {
    type: DataTypes.FLOAT,
    defaultValue: 50.0,
  },
  avgRealPercent: {
    type: DataTypes.FLOAT,
    defaultValue: null,
    allowNull: true,
  },
  avgStarRating: {
    type: DataTypes.FLOAT,
    defaultValue: null,
    allowNull: true,
  },
  totalRatings: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalPercentVotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  shareCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isTrending: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  metaTitle: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  metaDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON, // ["war", "sports", "crime"]
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM('biographical', 'historical', 'crime', 'sports', 'political', 'social', 'war', 'disaster', 'other'),
    defaultValue: 'biographical',
  },
});

module.exports = Movie;
