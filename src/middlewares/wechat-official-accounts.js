const WechatOfficialAccountManager = require('../models/wechat-official-accounts').default;

export const totalCount = (options = {}) => async (req, res, next) => {
  const db = options.db;
  const success = options.success || ((count, req2, res2, next2) => {
    req2.wechatOfficialAccounts = {
      ...req.wechatOfficialAccounts,
      totalCount: count,
    };
    next2();
  });
  const woam = new WechatOfficialAccountManager(db);
  const count = await woam.count();
  success(count, req, res, next);
};

export default {
  totalCount,
};
