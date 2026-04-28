const {
    createSnippet,
    getSnippetById,
    getSnippetsByUser,
    getPublicSnippets,
    updateSnippet,
    deleteSnippet
} = require('../models/snippetModel');

/**
 * POST /api/snippets
 * Create a new snippet. Requires authentication.
 */
const create = async (req, res) => {
    try {
        const { title, code, language, description, visibility, tags } = req.body;
        const userId = req.user.id;

        // --- Validation (per AGENT.md rules) ---
        if (!title || !code || !language) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Title, code, and language are required.'
            });
        }

        if (title.length > 100) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Title must be 100 characters or fewer.'
            });
        }

        if (code.length > 20000) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Code must be 20,000 characters or fewer.'
            });
        }

        const validVisibility = ['public', 'private'];
        const snippetVisibility = validVisibility.includes(visibility) ? visibility : 'private';

        const result = await createSnippet(
            userId, title, code, language,
            description || '', snippetVisibility,
            Array.isArray(tags) ? tags : []
        );

        // Fetch the complete snippet to return
        const snippet = await getSnippetById(result.id);

        return res.status(201).json({
            success: true,
            data: snippet,
            message: 'Snippet created successfully.'
        });
    } catch (err) {
        console.error('Create snippet error:', err);
        return res.status(500).json({
            success: false,
            data: null,
            message: 'Internal server error while creating snippet.'
        });
    }
};

/**
 * GET /api/snippets
 * Get paginated snippets. If authenticated, returns user's own snippets.
 * Query params: ?page=1&limit=10
 */
const getAll = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Cap at 50

        let result;
        if (req.user) {
            result = await getSnippetsByUser(req.user.id, page, limit);
        } else {
            result = await getPublicSnippets(page, limit);
        }

        return res.status(200).json({
            success: true,
            data: result,
            message: 'Snippets retrieved successfully.'
        });
    } catch (err) {
        console.error('Get snippets error:', err);
        return res.status(500).json({
            success: false,
            data: null,
            message: 'Internal server error while fetching snippets.'
        });
    }
};

/**
 * GET /api/snippets/public
 * Get paginated public snippets (no auth required).
 * Query params: ?page=1&limit=10
 */
const getPublic = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);

        const result = await getPublicSnippets(page, limit);

        return res.status(200).json({
            success: true,
            data: result,
            message: 'Public snippets retrieved successfully.'
        });
    } catch (err) {
        console.error('Get public snippets error:', err);
        return res.status(500).json({
            success: false,
            data: null,
            message: 'Internal server error while fetching public snippets.'
        });
    }
};

/**
 * GET /api/snippets/:id
 * Get a single snippet by ID. Enforces visibility rules.
 */
const getOne = async (req, res) => {
    try {
        const snippetId = req.params.id;
        const snippet = await getSnippetById(snippetId);

        if (!snippet) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Snippet not found.'
            });
        }

        // Visibility check
        let hasAccess = false;

        if (snippet.visibility === 'public') {
            hasAccess = true;
        } else {
            // It's private (or shared enum from legacy)
            if (req.user && req.user.id === snippet.user_id) {
                hasAccess = true; // Owner
            } else if (req.query.token && req.query.token === snippet.share_token) {
                hasAccess = true; // Link token match
            } else if (req.user) {
                // Check explicit share
                const pool = require('../config/db');
                const [shareRows] = await pool.execute(
                    'SELECT 1 FROM snippet_shares WHERE snippet_id = ? AND user_id = ?',
                    [snippetId, req.user.id]
                );
                if (shareRows.length > 0) hasAccess = true;
            }
        }

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                data: null,
                message: 'Access denied. You do not have permission to view this snippet.'
            });
        }

        return res.status(200).json({
            success: true,
            data: snippet,
            message: 'Snippet retrieved successfully.'
        });
    } catch (err) {
        console.error('Get snippet error:', err);
        return res.status(500).json({
            success: false,
            data: null,
            message: 'Internal server error while fetching snippet.'
        });
    }
};

/**
 * PUT /api/snippets/:id
 * Update a snippet. Only the owner can edit.
 */
