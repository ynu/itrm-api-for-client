const { ObjectId } = require('mongodb');
const DepartmentManager = require('../models/departments').default;

export const totalCount = (options = {}) => async (req, res, next) => {
  const db = options.db;
  const getQuery = options.getQuery || (req2 => req2.mongoQuery);
  const getCurrentUserId = options.getCurrentUserId || (req2 => req2.user.id);
  const success = options.success || ((count, req2, res2, next2) => {
    req2.departments = {
      ...req.departments,
      totalCount: count,
    };
    next2();
  });
  const deptm = new DepartmentManager(db);
  const queryOptions = getQuery(req);
  const userId = getCurrentUserId(req);
  const count = await deptm.count({
    ...queryOptions.query,
    $or: [
      { 'zyfzr.id': userId },
      { 'bmscy.id': userId },
      { 'creation.creator.id': userId },
    ],
  });
  success(count, req, res, next);
};

export const list = (options = {}) => async (req, res, next) => {
  const db = options.db;
  const getQuery = options.getQuery || (req2 => req2.mongoQuery);
  const getCurrentUserId = options.getCurrentUserId || (req2 => req2.user.id);
  const success = options.success || ((data, req2, res2, next2) => {
    req2.departments = {
      ...req.departments,
      list: data,
    };
    next2();
  });
  const deptm = new DepartmentManager(db);
  const queryOptions = getQuery(req);
  const userId = getCurrentUserId(req);
  const data = await deptm.find({
    ...queryOptions,
    query: {
      ...queryOptions.query,
      $or: [
      { 'zyfzr.id': userId },
      { 'bmscy.id': userId },
      { 'creation.creator.id': userId },
      ],
    },
  });
  console.log('data', data.length);
  console.log(JSON.stringify({
    ...queryOptions,
    query: {
      ...queryOptions.query,
      $or: [
      { 'zyfzr.id': userId },
      { 'bmscy.id': userId },
      { 'creation.creator.id': userId },
      ],
    },
  }));
  success(data, req, res, next);
};

export const getById = (options = {}) => async (req, res, next) => {
  const db = options.db;
  const getId = options.getId || (req2 => req2.params.id);
  const getCurrentUserId = options.getCurrentUserId || (req2 => req2.user.id);
  const success = options.success || ((data, req2, res2) => {
    res2.json(data);
  });
  const fail = options.fail || ((err, req2, res2) => {
    res2.status(403).send('当前用户没有权限');
  });
  const deptm = new DepartmentManager(db);
  const id = new ObjectId(getId(req));
  const userId = getCurrentUserId(req);
  const data = await deptm.findById(id);
  if (data && (
    data.zyfzr.id === userId ||
    data.bmscy.id === userId ||
    data.creation.creator.id === userId
   )) success(data, req, res, next);
  else fail(new Error('当前用户没有权限'), req, res, next);
};

export const updateById = (options = {}) => async (req, res, next) => {
  const db = options.db;
  const getId = options.getId || (req2 => req2.params.id);
  const getData = options.getData || (req2 => req2.body);
  const getCurrentUserId = options.getCurrentUserId || (req2 => req2.user.id);
  const success = options.success || ((id, req2, res2) => {
    res2.json({ id });
  });
  const fail = options.fail || ((err, req2, res2) => {
    res2.status(403).send('当前用户没有权限');
  });
  const deptm = new DepartmentManager(db);
  const _id = new ObjectId(getId(req));
  const userId = getCurrentUserId(req);
  const newData = getData(req);
  const data = await deptm.findById(_id);
  if (data && (
    data.bmscy.id === userId ||
    data.creation.creator.id === userId
   )) {
    await deptm.updateById({
      ...newData,
      _id,
    });
    success(_id, req, res, next);
  } else fail(new Error('当前用户没有权限'), req, res, next);
};

export const deleteById = (options = {}) => async (req, res, next) => {
  const db = options.db;
  const getId = options.getId || (req2 => req2.params.id);
  const getCurrentUserId = options.getCurrentUserId || (req2 => req2.user.id);
  const success = options.success || ((id, req2, res2) => {
    res2.json({ id });
  });
  const fail = options.fail || ((err, req2, res2) => {
    res2.status(403).send('当前用户没有权限');
  });
  const deptm = new DepartmentManager(db);
  const id = new ObjectId(getId(req));
  const userId = getCurrentUserId(req);
  const data = await deptm.findById(id);
  if (data && (
    data.bmscy.id === userId ||
    data.creation.creator.id === userId
   )) {
    await deptm.removeById(id);
    success(id, req, res, next);
  } else fail(new Error('当前用户没有权限'), req, res, next);
};

// export const create = (options = {}) => (req, res, next) => {
//   const db = options.db;
//   const getData = options.getData || (req2 => req2.newData);
//   const getCurrentUserId = options.getCurrentUserId || (req2 => req2.user.id);
//   const success = options.success || ((insertedId, req2, res2, next2) => {
//     req2.departments = {
//       ...req.departments,
//       insertedId,
//     };
//     next2();
//   });
// };

export default {
  totalCount,
  list,
};
