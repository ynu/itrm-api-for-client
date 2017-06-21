import { sysRoles, info } from '../config';

const { ObjectId } = require('mongodb');
const DepartmentManager = require('../models/departments').default;

const defaultGetQuery = req => (req.mongoQuery || {
  query: {},
});

export const totalCount = (options = {
  entityManger: DepartmentManager,
  dataName: 'departments',
  whereQueryOrFields: [] }) => async (req, res, next) => {
    const db = options.db;
    const whereQueryOrFields = options.whereQueryOrFields || [];
    const getQuery = options.getQuery || defaultGetQuery;
    const getCurrentUserId = options.getCurrentUserId || (req2 => req2.user.id);
    const success = options.success || ((count, req2, res2, next2) => {
      req2[options.dataName] = {
        ...req[options.dataName],
        totalCount: count,
      };
      next2();
    });
    const entityManger = new options.entityManger(db);
    const queryOptions = getQuery(req);
    const userId = getCurrentUserId(req);

    // 根据用户角色及id进行查询过滤
    const orOptions = whereQueryOrFields.map(field => ({ [field]: userId }));
    const query = queryOptions.query;
    if (orOptions.length) {
      query.$or = orOptions;
    }
    info('totalCount query:', query);
    const count = await entityManger.count(query);
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

const checkOrFields = whereCheckOrFields => whereCheckOrFields.some((entry) => {
  let dataCheck = data;
  entry.forEach((field) => {
    if (dataCheck) {
      dataCheck = dataCheck[field];
    }
  });
  return dataCheck === userId;
});

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
    const check = checkOrFields(options.whereCheckOrFields);
    if (data && check) {
      success(data, req, res, next);
    } else fail(new Error('当前用户没有权限'), req, res, next);
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
    const check = checkOrFields(options.whereCheckOrFields);
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
    const check = checkOrFields(options.whereCheckOrFields);
    if (data && check) {
      await deptm.removeById(id);
      success(id, req, res, next);
    } else fail(new Error('当前用户没有权限'), req, res, next);
  };


export default {
  totalCount,
  list,
};
