/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/
import { Router } from 'express';
// import { secret } from '../config';
import { formatQuery, setContentRange } from '../middlewares/simple-rest';
import { currentUser } from '../middlewares/auth';
import { list, totalCount, getById, updateById, deleteById, insert, listFilter } from '../middlewares/weibo-accounts';

import WeiboAccountManager from '../models/weibo-accounts';
import { generateCreation } from '../middlewares/creation';
import { resources, changeLogTypes, info, error, isAdmin } from '../config';
import { insert as insertChangeLog } from '../middlewares/changelogs';
import { list as zzjgList } from '../middlewares/zzjg';

export default (options) => {
  const { db, routeName } = options;
  const weibom = new WeiboAccountManager(db);

  const router = new Router();

  router.get('/',
    currentUser({ db }),
    formatQuery({
      success: (queryOptions, req, res, next) => {
        info('departments list queryOptions:', queryOptions);
        req.queryOptions = queryOptions;
        next();
      },
    }),
    list({
      db,
      getQueryOptions: req => ({
        ...req.queryOptions,
        query: {
          ...req.queryOptions.query,
          ...listFilter(req),
        },
      }),
    }),
    totalCount({
      db,
      getFilter: listFilter,
    }),
    setContentRange({
      resource: routeName,
      getCount: req => req.records.totalCount,
    }),
    (req, res) => {
      const data = req.records.list;
      res.json(data.map(({ _id, ...other }) => ({
        id: _id,
        ...other,
      })));
    }
  );

  router.get('/:id',
    currentUser({ db }),
    getById({ db }),
    (req, res) => {
      const data = req.records.record;
      res.json({
        id: data._id,
        ...data,
      });
    }
  );

  router.post('/',
    // 检查用户登录，未登录则返回
    currentUser(),

    // 创建Creation信息
    generateCreation(),

    // 获取组织机构列表
    zzjgList(),

    // 插入部门信息
    insert({
      manager: weibom,
      getData: (req) => {
        const zzjgs = req.zzjg.list;
        const zzjg = zzjgs.find(jg => req.body.dept.id === jg.dm);
        return {
          creation: req.creation,
          ...req.body,
          name: zzjg.mc,
        };
      },
    }),

    // 插入修改日志信息
    insertChangeLog({
      db,
      getData: req => ({
        date: new Date(),
        operator: {
          id: req.user.id,
        },
        resource: {
          category: resources.WEIBO_ACCOUNTS,
          id: req.records.insertedId,
        },
        note: '创建新记录',
        type: changeLogTypes.CREATE,
      }),
    }),

    // 返回数据
    (req, res) => {
      res.json({ id: req.records.insertedId });
    }
  );

  router.put('/:id',
    currentUser({ db }),
    getById({
      db,
      success: (record, req, res, next) => {
        req.records = {
          ...req.records,
          record,
        };
        next();
      },
    }),
    // 检查当前用户是否具有编辑权限
    (req, res, next) => {
      const { id, roles } = req.user;

      if (isAdmin(roles)) next();
      else {
        const record = req.records.record;
        try {
          if (record.creation.creator.id === id
            || record.zyfzr.id === id
            || record.bmscy.id === id) next();
          else res.status(403).send('没有修改权限');
        } catch (err) {
          error('weibo-accounts getOneCheck:', err.message);
          res.status(500).send(err.message);
        }
      }
    },
    updateById({ db }),
  );

  router.delete('/:id',
    currentUser({ db }),
    getById({
      db,
      success: (record, req, res, next) => {
        req.records = {
          ...req.records,
          record,
        };
        next();
      },
    }),
    // 检查当前用户是否具有删除权限
    (req, res, next) => {
      const { id, roles } = req.user;

      if (isAdmin(roles)) next();
      else {
        const record = req.records.record;
        try {
          if (record.creation.creator.id === id
            || record.zyfzr.id === id
            || record.bmscy.id === id) next();
          else res.status(403).send('没有删除权限');
        } catch (err) {
          error('departments getOneCheck:', err.message);
          res.status(500).send(err.message);
        }
      }
    },
    deleteById({ db }),
    (req, res) => {
      res.json({});
    }
  );


  return router;
};
