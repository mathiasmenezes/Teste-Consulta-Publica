const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists by social ID
      let user = await prisma.user.findFirst({
        where: {
          socialProvider: 'google',
          socialId: profile.id
        }
      });

      if (!user) {
        // Check if user exists by email
        user = await prisma.user.findUnique({
          where: {
            email: profile.emails[0].value
          }
        });

        if (user) {
          // Update existing user with social login info
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              socialProvider: 'google',
              socialId: profile.id
            }
          });
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              name: profile.displayName,
              socialProvider: 'google',
              socialId: profile.id
            }
          });
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));



// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
