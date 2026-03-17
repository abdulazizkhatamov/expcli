import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

// Configure your strategy here.
// See https://www.passportjs.org/concepts/authentication/strategies/
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // TODO: replace with real user lookup and password verification
      if (username === 'admin' && password === 'secret') {
        return done(null, { id: '1', username });
      }
      return done(null, false, { message: 'Invalid credentials' });
    } catch (err) {
      return done(err);
    }
  }),
);

export { passport };
