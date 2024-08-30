import jwt from 'jsonwebtoken';

/**
 * Generates a JWT.
 * @param {Object} user - User object containing id and username.
 * @param {string} [expiresIn='1h'] - Token expiration time, e.g., '1h', '2d'. Defaults to '1h'.
 * @returns {string} - The generated JWT.
 * @throws {Error} - Throws an error if JWT_SECRET is not defined.
 */
export const generateToken = (user, expiresIn = '1h') => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign(
        {
            user_id: user.user_id,
            username: user.username
        },
        secret,
        { expiresIn }
    );
};
