const { Feedback } = require('../models');

// POST /api/feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { name, email, subject, message, type } = req.body;

    if (!message || message.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Message must be at least 10 characters' });
    }

    const feedback = await Feedback.create({
      userId: req.user?.id || null,
      name: name || req.user?.name || 'Anonymous',
      email,
      subject,
      message: message.trim(),
      type: type || 'general',
    });

    res.status(201).json({ success: true, message: 'Thank you for your feedback!', data: feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
