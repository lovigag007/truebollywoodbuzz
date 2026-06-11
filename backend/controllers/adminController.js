const { Movie, User, Rating, Feedback } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// GET /api/admin/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalMovies, totalUsers, totalRatings, totalFeedbacks, pendingFeedbacks] = await Promise.all([
      Movie.count(),
      User.count({ where: { role: 'user' } }),
      Rating.count(),
      Feedback.count(),
      Feedback.count({ where: { status: 'new' } }),
    ]);

    const publishedMovies = await Movie.count({ where: { isPublished: true } });
    const trendingMovies = await Movie.count({ where: { isTrending: true } });

    const topRatedMovies = await Movie.findAll({
      where: { isPublished: true, avgStarRating: { [Op.ne]: null } },
      order: [['avgStarRating', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'slug', 'posterUrl', 'avgStarRating', 'totalRatings'],
    });

    const mostViewedMovies = await Movie.findAll({
      where: { isPublished: true },
      order: [['viewCount', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'slug', 'posterUrl', 'viewCount'],
    });

    // Recent activity
    const recentRatings = await Rating.findAll({
      include: [
        { model: User, as: 'user', attributes: ['name', 'phone'] },
        { model: Movie, as: 'movie', attributes: ['title', 'slug'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    res.json({
      success: true,
      stats: {
        totalMovies,
        publishedMovies,
        trendingMovies,
        totalUsers,
        totalRatings,
        totalFeedbacks,
        pendingFeedbacks,
      },
      topRatedMovies,
      mostViewedMovies,
      recentRatings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/users/:id/toggle
exports.toggleUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.update({ isActive: !user.isActive });
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/feedbacks
exports.getFeedbacks = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Feedback.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['name', 'phone'], required: false }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/feedbacks/:id
exports.updateFeedback = async (req, res) => {
  try {
    const fb = await Feedback.findByPk(req.params.id);
    if (!fb) return res.status(404).json({ success: false, message: 'Feedback not found' });
    await fb.update({ status: req.body.status });
    res.json({ success: true, message: 'Feedback updated', data: fb });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/admin/ratings/:id
exports.deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findByPk(req.params.id);
    if (!rating) return res.status(404).json({ success: false, message: 'Rating not found' });
    await rating.destroy();
    res.json({ success: true, message: 'Rating deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
