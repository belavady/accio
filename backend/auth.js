const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const JWT_SECRET = process.env.JWT_SECRET || 'accio-dev-secret-change-in-production';
const JWT_EXPIRES = '7d'; // Tokens valid for 7 days

// ═════════════════════════════════════════════════════════════════════════════
// TOKEN GENERATION
// ═════════════════════════════════════════════════════════════════════════════

// Generate a parent token after successful parent login/setup
function generateParentToken(parentId) {
  return jwt.sign(
    { type: 'parent', parentId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

// Generate a child token after successful child PIN login
function generateChildToken(childId, parentId, age, grade) {
  return jwt.sign(
    { type: 'child', childId, parentId, age, grade },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE — AUTH GUARDS
// ═════════════════════════════════════════════════════════════════════════════

// Require a valid parent or child token
function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.auth = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired — please log in again', expired: true });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Require specifically a parent token
function requireParent(req, res, next) {
  requireAuth(req, res, () => {
    if (req.auth.type !== 'parent') {
      return res.status(403).json({ error: 'Parent access required' });
    }
    next();
  });
}

// Require specifically a child token
function requireChild(req, res, next) {
  requireAuth(req, res, () => {
    if (req.auth.type !== 'child') {
      return res.status(403).json({ error: 'Child session required' });
    }
    next();
  });
}

// Require parent token AND verify the parentId in the route matches the token
function requireParentOwnership(req, res, next) {
  requireParent(req, res, () => {
    const routeParentId = req.params.parentId || req.body.parentId;
    if (routeParentId && routeParentId !== req.auth.parentId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  });
}

// Require child token AND verify the childId in the route matches the token
function requireChildOwnership(req, res, next) {
  requireChild(req, res, () => {
    const routeChildId = req.params.childId || req.body.childId;
    if (routeChildId && routeChildId !== req.auth.childId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// RATE LIMITERS
// ═════════════════════════════════════════════════════════════════════════════

// Strict limiter for auth endpoints — prevents brute force on codes and PINs
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 20,                      // 20 attempts per 15 minutes per IP
  message: { error: 'Too many attempts — please wait 15 minutes before trying again' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Standard limiter for all other API endpoints
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max: 120,                     // 120 requests per minute per IP (generous for normal use)
  message: { error: 'Too many requests — please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed requests toward limit
});

// Strict limiter for AI endpoints — prevents bill attacks
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max: 30,                      // 30 AI calls per minute per IP
  message: { error: 'Too many AI requests — please wait a moment' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin endpoint limiter — very strict
const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 10,                      // 10 admin actions per hour per IP
  message: { error: 'Admin rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generateParentToken,
  generateChildToken,
  requireAuth,
  requireParent,
  requireChild,
  requireParentOwnership,
  requireChildOwnership,
  authLimiter,
  apiLimiter,
  aiLimiter,
  adminLimiter,
};
