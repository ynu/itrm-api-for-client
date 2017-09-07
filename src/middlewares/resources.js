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
  const getId = options.getId || (req2 => (new ObjectId(req2.params.id)));
  const getAuditLog = options.getAuditLog || (req2 => req2.body);
  const success = options.success || ((id, req2, res2) => {
    res2.json({ id });
  });
  const fail = options.fail || ((err, req2, res2) => {
    res2.status(403).send('当前用户没有权限');
  });
  const rm = getManager(options);
  try {
    const id = getId(req);
    const auditLog = getAuditLog(req, res);
    await rm.addAuditLog(id, auditLog);
    success(id, req, res, next);
  } catch (err) {
    fail(err, req, res, next);
  }
};
