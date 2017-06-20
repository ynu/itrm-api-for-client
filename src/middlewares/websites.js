const WebsiteManager = require('../models/websites').default;


export const totalCount = (options = {}) => async (req, res, next) => {
  const db = options.db;
  const success = options.success || ((count, req2, res2, next2) => {
    req2.websites = {
      ...req.websites,
      totalCount: count,
    };
    next2();
  });
  const wsm = new WebsiteManager(db);
  const count = await wsm.count();
  success(count, req, res, next);
};

export default {
  totalCount,
};
