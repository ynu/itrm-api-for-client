import UsersInRoles from '../models/users-in-roles';

const appId = 'ynu_cas';
export const oneOfRoles = (options = {}) => async (req, res, next) => {
  const { db } = options;
  const roles = options.roles || [];
  const getUserId = options.getUserId || (req2 => req2.user.id);
  const success = options.success || ((req2, res2, next2) => next2());
  const fail = options.fail || ((req2, res2) => res2.status(403).send('Forbidden'));

  const userId = getUserId(req, res);
  const uirm = new UsersInRoles(db);
  const uir = await uirm.userByUserId(appId, userId);
  const isUserInRoles = roles.some(role => uir.roles.some(role2 => (role === role2)));
  if (isUserInRoles) success(req, res, next);
  else fail(req, res, next);
};

export default {
  oneOfRoles,
};
