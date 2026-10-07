import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <TOKEN>"

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Authentication token required.' });
  }

  const secret = process.env.JWT_SECRET || 'daycraft_super_secret_jwt_key_2026_change_in_production';

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired session. Please log in again.' });
    }
    req.user = user;
    next();
  });
}
