const sequelize = require('../config/database');
const User = require('./User');
const OTP = require('./OTP');
const Movie = require('./Movie');
const Rating = require('./Rating');
const Feedback = require('./Feedback');

// Associations
User.hasMany(Rating, { foreignKey: 'userId', as: 'ratings' });
Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Movie.hasMany(Rating, { foreignKey: 'movieId', as: 'ratings' });
Rating.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

User.hasMany(Feedback, { foreignKey: 'userId', as: 'feedbacks' });
Feedback.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Unique constraint for Rating
Rating.addIndex = () => {};

module.exports = { sequelize, User, OTP, Movie, Rating, Feedback };
