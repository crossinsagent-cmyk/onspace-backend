import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const SECRET = process.env.JWT_SECRET || 'devsecret';

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing auth token' });
  const token = auth.split(' ')[1];
  try {
    const data = jwt.verify(token, SECRET);
    req.user = data;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

export function makeToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}
