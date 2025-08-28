const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.CORS_ORIGIN}/oauth-callback?token=${token}&provider=google`);
  }
);

// OAuth failure route
router.get('/failure', (req, res) => {
  res.redirect(`${process.env.CORS_ORIGIN}/login?error=oauth_failed`);
});

module.exports = router;
