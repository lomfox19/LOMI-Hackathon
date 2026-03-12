const aiService = require('../services/aiService');

// POST /api/medical/analyze
async function analyzeSymptoms(req, res, next) {
  try {
    const { symptoms, age, gender, notes } = req.body || {};

    if (!symptoms || typeof symptoms !== 'string') {
      return res.status(400).json({ error: 'Symptoms description is required' });
    }

    const numericAge = age ? Number(age) : undefined;

    const result = await aiService.analyzeSymptoms({
      userId: req.userId,
      symptoms,
      age: Number.isNaN(numericAge) ? undefined : numericAge,
      gender,
      notes,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  analyzeSymptoms,
};

