const pool = require('../config/db');

/**
 * Retrieve candidate snippets from the database using SQL filters.
 * Scoring is NOT done here — only candidate retrieval.
 *
 * Filters:
 *   - keyword: broad LIKE match across title, description, code
 *   - language: exact match
 *   - tags: array of tag names (snippets must have at least one matching tag)
 *   - visibility: only public snippets unless the requesting user owns them
 *
 * Returns raw candidate rows with their tags for the scoring engine.
 */
const getCandidates = async (keyword, language, tags, userId) => {
    let query = `
        SELECT DISTINCT s.*, u.username AS author
        FROM snippets s
        JOIN users u ON s.user_id = u.id
    `;

    const conditions = [];
    const params = [];

    // If filtering by tags, join through the junction table
    if (tags && tags.length > 0) {
        query += `
            JOIN snippet_tags st ON s.id = st.snippet_id
            JOIN tags t ON st.tag_id = t.id
        `;
        const placeholders = tags.map(() => '?').join(', ');
        conditions.push(`t.name IN (${placeholders})`);
        params.push(...tags.map(t => t.toLowerCase().trim()));
    }

    // Visibility: show public snippets + the requesting user's private ones
    if (userId) {
        conditions.push(`(s.visibility = 'public' OR s.user_id = ?)`);
        params.push(userId);
    } else {
        conditions.push(`s.visibility = 'public'`);
    }

    // Language filter (exact match)
    if (language) {
        conditions.push(`s.language = ?`);
        params.push(language.toLowerCase().trim());
    }

    // Keyword filter: broad LIKE across title, description, and code
    if (keyword) {
        conditions.push(`(s.title LIKE ? OR s.description LIKE ? OR s.code LIKE ?)`);
        const likeKeyword = `%${keyword}%`;
        params.push(likeKeyword, likeKeyword, likeKeyword);
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Retrieve a generous set of candidates — scoring + pagination happens in Node.js
    query += ` LIMIT 200`;

    const [rows] = await pool.execute(query, params);

    // Attach tags to each candidate
    for (const snippet of rows) {
        const [tagRows] = await pool.execute(
            `SELECT t.name FROM tags t
             JOIN snippet_tags st ON t.id = st.tag_id
             WHERE st.snippet_id = ?`,
            [snippet.id]
        );
        snippet.tags = tagRows.map(t => t.name);
    }

    return rows;
};

module.exports = { getCandidates };
