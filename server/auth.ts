import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import { Express } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export function setupAuth(app: Express) {
  const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL || '';

  // Serialize user ID into session
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  // Deserialize user from session
  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  // Configure Google OAuth Strategy for admin
  passport.use('google',
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: process.env.CALLBACK_URL || 'http://localhost:5000/oauth2callback',
      },
      (accessToken, refreshToken, profile, done) => {
        // Check if the email matches the allowed email
        const email = profile.emails?.[0]?.value;
        
        if (email !== ALLOWED_EMAIL) {
          return done(null, false, { message: 'Unauthorized email' });
        }
        
        const user = {
          id: profile.id,
          name: profile.displayName || email?.split('@')[0] || 'Admin',
          email,
          role: 'admin' as const
        };
        
        return done(null, user);
      }
    )
  );

  // Configure Local Strategy for admin email/password
  passport.use('admin-local',
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {
        try {
          const [user] = await db.select().from(users).where(eq(users.username, email));
          if (!user || user.role !== 'admin' || user.password !== password) {
            return done(null, false, { message: 'Invalid credentials' });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth routes
  app.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get(
    '/oauth2callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/');
    }
  );

  // Logout route
  app.get('/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.redirect('/');
    });
  });

  // Check auth status
  app.get('/auth/status', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ authenticated: true, user: req.user });
    } else {
      res.json({ authenticated: false });
    }
  });

  // Admin email/password login
  app.post('/auth/admin/login', passport.authenticate('admin-local'), (req, res) => {
    res.json({ success: true, user: req.user });
  });

  // Tailor user code login
  app.post('/auth/tailor/login', async (req, res) => {
    try {
      const { userCode } = req.body;
      if (!userCode) {
        return res.status(400).json({ error: 'User code is required' });
      }

      // Find user by code
      const [user] = await db.select().from(users).where(eq(users.userCode, userCode));
      if (!user || user.role !== 'tailor') {
        return res.status(401).json({ error: 'Invalid user code' });
      }

      // Log user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Login failed' });
        }
        res.json({ success: true, user });
      });
    } catch (error: any) {
      console.error('Tailor login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  });
}

// Middleware to protect routes
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}
