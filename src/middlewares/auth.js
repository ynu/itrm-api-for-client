import { info, error } from '../config';
import UsersInRoles from '../models/users-in-roles';

/*
获取当前用户的信息。用户未登录时，返回401错误
*/

const appId = 'ynu_cas';
export const currentUser = (options = {}) => async (req, res, next) => {
  const { db } = options;
  // if (!db) {
  //   error('currentUser error:', '必须提供数据库对象');
  //   res.status(500).send('系统API错误，请联系管理员');
  // }
  const success = options.success || ((user, req2, res2, next2) => {
    info('current User:', user);
    req.user = {
      ...req.user,
      ...user,
    };
    next2();
  });
  const fail = options.fail || ((err, req2, res2) => res2.status(401).send(err.message));
  if (req.session.cas && req.session.cas.user) {
    const user = req.session.cas;
    if (db) {
      const uirm = new UsersInRoles(db);
      const roles = await uirm.rolesByUserId(appId, req.session.cas.user);
      user.roles = roles;
    }
    success(user, req, res, next);
  } else fail(new Error('no user logged.'), req, res, next);
};

export default {
  currentUser,
};
