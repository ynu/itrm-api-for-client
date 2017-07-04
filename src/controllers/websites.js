/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';
// import { secret } from '../config';
import { formatQuery, setContentRange } from '../middlewares/simple-rest';
import { list, totalCount, listFilter, getById, updateById, deleteById, insert } from '../middlewares/websites';
import { resources, changeLogTypes, info, error, isAdmin } from '../config';

import WebSiteManager from '../models/websites';
import { generateCreation } from '../middlewares/creation';
import { currentUser } from '../middlewares/auth';
import { insert as insertChangeLog } from '../middlewares/changelogs';
import { list as zzjgList } from '../middlewares/zzjg';

export default (options) => {
  const { db, routeName } = options;
  const wsm = new WebSiteManager(db);

  const router = new Router();

  router.get('/',
    currentUser({ db }),
    formatQuery({
      success: (queryOptions, req, res, next) => {
        info('websites list queryOptions:', queryOptions);
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
    async (req, res) => {
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


  // 创建数据
  router.post('/',
    // 检查用户登录，未登录则返回
    currentUser(),

    // 创建Creation信息
    generateCreation(),

    // 获取组织机构列表
    zzjgList(),

    // 插入部门信息
    insert({
      manager: wsm,
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
          category: resources.DEPARTMENTS,
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
      success: (website, req, res, next) => {
        req.records = {
          ...req.records,
          website,
        };
        next();
      },
    }),
    // 检查当前用户是否具有编辑权限
    (req, res, next) => {
      const { id, roles } = req.user;

      if (isAdmin(roles)) next();
      else {
        const website = req.records.website;
        try {
          if (website.creation.creator.id === id
            || website.manager.id === id) next();
          else res.status(403).send('没有修改权限');
        } catch (err) {
          error('website getOneCheck:', err.message);
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
      success: (website, req, res, next) => {
        req.records = {
          ...req.records,
          website,
        };
        next();
      },
    }),
    // 检查当前用户是否具有删除权限
    (req, res, next) => {
      const { id, roles } = req.user;

      if (isAdmin(roles)) next();
      else {
        const website = req.records.website;
        try {
          if (website.creation.creator.id === id
            || website.manager.id === id) next();
          else res.status(403).send('没有删除权限');
        } catch (err) {
          error('website getOneCheck:', err.message);
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
