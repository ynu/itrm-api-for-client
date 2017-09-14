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
添加审核记录
options参数：
  - getId 获取资源Id，默认由req.params.id获取
  - getAuditLog 获取审核数据
  - manager 资源管理对象，必须是ResourceManager对象
  - db
  - entityManager
  - success
  - fail
*/
export const addAuditLog = (options = {}) => async (req, res, next) => {
  // 检查getResourceManager是否正确
  if (!options.getResourceManager || typeof options.getResourceManager !== 'function') {
    error('必须提供getResourceManager');
    res.status(500).send('getById: 必须提供getResourceManager');
    return;
  }
  const getId = options.getId || (req2 => (new ObjectId(req2.params.id)));
  const getAuditLog = options.getAuditLog || (req2 => req2.body);
  const success = options.success || ((id, req2, res2) => {
    res2.json({ id });
  });
  const fail = options.fail || ((err, req2, res2) => {
    error('addAuditLog Error: ', err.message);
    res2.status(500).send('服务器错误');
  });
  const rm = options.getResourceManager(req);
  try {
    const id = getId(req);
    const auditLog = getAuditLog(req, res);
    await rm.addAuditLog(id, auditLog);
    success(id, req, res, next);
  } catch (err) {
    fail(err, req, res, next);
  }
};

/*
根据Id获取资源数据
options参数：
  - getId
  - getResourceManager
  - success
  - fail
返回值：
  - 获取后的数据存放在：req.records.record 中
*/
export const getById = (options = {}) => async (req, res, next) => {
  // 检查getResourceManager是否正确
  if (!options.getResourceManager || typeof options.getResourceManager !== 'function') {
    error('必须提供getResourceManager');
    res.status(500).send('getById: 必须提供getResourceManager');
    return;
  }
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
  const entityManger = options.getResourceManager(req);
  const id = getId(req);
  try {
    const data = await entityManger.findById(id);
    success(data, req, res, next);
  } catch (err) {
    fail(err, req, res, next);
  }
};
