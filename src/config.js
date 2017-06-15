import debug from 'debug';

const pkg = require('../package.json');

// debug
export const error = debug(`${pkg.name}:error`);
export const info = debug(`${pkg.name}:info`);

export const port = process.env.PORT || 3000;

export const host = process.env.WEBSITE_HOSTNAME || `localhost:${port}`;

export const cookieKey = process.env.COOKIE_KEY || 'my cookie key';

export const secret = process.env.SECRET || 'secret';

export const mongoUrl = process.env.MONGO_URL;

export const casSecretKey = process.env.YNU_CAS_SECRET_KEY;