const update = async (req, res) => {
    try {
        const snippetId = req.params.id;
        const userId = req.user.id;

        // Check existence and ownership
        const existing = await getSnippetById(snippetId);
        if (!existing) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Snippet not found.'
            });
        }

        if (existing.user_id !== userId) {
            return res.status(403).json({
                success: false,
                data: null,
                message: 'Access denied. Only the owner can edit this snippet.'
            });
        }

        const { title, code, language, description, visibility, tags } = req.body;

        // Validation
        if (!title || !code || !language) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Title, code, and language are required.'
            });
        }

        if (title.length > 100) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Title must be 100 characters or fewer.'
            });
        }

        if (code.length > 20000) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Code must be 20,000 characters or fewer.'
            });
        }

        const validVisibility = ['public', 'private'];
        const snippetVisibility = validVisibility.includes(visibility) ? visibility : existing.visibility;

        await updateSnippet(
            snippetId, title, code, language,
            description || '', snippetVisibility,
            Array.isArray(tags) ? tags : []
        );

        const updated = await getSnippetById(snippetId);

        return res.status(200).json({
            success: true,
            data: updated,
            message: 'Snippet updated successfully.'
        });
    } catch (err) {
        console.error('Update snippet error:', err);
        return res.status(500).json({
            success: false,
            data: null,
            message: 'Internal server error while updating snippet.'
        });
    }
};

/**
 * DELETE /api/snippets/:id
 * Delete a snippet. Only the owner can delete.
 */
const remove = async (req, res) => {
    try {
        const snippetId = req.params.id;
        const userId = req.user.id;

        // Check existence and ownership
        const existing = await getSnippetById(snippetId);
        if (!existing) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Snippet not found.'
            });
        }

        if (existing.user_id !== userId) {
            return res.status(403).json({
                success: false,
                data: null,
                message: 'Access denied. Only the owner can delete this snippet.'
            });
        }

        await deleteSnippet(snippetId);

        return res.status(200).json({
            success: true,
            data: null,
            message: 'Snippet deleted successfully.'
        });
    } catch (err) {
        console.error('Delete snippet error:', err);
        return res.status(500).json({
            success: false,
            data: null,
            message: 'Internal server error while deleting snippet.'
        });
    }
};

/**
 * POST /api/snippets/:id/share/link
 * Generate a share link token for a snippet.
 */
const generateShareLink = async (req, res) => {
    try {
        const snippetId = req.params.id;
        const userId = req.user.id;
        const pool = require('../config/db');

        const existing = await getSnippetById(snippetId);
        if (!existing || existing.user_id !== userId) {
            return res.status(403).json({ success: false, data: null, message: 'Access denied' });
        }

        const crypto = require('crypto');
        const token = crypto.randomBytes(16).toString('hex');

        await pool.execute(
            'UPDATE snippets SET share_token = ? WHERE id = ?',
            [token, snippetId]
        );

        return res.status(200).json({ success: true, data: { token }, message: 'Share link generated' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, data: null, message: 'Server error' });
    }
};

/**
 * POST /api/snippets/:id/share/user
 * Share snippet with a specific user by username or email
 */
const shareWithUser = async (req, res) => {
    try {
        const snippetId = req.params.id;
        const userId = req.user.id;
        const { targetUser } = req.body; // email or username
        const pool = require('../config/db');

        const existing = await getSnippetById(snippetId);
        if (!existing || existing.user_id !== userId) {
            return res.status(403).json({ success: false, data: null, message: 'Access denied' });
        }

        // Find target user
        const [users] = await pool.execute(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [targetUser, targetUser]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, data: null, message: 'User not found' });
        }

        const targetUserId = users[0].id;

        // Note: No longer forcing visibility to 'shared', leaving it as is.

        await pool.execute(
            'INSERT IGNORE INTO snippet_shares (snippet_id, user_id) VALUES (?, ?)',
            [snippetId, targetUserId]
        );

        return res.status(200).json({ success: true, data: null, message: 'Snippet shared with user' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, data: null, message: 'Server error' });
    }
};

/**
 * POST /api/snippets/:id/summarize
 * Generate an AI summary for a snippet.
 */
const generateSummary = async (req, res) => {
    try {
        const snippetId = req.params.id;
        const userId = req.user.id;
        const pool = require('../config/db');
        const { summarizeSnippet } = require('../services/llmService');

        const existing = await getSnippetById(snippetId);
        if (!existing || existing.user_id !== userId) {
            return res.status(403).json({ success: false, data: null, message: 'Access denied. Only the owner can summarize.' });
        }

        // If a summary already exists in the DB, just return it without calling Gemini
        if (existing.ai_summary) {
            return res.status(200).json({ success: true, data: { summary: existing.ai_summary }, message: 'Summary loaded from database' });
        }

        const summary = await summarizeSnippet(existing.code, existing.language);

        await pool.execute(
            'UPDATE snippets SET ai_summary = ? WHERE id = ?',
            [summary, snippetId]
        );

        return res.status(200).json({ success: true, data: { summary }, message: 'Summary generated' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, data: null, message: err.message || 'Server error' });
    }
};

module.exports = { create, getAll, getPublic, getOne, update, remove, generateShareLink, shareWithUser, generateSummary };
