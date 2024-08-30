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


/**
 * Middleware to authenticate JWT tokens.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (token == null) return res.sendStatus(401); // No token provided

    const secret = process.env.JWT_SECRET;

    if (!secret) return res.sendStatus(500); // Server error if secret is not defined

    jwt.verify(token, secret, (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token

        req.user = user; // Attach user to the request object
        next(); // Proceed to the next middleware or route handler
    });
};