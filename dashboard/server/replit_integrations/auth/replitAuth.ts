import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";

const ALLOWED_DOMAINS = ["yalo.com", "yalocontractor.com"];

function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "/api/callback",
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || null;

          if (!isAllowedEmail(email)) {
            return done(null, false, { message: "Access restricted to Yalo team members only." });
          }

          const user = await authStorage.upsertUser({
            id: profile.id,
            email,
            firstName: profile.name?.givenName || null,
            lastName: profile.name?.familyName || null,
            profileImageUrl: profile.photos?.[0]?.value || null,
          });

          return done(null, user);
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );

  passport.serializeUser((user: any, cb) => cb(null, user.id));
  passport.deserializeUser(async (id: string, cb) => {
    try {
      const user = await authStorage.getUser(id);
      cb(null, user || null);
    } catch (err) {
      cb(err);
    }
  });

  const ALLOWED_HOSTS = [
    process.env.REPL_SLUG ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER?.toLowerCase()}.repl.co` : null,
    process.env.REPLIT_DEV_DOMAIN || null,
    process.env.APP_BASE_URL ? new URL(process.env.APP_BASE_URL).host : null,
    'yaloflowskpidata.replit.app',
  ].filter(Boolean) as string[];

  function getCallbackURL(req: any): string {
    const host = req.get("host");
    if (ALLOWED_HOSTS.length > 0 && !ALLOWED_HOSTS.includes(host)) {
      const canonical = process.env.APP_BASE_URL || `https://${ALLOWED_HOSTS[0]}`;
      return `${canonical}/api/callback`;
    }
    return `https://${host}/api/callback`;
  }

  app.get("/api/login", (req, res, next) => {
    const callbackURL = getCallbackURL(req);
    passport.authenticate("google", {
      scope: ["profile", "email"],
      hd: "yalo.com",
      prompt: "select_account",
      callbackURL,
    } as any)(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    const callbackURL = getCallbackURL(req);
    passport.authenticate("google", {
      failureRedirect: "/?error=unauthorized",
      callbackURL,
    } as any)(req, res, () => {
      res.redirect("/");
    });
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
