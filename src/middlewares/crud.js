import { sysRoles, info, error } from '../config';

import { ObjectId } from 'mongodb';
import DepartmentManager from '../models/departments';

const defaultGetQuery = req => (req.mongoQuery || {
  query: {},
});

/*
获取当前实体的model对象
*/
const getManager = (options) => {
  const { db, entityManger } = options;
  if (!db || !entityManger) {
    error('crud:totalCount Error: db, entityManger 均不能为空');
    throw new Error('crud:totalCount Error: db, entityManger 均不能为空');
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
  const whereQueryOrFields = options.whereQueryOrFields || [];
  const getQuery = options.getQuery || defaultGetQuery;
  const getCurrentUserId = options.getCurrentUserId || (req2 => req2.user.id);
  const success = options.success || ((count, req2, res2, next2) => {
    req2[dataName] = {
      ...req[dataName],
      totalCount: count,
    };
    next2();
  });
  const manager = getManager(options);
  const queryOptions = getQuery(req);
  const userId = getCurrentUserId(req);

    // 根据用户角色及id进行查询过滤
  const orOptions = whereQueryOrFields.map(field => ({ [field]: userId }));
  const query = queryOptions.query;
  if (orOptions.length) {
    query.$or = orOptions;
  }
  info('totalCount query:', query);
  const count = await manager.count(query);
  success(count, req, res, next);
};

export const list = (options = {
  entityManger: DepartmentManager,
  dataName: 'departments',
  whereQueryOrFields: ['zyfzr.id', 'bmscy.id', 'creation.creator.id'] }) => async (req, res, next) => {
    const db = options.db;
    const whereQueryOrFields = options.whereQueryOrFields || [];
    const getQuery = options.getQuery || defaultGetQuery;
    const getCurrentUserId = options.getCurrentUserId || (req2 => req2.user.id);
    const success = options.success || ((data, req2, res2, next2) => {
      req2[options.dataName] = {
        ...req[options.dataName],
        list: data,
      };
      next2();
    });
    const entityManger = new options.entityManger(db);
    const queryOptions = getQuery(req);
    const userId = getCurrentUserId(req);
    const orOptions = whereQueryOrFields.map(field => ({ [field]: userId }));
    const query = queryOptions.query;
    if (orOptions.length) {
      query.$or = orOptions;
    }
    const data = await entityManger.find({
      ...queryOptions,
      query,
    });
    console.log(JSON.stringify({
      ...queryOptions,
      query: {
        ...queryOptions.query,
        $or: orOptions,
      },
    }));
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

export const getById = (options = {
  entityManger: DepartmentManager,
  dataName: 'departments',
  whereCheckOrFields: [['zyfzr', 'id'], ['bmscy', 'id'], ['creation', 'creator', 'id']] }) => async (req, res, next) => {
    const db = options.db;
    const getId = options.getId || (req2 => req2.params.id);
    const getCurrentUserId = options.getCurrentUserId || (req2 => req2.user.id);
    const success = options.success || ((data, req2, res2) => {
      res2.json(data);
    });
    const fail = options.fail || ((err, req2, res2) => {
      res2.status(403).send('当前用户没有权限');
    });
    const entityManger = new options.entityManger(db);
    const id = new ObjectId(getId(req));
    const userId = getCurrentUserId(req);
    const data = await entityManger.findById(id);
    success(data, req, res, next);
    // const check = checkOrFields(whereCheckOrFields, data, userId);
    // if (data && check) {
    //   success(data, req, res, next);
    // } else fail(new Error('当前用户没有权限'), req, res, next);
  };

export const updateById = (options = {
  entityManger: DepartmentManager,
  dataName: 'departments',
  whereCheckOrFields: [['zyfzr', 'id'], ['bmscy', 'id'], ['creation', 'creator', 'id']] }) => async (req, res, next) => {
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
    const deptm = new options.entityManger(db);
    const _id = new ObjectId(getId(req));
    const userId = getCurrentUserId(req);
    const newData = getData(req);
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

export const deleteById = (options = {
  entityManger: DepartmentManager,
  dataName: 'departments',
  whereCheckOrFields: [['zyfzr', 'id'], ['bmscy', 'id'], ['creation', 'creator', 'id']] }) => async (req, res, next) => {
    const db = options.db;
    const getId = options.getId || (req2 => req2.params.id);
    const getCurrentUserId = options.getCurrentUserId || (req2 => req2.user.id);
    const success = options.success || ((id, req2, res2) => {
      res2.json({ id });
    });
    const fail = options.fail || ((err, req2, res2) => {
      res2.status(403).send('当前用户没有权限');
    });
    const deptm = new options.entityManger(db);
    const id = new ObjectId(getId(req));
    const userId = getCurrentUserId(req);
    const data = await deptm.findById(id);
    const check = checkOrFields(whereCheckOrFields, data, userId);
    if (data && check) {
      await deptm.removeById(id);
      success(id, req, res, next);
    } else fail(new Error('当前用户没有权限'), req, res, next);
  };


export default {
  totalCount,
  list,
};
