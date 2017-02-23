import debug from 'debug';

// debug
export const error = debug('babel-starter-kit:error');
export const info = debug('babel-starter-kit:info');

export const port = process.env.PORT || 3000;
export const host = process.env.WEBSITE_HOSTNAME || `localhost:${port}`;
export const cookieKey = process.env.COOKIE_KEY || 'my cookie key';

export const secret = process.env.SECRET || 'secret';
