export const ENVIRONMENT = process.env.ENVIRONMENT || 'dev'; // 'dev' | 'test' | 'prod'

// 3000 is standard for node apps
// Once deployed, Heroku will supply this var to your app
export const PORT = parseInt(process.env.PORT) || 3000;
const DATABASE_USER = process.env.DATABASE_USER || 'postgres';
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || 'dbpassword';
const DATABASE_PORT = process.env.DATABASE_PORT || '5432';
const DATABASE_NAME = process.env.DATABASE_NAME || 'memorize_facts_backend_data';

// Postgres DB URL
// One the app is deployed to Heroku, this var will be supplied by the Postgres addon
export const DATABASE_URL =
  process.env.DATABASE_URL ||
  (() => {
    if (ENVIRONMENT === 'test') {
      const DATABASE_URL = `postgres://${DATABASE_USER}:${DATABASE_PASSWORD}@localhost:${DATABASE_PORT}/memorize_facts_backend_test`;
      process.env.DATABASE_URL = DATABASE_URL;
      return DATABASE_URL;
    } else {
      return `postgres://${DATABASE_USER}:${DATABASE_PASSWORD}@localhost:${DATABASE_PORT}/${DATABASE_NAME}`;
    }
  })();

// Default to 30 days
export const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE) || 60 * 60 * 24 * 30;

export const SESSION_SECRET = (() => {
  if (ENVIRONMENT === 'dev' || ENVIRONMENT === 'test') {
    // We can use hard-coded value for local development and for testing
    return '-- ONLY FOR LOCAL DEV AND TESTING; CHANGE ME IN PRODUCTION TO VARIABLE--';
  } else {
    // If the environment doesn't supply a value, default the secret to a secure random string
    // This will cause all cookies to be invalidated with each app restart (annoying but better than having a hardcoded default)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('crypto')
      .randomBytes(32)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]+/g, '');
  }
})();
