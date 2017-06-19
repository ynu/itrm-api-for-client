/*
EntityManager 类，用于生成一个通用的管理Entity的类。
 */
/*
eslint-disable no-console
 */
const { useCollection } = require('mongo-use-collection'); // eslint-disable-line import/no-unresolved
// import { ObjectId } from 'mongodb';
const { Db } = require('mongodb');

const { error, info } = require('./config');

export default class EntityManager {
  /**
   * 构造函数
   * @param  {String} collectionName Entity使用的集合的名称
   * @param  {String} urlOrDb       所使用的数据库的连接字符串或数据库对象
   */
  constructor(urlOrDb, collectionName) {
    this.collectionName = collectionName;
    // this.mongoUrl = mongoUrl;
    this.useEntity = cb => useCollection(urlOrDb, collectionName, cb);
  }

  /**
   *
   * 插入实体对象到数据库中
   * @param  {Object} entityData 实体对象数据
   * @return {Promise}            操作结果
   */
  insert(entityData) {
    if (!entityData) Promise.reject('entityData 不能为空');
    return new Promise((resolve, reject) => this.useEntity(async (col) => {
      let result;
      try {
        result = await col.insertOne(entityData);
        resolve(result.insertedId);
      } catch (e) {
        error('EntityManager Error: ', e); // eslint-disable-line no-console
        reject(e);
      }
    }));
  }

/**
 * 查询实体对象
 * @param  {Object} query =             {}  查询条件
 * @param  {Number} limit =             100 查询结果限制
 * @param  {number} skip  =             0   跳过开头的结果
 * @return {Promise}       操作结果
 */
  find(options) {
    const { query, limit, skip, sort } = {
      query: {},
      limit: 100,
      skip: 0,
      sort: { _id: 1 },
      ...options,
    };
    return new Promise((resolve, reject) => this.useEntity(async (col) => {
      let result;
      try {
        info(`[EntityManager find][${col.collectionName}]query::`, JSON.stringify(query));
        const cursor = col.find(query).sort(sort).skip(skip).limit(limit);
        result = await cursor.toArray();
        info('[EntityManager find]', col.collectionName, '::result.length::', result.length);
        resolve(result);
      } catch (e) {
        error('[EntityManager find]Error: ', e); // eslint-disable-line no-console
        reject(e);
      }
    }));
  }

  count(query = {}) {
    info('[EntityManager count]query::', JSON.stringify(query));
    return new Promise((resolve, reject) => this.useEntity(async (col) => {
      try {
        const result = await col.count(query);
        info('[EntityManager count]result::', result);
        resolve(result);
      } catch (e) {
        error('[EntityManager count]Error: ', e); // eslint-disable-line no-console
        reject(e);
      }
    }));
  }

  findOne(query = {}) {
    return new Promise((resolve, reject) => this.useEntity(async (col) => {
      try {
        const result = await col.findOne(query);
        resolve(result);
      } catch (e) {
        error('[EntityManager findOne]Error: ', e); // eslint-disable-line no-console
        reject(e);
      }
    }));
  }

  findById(_id) {
    return this.findOne({ _id });
  }

  removeById(_id) {
    return new Promise((resolve, reject) => this.useEntity(async (col) => {
      try {
        await col.remove({ _id }, { single: true });
        resolve();
      } catch (e) {
        error('[EntityManager findById]Error: ', e); // eslint-disable-line no-console
        reject(e);
      }
    }));
  }

  updateById({ _id, ...other }) {
    return this.update({ _id }, { $set: other });
  }

  update(condition, updateQuery, options = {}) {
    return new Promise((resolve, reject) => this.useEntity(async (col) => {
      try {
        const result = await col.update(condition, updateQuery, options);
        resolve(result);
      } catch (e) {
        reject({
          e,
          condition,
          updateQuery,
          options,
        });
      }
    }));
  }

  mapReduce(map, reduce, options) {
    return new Promise((resolve, reject) => this.useEntity(async (col) => {
      try {
        const result = await col.mapReduce(map, reduce, options);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    }));
  }
}
