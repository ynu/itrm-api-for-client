import UsersInRoles from '../models/users-in-roles';

const appId = 'ynu_cas';


/*
检查用户是否在指定的角色组中。
前置中间件：auth.currentUser
*/
export const oneOfRoles = (options = {}) => async (req, res, next) => {
  const { db } = options;
  const getRoles = options.getRoles || (() => ([]));
  const getUserId = options.getUserId || (req2 => req2.user.id);
  const success = options.success || ((roles, req2, res2, next2) => {
    req.user = {
      ...req.user,
      roles,
    };
    next2();
  });
  const fail = options.fail || ((req2, res2) => res2.status(403).send('Forbidden'));

  const userId = getUserId(req, res);
  const roles = getRoles(req);
  const uirm = new UsersInRoles(db);
  const uir = await uirm.userByUserId(appId, userId);
  const isUserInRoles = roles.some(role => uir.roles.some(role2 => (role === role2)));
  if (isUserInRoles) success(uir.roles, req, res, next);
  else fail(req, res, next);
};

export default {
  oneOfRoles,
};
