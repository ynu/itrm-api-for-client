const DepartmentManager = require('../models/departments').default;


export const totalCount = (options = {}) => async (req, res, next) => {
  const db = options.db;
  const success = options.success || ((count, req2, res2, next2) => {
    req2.departments = {
      ...req.departments,
      totalCount: count,
    };
    next2();
  });
  const deptm = new DepartmentManager(db);
  const count = await deptm.count();
  success(count, req, res, next);
};

export default {
  totalCount,
};
