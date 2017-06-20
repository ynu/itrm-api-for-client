import { info } from '../config';

export const currentUser = (options = {}) => (req, res, next) => {
  const success = options.success || ((id, req2, res2, next2) => {
    req.user = {
      ...req.user,
      id,
    };
    next2();
  });
  const fail = options.fail || ((err, req2, res2) => res2.status(401).send(err.message));
  info('current user: session', req.session.cas);
  if (req.session.cas && req.session.cas.user) success(req.session.cas.user, req, res, next);
  else fail(new Error('no user logged.'), req, res, next);
};

export default {
  currentUser,
};
