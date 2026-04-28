const pool = require('../config/db');

exports.getComments = async (req, res, next) => {
    try {
        const { id: snippetId } = req.params;

        const [comments] = await pool.execute(`
            SELECT c.id, c.content, c.created_at, u.username 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.snippet_id = ?
            ORDER BY c.created_at ASC
        `, [snippetId]);

        res.json({ success: true, data: comments, message: 'Comments fetched successfully' });
    } catch (error) {
        next(error);
    }
};

exports.addComment = async (req, res, next) => {
    try {
        const { id: snippetId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content) {
            return res.status(400).json({ success: false, data: null, message: 'Comment content is required' });
        }

        const [result] = await pool.execute(
            'INSERT INTO comments (snippet_id, user_id, content) VALUES (?, ?, ?)',
            [snippetId, userId, content]
        );

        // Fetch the newly created comment with username
        const [newComment] = await pool.execute(`
            SELECT c.id, c.content, c.created_at, u.username 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `, [result.insertId]);

        res.status(201).json({ success: true, data: newComment[0], message: 'Comment added successfully' });
    } catch (error) {
        next(error);
    }
};

exports.deleteComment = async (req, res, next) => {
    try {
        const { id: commentId } = req.params;
        const userId = req.user.id;

        // Check if comment exists and belongs to user
        const [comment] = await pool.execute('SELECT user_id FROM comments WHERE id = ?', [commentId]);

        if (comment.length === 0) {
            return res.status(404).json({ success: false, data: null, message: 'Comment not found' });
        }

        if (comment[0].user_id !== userId) {
            return res.status(403).json({ success: false, data: null, message: 'Unauthorized to delete this comment' });
        }

        await pool.execute('DELETE FROM comments WHERE id = ?', [commentId]);

        res.json({ success: true, data: null, message: 'Comment deleted successfully' });
    } catch (error) {
        next(error);
    }
};
