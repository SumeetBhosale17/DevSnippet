const pool = require('../config/db');

/**
 * Create a new snippet and associate tags.
 * Uses a transaction to ensure snippet + tag associations are atomic.
 */
const createSnippet = async (userId, title, code, language, description, visibility, tags = []) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insert the snippet
        const [snippetResult] = await connection.execute(
            `INSERT INTO snippets (user_id, title, code, language, description, visibility)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, title, code, language, description, visibility]
        );
        const snippetId = snippetResult.insertId;

        // Process tags
        if (tags.length > 0) {
            for (const tagName of tags) {
                // Upsert tag: insert if not exists
                await connection.execute(
                    'INSERT IGNORE INTO tags (name) VALUES (?)',
                    [tagName.toLowerCase().trim()]
                );

                // Get the tag id
                const [tagRows] = await connection.execute(
                    'SELECT id FROM tags WHERE name = ?',
                    [tagName.toLowerCase().trim()]
                );

                if (tagRows.length > 0) {
                    await connection.execute(
                        'INSERT INTO snippet_tags (snippet_id, tag_id) VALUES (?, ?)',
                        [snippetId, tagRows[0].id]
                    );
                }
            }
        }

        await connection.commit();
        return { id: snippetId };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

/**
 * Get a single snippet by ID, including its tags.
 */
const getSnippetById = async (snippetId) => {
    const [rows] = await pool.execute(
        `SELECT s.*, u.username AS author
         FROM snippets s
         JOIN users u ON s.user_id = u.id
         WHERE s.id = ?`,
        [snippetId]
    );

    if (rows.length === 0) return null;

    const snippet = rows[0];

    // Fetch associated tags
    const [tagRows] = await pool.execute(
        `SELECT t.name FROM tags t
         JOIN snippet_tags st ON t.id = st.tag_id
         WHERE st.snippet_id = ?`,
        [snippetId]
    );
    snippet.tags = tagRows.map(t => t.name);

    return snippet;
};

/**
 * Get paginated snippets for a specific user (all their snippets).
 */
const getSnippetsByUser = async (userId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
        `SELECT s.*, u.username AS author
         FROM snippets s
         JOIN users u ON s.user_id = u.id
         WHERE s.user_id = ?
         ORDER BY s.updated_at DESC
         LIMIT ? OFFSET ?`,
        [userId, String(limit), String(offset)]
    );

    // Fetch tags for each snippet
    for (const snippet of rows) {
        const [tagRows] = await pool.execute(
            `SELECT t.name FROM tags t
             JOIN snippet_tags st ON t.id = st.tag_id
             WHERE st.snippet_id = ?`,
            [snippet.id]
        );
        snippet.tags = tagRows.map(t => t.name);
    }

    // Get total count for pagination metadata
    const [countRows] = await pool.execute(
        'SELECT COUNT(*) AS total FROM snippets WHERE user_id = ?',
        [userId]
    );

    return {
        snippets: rows,
        total: countRows[0].total,
        page,
        limit,
        totalPages: Math.ceil(countRows[0].total / limit)
    };
};

/**
 * Get paginated public snippets (visible to everyone).
 */
const getPublicSnippets = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
        `SELECT s.*, u.username AS author
         FROM snippets s
         JOIN users u ON s.user_id = u.id
         WHERE s.visibility = 'public'
         ORDER BY s.updated_at DESC
         LIMIT ? OFFSET ?`,
        [String(limit), String(offset)]
    );

    for (const snippet of rows) {
        const [tagRows] = await pool.execute(
            `SELECT t.name FROM tags t
             JOIN snippet_tags st ON t.id = st.tag_id
             WHERE st.snippet_id = ?`,
            [snippet.id]
        );
        snippet.tags = tagRows.map(t => t.name);
    }

    const [countRows] = await pool.execute(
        "SELECT COUNT(*) AS total FROM snippets WHERE visibility = 'public'"
    );

    return {
        snippets: rows,
        total: countRows[0].total,
        page,
        limit,
        totalPages: Math.ceil(countRows[0].total / limit)
    };
};

/**
 * Update a snippet and its tags.
 */
const updateSnippet = async (snippetId, title, code, language, description, visibility, tags = []) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.execute(
            `UPDATE snippets
             SET title = ?, code = ?, language = ?, description = ?, visibility = ?
             WHERE id = ?`,
            [title, code, language, description, visibility, snippetId]
        );

        // Clear existing tag associations
        await connection.execute(
            'DELETE FROM snippet_tags WHERE snippet_id = ?',
            [snippetId]
        );

        // Re-associate tags
        if (tags.length > 0) {
            for (const tagName of tags) {
                await connection.execute(
                    'INSERT IGNORE INTO tags (name) VALUES (?)',
                    [tagName.toLowerCase().trim()]
                );

                const [tagRows] = await connection.execute(
                    'SELECT id FROM tags WHERE name = ?',
                    [tagName.toLowerCase().trim()]
                );

                if (tagRows.length > 0) {
                    await connection.execute(
                        'INSERT INTO snippet_tags (snippet_id, tag_id) VALUES (?, ?)',
                        [snippetId, tagRows[0].id]
                    );
                }
            }
        }

        await connection.commit();
        return true;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

/**
 * Delete a snippet by ID.
 */
const deleteSnippet = async (snippetId) => {
    const [result] = await pool.execute(
        'DELETE FROM snippets WHERE id = ?',
        [snippetId]
    );
    return result.affectedRows > 0;
};

module.exports = {
    createSnippet,
    getSnippetById,
    getSnippetsByUser,
    getPublicSnippets,
    updateSnippet,
    deleteSnippet
};
