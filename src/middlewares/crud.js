import { ObjectId } from 'mongodb';

import { info, error } from '../config';
import DepartmentManager from '../models/departments';

/*
获取当前实体的model对象
*/
const getManager = (options) => {
  const { db, entityManger, manager } = options;

  // 首先从manager属性中获取
  if (manager) return manager;

  if (!db || !entityManger) {
    error('crud Error: db, entityManger 均不能为空');
    throw new Error('crud Error: db, entityManger 均不能为空');
  }
  return new entityManger(db);
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

const checkOrFields = (whereCheckOrFields, data, userId) => {
  if (!whereCheckOrFields) {
    return true;
  }
  return whereCheckOrFields.some((entry) => {
    let dataCheck = data;
    entry.forEach((field) => {
      if (dataCheck) {
        dataCheck = dataCheck[field];
      }
    });
    return dataCheck === userId;
  });
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

export const updateById = (options = {
  entityManger: DepartmentManager,
  dataName: 'departments',
  whereCheckOrFields: [['zyfzr', 'id'], ['bmscy', 'id'], ['creation', 'creator', 'id']] }) => async (req, res, next) => {
    const db = options.db;
    const whereCheckOrFields = options.whereCheckOrFields || [];
    const getId = options.getId || (req2 => req2.params.id);
    const getData = options.getData || (req2 => req2.body);
      res2.json({ id });
    });
    const fail = options.fail || ((err, req2, res2) => {
      res2.status(403).send('当前用户没有权限');
    });
    const deptm = new options.entityManger(db);
    const _id = new ObjectId(getId(req));
    const data = await deptm.findById(_id);
    const check = checkOrFields(whereCheckOrFields, data, userId);
    if (data && check) {
      await deptm.updateById({
        ...newData,
        _id,
      });
      success(_id, req, res, next);
    } else fail(new Error('当前用户没有权限'), req, res, next);
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
    success(id, req,res,next);
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
};
