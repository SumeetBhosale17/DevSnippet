const pool = require('../config/db');

/**
 * Create a new user in the database.
 */
const createUser = async (username, email, passwordHash) => {
    const [result] = await pool.execute(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, passwordHash]
    );
    return result;
};

/**
 * Find a user by their email address.
 */
const findUserByEmail = async (email) => {
    const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );
    return rows[0] || null;
};

/**
 * Find a user by their username.
 */
const findUserByUsername = async (username) => {
    const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
    );
    return rows[0] || null;
};

/**
 * Find a user by their ID.
 */
const findUserById = async (id) => {
    const [rows] = await pool.execute(
        'SELECT id, username, email, created_at FROM users WHERE id = ?',
        [id]
    );
    return rows[0] || null;
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserByUsername,
    findUserById
};
