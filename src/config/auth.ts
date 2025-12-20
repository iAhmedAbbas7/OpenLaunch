// <== AUTH CONFIGURATION ==>
export const authConfig = {
  // <== PROVIDERS ==>
  providers: {
    // GITHUB PROVIDER
    github: {
      // ENABLE GITHUB PROVIDER
      enabled: true,
      // GITHUB PROVIDER SCOPES
      scopes: ["read:user", "user:email"],
    },
    // GOOGLE PROVIDER
    google: {
      // ENABLE GOOGLE PROVIDER
      enabled: true,
      // GOOGLE PROVIDER SCOPES
      scopes: ["email", "profile"],
    },
  },
  // <== ROUTES ==>
  routes: {
    // SIGN IN PAGE
    signIn: "/sign-in",
    // SIGN UP PAGE
    signUp: "/sign-up",
    // FORGOT PASSWORD PAGE
    forgotPassword: "/forgot-password",
    // RESET PASSWORD PAGE
    resetPassword: "/reset-password",
    // CALLBACK ROUTE
    callback: "/auth/callback",
    // DEFAULT REDIRECT AFTER LOGIN
    defaultRedirect: "/dashboard",
    // PUBLIC ROUTES (NO AUTH REQUIRED)
    publicRoutes: [
      "/",
      "/explore",
      "/launches",
      "/articles",
      "/leaderboard",
      "/projects",
      "/u",
      "/auth/callback",
    ],
    // AUTH ROUTES (REDIRECT IF LOGGED IN)
    authRoutes: ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"],
  },
  // <== SESSION ==>
  session: {
    // SESSION COOKIE NAME
    cookieName: "sb-auth-token",
    // SESSION MAX AGE (7 DAYS)
    maxAge: 60 * 60 * 24 * 7,
  },
  // <== VALIDATION ==>
  validation: {
    // PASSWORD MINIMUM LENGTH
    passwordMinLength: 8,
    // USERNAME MINIMUM LENGTH
    usernameMinLength: 3,
    // USERNAME MAXIMUM LENGTH
    usernameMaxLength: 30,
    // USERNAME PATTERN (ALPHANUMERIC AND UNDERSCORES)
    usernamePattern: /^[a-zA-Z0-9_]+$/,
  },
} as const;

// <== EXPORTING AUTH CONFIG TYPE ==>
export type AuthConfig = typeof authConfig;
