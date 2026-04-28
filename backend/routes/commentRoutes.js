const express = require('express');
const router = express.Router({ mergeParams: true }); // Important: mergeParams to access snippetId from parent router
const { getComments, addComment, deleteComment } = require('../controllers/commentController');
const { verifyToken } = require('../middlewares/auth');

// Base path when used inside snippetRoutes: /api/snippets/:id/comments
// When used directly: /api/comments

router.get('/', getComments);
router.post('/', verifyToken, addComment);
router.delete('/:id', verifyToken, deleteComment); // Note: id here is the comment ID, handled differently if mounted on /api/comments

module.exports = router;
