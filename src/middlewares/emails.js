const EmailManager = require('../models/emails').default;

export const totalCount = (options = {}) => async (req, res, next) => {
  const db = options.db;
  const success = options.success || ((count, req2, res2, next2) => {
    req2.emails = {
      ...req.emails,
      totalCount: count,
    };
    next2();
  });
  const emailm = new EmailManager(db);
  const count = await emailm.count();
  success(count, req, res, next);
};

export default {
  totalCount,
};
