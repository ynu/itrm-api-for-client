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

// export const list = (options = {}) => async (req, res, next) => {
//   const db = options.db;
//   const getQuery = options.getQuery || (req2 => req2.mongoQuery);
//   const getCurrentUserId = options.getCurrentUserId || (req2 => req2.user.id);
//   const success = options.success || ((list, req2, res2, next2) => {
//     req2.departments = {
//       ...req.departments,
//       list,
//     };
//     next2();
//   });
//   const wsm = new WebsiteManager(db);
//   const query = getQuery(req);
//   const userId = getCurrentUserId(req);
//   const list = await wsm.find({
//     query: {
//       ...query,
//       $or: [
//         { 'zyfzr.id': userId },
//         { 'bmscy.id': userId },
//       ],
//     },
//   });
//   success(list, req, res, next);
// };

export default {
  totalCount,
};
