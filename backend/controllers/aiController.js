const aiService = require('../services/aiService');

// POST /api/chat
async function handleChat(req, res, next) {
  try {
    const { message, context } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await aiService.chatWithAssistant({
      userId: req.userId,
      message,
      context,
    });

    res.json(response);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleChat,
};

