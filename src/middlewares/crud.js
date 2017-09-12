import { ObjectId } from 'mongodb';

import { info, error } from '../config';

/*
获取当前实体的model对象
如果options中提供manager参数则直接返回；如果没有则通过 entityManager类和db生成
后期应当尽量使用manager的这种方式
*/
const getManager = (options) => {
  const { db, entityManger, manager } = options;

  // 首先从manager属性中获取
  if (manager) return manager;

  if (!db || !entityManger) {
    error('crud Error: db, entityManger 均不能为空');
    throw new Error('crud Error: db, entityManger 均不能为空');
  }
  return new entityManger(db); // eslint-disable-line
};

/*
中间件Creator，创建用于获取当前资源总数的中间件。
获取的资源总数根据当前用户的权限获取，并不是系统中的所有资源总数。

options参数：
  - db
  - entityManager
  - dataName
*/
export const totalCount = (options = {}) => async (req, res, next) => {
  // 不提供dataName时，统一使用records
  const dataName = options.dataName || 'records';
  const getFilter = options.getFilter || (() => ({}));
  const filter = getFilter(req, res);

  const success = options.success || ((count, req2, res2, next2) => {
    req2[dataName] = {
      ...req2[dataName],
      totalCount: count,
    };
    req2.records = {
      ...req2.records,
      totalCount: count,
    };
    next2();
  });
  const manager = getManager(options);

  info('totalCount filter:', filter);
  const count = await manager.count(filter);
  info('totalCount result:', count);
  success(count, req, res, next);
};

export const list = (options = {}) => async (req, res, next) => {
  // 不提供dataName时，统一使用records
  const dataName = options.dataName || 'records';
  const getQueryOptions = options.getQueryOptions || (() => ({
    query: {},
    skip: 0,
    limit: 100,
  }));
  const success = options.success || ((data, req2, res2, next2) => {
    req2[dataName] = {
      ...req2[dataName],
      list: data,
    };
    req2.records = {
      ...req2.records,
      list: data,
    };
    next2();
  });
  const entityManger = getManager(options);
  const queryOptions = getQueryOptions(req, res);
  const data = await entityManger.find(queryOptions);
  info('crud list query:', queryOptions);
  success(data, req, res, next);
};

export const getById = (options = {}) => async (req, res, next) => {
  const getId = options.getId || (req2 => new ObjectId(req2.params.id));
  const success = options.success || ((data, req2, res2, next2) => {
    req2.records = {
      ...req2.records,
      record: data,
    };
    next2();
  });
  const fail = options.fail || ((err, req2, res2) => {
    res2.status(403).send('当前用户没有权限');
  });
  const entityManger = getManager(options);
  const id = getId(req);
  try {
    const data = await entityManger.findById(id);
    success(data, req, res, next);
  } catch (err) {
    fail(err, req, res, next);
  }
};

export const updateById = (options = {}) => async (req, res, next) => {
  const getId = options.getId || (req2 => (new ObjectId(req2.params.id)));
  const getUpdateExpression = options.getUpdateExpression || (req2 => req2.body);
  const success = options.success || ((id, req2, res2) => {
    res2.json({ id });
  });
  const fail = options.fail || ((err, req2, res2) => {
    res2.status(403).send('当前用户没有权限');
  });
  const deptm = getManager(options);
  try {
    const _id = getId(req);
    const updateExpression = getUpdateExpression(req, res);
    await deptm.updateById({
      ...updateExpression,
      _id,
    });
    success(_id, req, res, next);
  } catch (err) {
    fail(err, req, res, next);
  }
};

export const update = (options = {}) => async (req, res, next) => {
  const getQuery = options.getQuery || (req2 => ({
    _id: new ObjectId(req2.params.id),
  }));
  const getUpdateExpression = options.getUpdateExpression || (req2 => ({
    $set: req2.body,
  }));
  const success = options.success || ((result, req2, res2, next2) => next2());
  const fail = options.fail || ((err, req2, res2) => {
    res2.status(403).send('当前用户没有权限');
  });
  const rm = getManager(options);
  try {
    const query = getQuery(req);
    const updateExpression = getUpdateExpression(req, res);
    const result = await rm.update(query, updateExpression);
    success(result, req, res, next);
  } catch (err) {
    fail(err, req, res, next);
  }
};

export const deleteById = (options = {}) => async (req, res, next) => {
  const getId = options.getId || (req2 => (new ObjectId(req2.params.id)));
  const success = options.success || ((id, req2, res2, next2) => {
    req2.records = {
      deletedId: id,
    };
    next2();
  });
  const fail = options.fail || ((err, req2, res2) => {
    res2.status(500).send(err.message);
  });
  const deptm = getManager(options);
  const id = getId(req);
  try {
    await deptm.removeById(id);
    success(id, req, res, next);
  } catch (err) {
    fail(err, req, res, next);
  }
};

export const insert = (options = {}) => async (req, res, next) => {
  const manager = getManager(options);
  const getData = options.getData || (req2 => req2.body);
  const success = options.success || ((id, req2, res2, next2) => {
    req2.records = {
      ...req2.records,
      insertedId: id,
    };
    next2();
  });
  const data = getData(req, res);
  const id = await manager.insert(data);
  success(id, req, res, next);
};

export default {
  totalCount,
  list,
  update,
};
