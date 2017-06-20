const WeiboAccountManager = require('../models/weibo-accounts').default;

export const totalCount = (options = {}) => async (req, res, next) => {
  const db = options.db;
  const success = options.success || ((count, req2, res2, next2) => {
    req2.weiboAccounts = {
      ...req.weiboAccounts,
      totalCount: count,
    };
    next2();
  });
  const weibom = new WeiboAccountManager(db);
  const count = await weibom.count();
  success(count, req, res, next);
};

export default {
  totalCount,
};
