const { Op } = require('sequelize');
const slugify = require('slugify');
const { Movie, Rating, User } = require('../models');

// GET /api/movies - list all with filters
exports.getMovies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      year,
      sort = 'createdAt',
      order = 'DESC',
      trending,
      featured,
    } = req.query;

    const where = { isPublished: true };
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { hindiTitle: { [Op.like]: `%${search}%` } },
        { director: { [Op.like]: `%${search}%` } },
        { realPersonNames: { [Op.like]: `%${search}%` } },
      ];
    }
    if (category) where.category = category;
    if (year) where.year = year;
    if (trending === 'true') where.isTrending = true;
    if (featured === 'true') where.isFeatured = true;

    const validSorts = ['createdAt', 'year', 'avgStarRating', 'viewCount', 'totalRatings', 'avgRealPercent'];
    const sortField = validSorts.includes(sort) ? sort : 'createdAt';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Movie.findAndCountAll({
      where,
      order: [[sortField, order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']],
      limit: parseInt(limit),
      offset,
      attributes: {
        exclude: ['metaTitle', 'metaDescription'],
      },
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/movies/trending
exports.getTrending = async (req, res) => {
  try {
    const movies = await Movie.findAll({
      where: { isTrending: true, isPublished: true },
      order: [['viewCount', 'DESC']],
      limit: 20,
    });
    res.json({ success: true, data: movies });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/movies/:slug
exports.getMovieBySlug = async (req, res) => {
  try {
    const movie = await Movie.findOne({
      where: { slug: req.params.slug, isPublished: true },
    });

    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

    // Increment view count
    await movie.increment('viewCount');

    // Fetch recent reviews
    const recentRatings = await Rating.findAll({
      where: { movieId: movie.id, isApproved: true },
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    // User's own rating if logged in
    let userRating = null;
    if (req.user) {
      userRating = await Rating.findOne({
        where: { movieId: movie.id, userId: req.user.id },
      });
    }

    res.json({ success: true, data: movie, recentRatings, userRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/movies/:id/rate
exports.rateMovie = async (req, res) => {
  try {
    const { starRating, realPercent, review } = req.body;
    const movieId = req.params.id;

    const movie = await Movie.findByPk(movieId);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

    if (starRating && (starRating < 1 || starRating > 5)) {
      return res.status(400).json({ success: false, message: 'Star rating must be between 1 and 5' });
    }
    if (realPercent !== undefined && (realPercent < 0 || realPercent > 100)) {
      return res.status(400).json({ success: false, message: 'Real percent must be between 0 and 100' });
    }

    let rating = await Rating.findOne({ where: { userId: req.user.id, movieId } });

    if (rating) {
      await rating.update({ starRating, realPercent, review });
    } else {
      rating = await Rating.create({ userId: req.user.id, movieId, starRating, realPercent, review });
      await User.increment('totalRatings', { where: { id: req.user.id } });
    }

    // Recalculate averages
    const allRatings = await Rating.findAll({ where: { movieId, isApproved: true } });
    const starRatings = allRatings.filter((r) => r.starRating !== null);
    const percentVotes = allRatings.filter((r) => r.realPercent !== null);

    const avgStar = starRatings.length
      ? starRatings.reduce((s, r) => s + r.starRating, 0) / starRatings.length
      : null;
    const avgPercent = percentVotes.length
      ? percentVotes.reduce((s, r) => s + r.realPercent, 0) / percentVotes.length
      : null;

    await movie.update({
      avgStarRating: avgStar ? Math.round(avgStar * 10) / 10 : null,
      avgRealPercent: avgPercent ? Math.round(avgPercent * 10) / 10 : null,
      totalRatings: starRatings.length,
      totalPercentVotes: percentVotes.length,
    });

    res.json({ success: true, message: 'Rating submitted!', rating, movie });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/movies/:id/share
exports.trackShare = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    await movie.increment('shareCount');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/movies/search/suggestions
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, data: [] });

    const movies = await Movie.findAll({
      where: {
        isPublished: true,
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { hindiTitle: { [Op.like]: `%${q}%` } },
        ],
      },
      attributes: ['id', 'title', 'hindiTitle', 'slug', 'year', 'posterUrl'],
      limit: 5,
    });
    res.json({ success: true, data: movies });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── ADMIN ────────────────────────────────────────────────
// POST /api/admin/movies
exports.createMovie = async (req, res) => {
  try {
    const body = req.body;
    let slug = slugify(body.title, { lower: true, strict: true });

    // Ensure unique slug
    const existing = await Movie.findOne({ where: { slug } });
    if (existing) slug = `${slug}-${body.year || Date.now()}`;

    const posterUrl = req.files?.poster
      ? `/uploads/posters/${req.files.poster[0].filename}`
      : body.posterUrl || null;
    const bannerUrl = req.files?.banner
      ? `/uploads/banners/${req.files.banner[0].filename}`
      : body.bannerUrl || null;

    // Parse JSON fields if sent as strings
    const parseField = (f) => {
      if (!f) return null;
      if (typeof f === 'string') { try { return JSON.parse(f); } catch { return f; } }
      return f;
    };

    const movie = await Movie.create({
      ...body,
      slug,
      posterUrl,
      bannerUrl,
      genre: parseField(body.genre),
      cast: parseField(body.cast),
      streamingOn: parseField(body.streamingOn),
      tags: parseField(body.tags),
    });

    res.status(201).json({ success: true, message: 'Movie created!', data: movie });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// PUT /api/admin/movies/:id
exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

    const body = req.body;
    const posterUrl = req.files?.poster
      ? `/uploads/posters/${req.files.poster[0].filename}`
      : undefined;
    const bannerUrl = req.files?.banner
      ? `/uploads/banners/${req.files.banner[0].filename}`
      : undefined;

    const parseField = (f) => {
      if (!f) return null;
      if (typeof f === 'string') { try { return JSON.parse(f); } catch { return f; } }
      return f;
    };

    const updateData = {
      ...body,
      genre: parseField(body.genre),
      cast: parseField(body.cast),
      streamingOn: parseField(body.streamingOn),
      tags: parseField(body.tags),
    };

    if (posterUrl) updateData.posterUrl = posterUrl;
    if (bannerUrl) updateData.bannerUrl = bannerUrl;

    await movie.update(updateData);
    res.json({ success: true, message: 'Movie updated!', data: movie });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/admin/movies/:id
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    await movie.destroy();
    res.json({ success: true, message: 'Movie deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/movies - all including unpublished
exports.adminGetMovies = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const where = {};
    if (search) where.title = { [Op.like]: `%${search}%` };

    const { count, rows } = await Movie.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
