const RecommendationService = require('../services/recommendationService');

exports.getRecommendations = async (req, res) => {
    try {
        req.setTimeout(60000); // 1 minute timeout

        const recommendations = await RecommendationService.getRecommendations();
        res.status(200).json(recommendations);
    } catch (error) {
        console.error('Error in recommendations controller:', error);
        res.status(500).json({
            message: 'Failed to get recommendations',
            error: error.toString()
        });
    }
};