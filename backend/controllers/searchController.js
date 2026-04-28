const { getCandidates } = require('../models/searchModel');

/**
 * Scoring weights as defined in AGENT.md:
 *   title match:       +5
 *   tag match:         +4
 *   language match:    +3
 *   description match: +2
 *   code match:        +1
 */
const SCORE_WEIGHTS = {
    title: 5,
    tag: 4,
    language: 3,
    description: 2,
    code: 1
};

/**
 * Compute a relevance score for a single snippet against a search query.
 * All scoring is done in Node.js, NOT in SQL (per AGENT.md).
 */
const computeScore = (snippet, keyword, language, tags) => {
    let score = 0;
    const lowerKeyword = keyword ? keyword.toLowerCase() : '';

    // Title match
    if (lowerKeyword && snippet.title.toLowerCase().includes(lowerKeyword)) {
        score += SCORE_WEIGHTS.title;
    }

    // Tag match — award points for each matching tag
    if (tags && tags.length > 0 && snippet.tags) {
        const snippetTags = snippet.tags.map(t => t.toLowerCase());
        for (const searchTag of tags) {
            if (snippetTags.includes(searchTag.toLowerCase().trim())) {
                score += SCORE_WEIGHTS.tag;
            }
        }
    }

    // Language match
    if (language && snippet.language.toLowerCase() === language.toLowerCase().trim()) {
        score += SCORE_WEIGHTS.language;
    }

    // Description match
    if (lowerKeyword && snippet.description && snippet.description.toLowerCase().includes(lowerKeyword)) {
        score += SCORE_WEIGHTS.description;
    }

    // Code match
    if (lowerKeyword && snippet.code.toLowerCase().includes(lowerKeyword)) {
        score += SCORE_WEIGHTS.code;
    }

    return score;
};

/**
 * GET /api/search
 * Search snippets with scoring.
 *
 * Query params:
 *   q        — keyword to search across title, description, code
 *   language — filter by programming language
 *   tags     — comma-separated list of tags to filter by
 *   page     — page number (default 1)
 *   limit    — results per page (default 20, max 50)
 */
const search = async (req, res) => {
    try {
        const keyword = req.query.q || '';
        const language = req.query.language || '';
        const tagsParam = req.query.tags || '';
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);

        // Require at least one search criterion
        if (!keyword && !language && !tagsParam) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'At least one search parameter is required (q, language, or tags).'
            });
        }

        // Parse tags from comma-separated string
        const tags = tagsParam
            ? tagsParam.split(',').map(t => t.trim()).filter(Boolean)
            : [];

        // Get the requesting user's ID (if authenticated) for visibility rules
        const userId = req.user ? req.user.id : null;

        // Step 1: SQL retrieves candidate results using filters
        const candidates = await getCandidates(keyword, language, tags, userId);

        // Step 2: Scoring is computed in Node.js (per AGENT.md)
        const scored = candidates.map(snippet => ({
            ...snippet,
            _score: computeScore(snippet, keyword, language, tags)
        }));

        // Step 3: Sort by score descending, then by updated_at descending as tiebreaker
        scored.sort((a, b) => {
            if (b._score !== a._score) return b._score - a._score;
            return new Date(b.updated_at) - new Date(a.updated_at);
        });

        // Step 4: Paginate the scored results
        const total = scored.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginated = scored.slice(offset, offset + limit);

        return res.status(200).json({
            success: true,
            data: {
                snippets: paginated,
                total,
                page,
                limit,
                totalPages
            },
            message: `Found ${total} result${total !== 1 ? 's' : ''}.`
        });
    } catch (err) {
        console.error('Search error:', err);
        return res.status(500).json({
            success: false,
            data: null,
            message: 'Internal server error during search.'
        });
    }
};

module.exports = { search };
