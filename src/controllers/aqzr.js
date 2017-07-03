/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';
import { formatQuery, setContentRange } from '../middlewares/simple-rest';
import { generateDocx } from '../middlewares/utils';
import { resources, changeLogTypes, info, error, isSupervisor, isAdmin } from '../config';

import AqzrManager from '../models/aqzr';
import { generateCreation } from '../middlewares/creation';
import { currentUser } from '../middlewares/auth';
import { list, totalCount, getById, updateById, deleteById, collectData, listFilter } from '../middlewares/aqzr';
import { getById as getByIdDepartment, list as listDepartment } from '../middlewares/departments';
import { list as listWebsite } from '../middlewares/websites';
import { list as listWechat } from '../middlewares/wechat-official-accounts';
import { list as listWeibo } from '../middlewares/weibo-accounts';
import { list as listEmail } from '../middlewares/emails';

export default (options) => {
  const { db, routeName } = options;
  const aqzrm = new AqzrManager(db);

  const router = new Router();

  router.get('/',
    currentUser({ db }),
    formatQuery({
      success: (queryOptions, req, res, next) => {
        info('aqzr list queryOptions:', queryOptions);
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
      getCount: req => req.aqzr.totalCount,
    }),
    (req, res) => {
      const data = req.aqzr.list;
      res.json(data.map(({ _id, ...other }) => ({
        id: _id,
        ...other,
      })));
    });

  router.get('/:id',
    currentUser(),
    getById({ db }),
    (req, res) => {
      const data = req.records.record;
      res.json({
        id: data._id,
        ...data,
      });
    }
  );

  router.get('/:id/docx',
    currentUser(),
    formatQuery(),
    // 添加权限过滤
    // 一条记录的查询条件仅限于：创建者、管理员。
    (req, res, next) => {
      const userId = req.user.id;
      req.queryFilter = {
        $or: [
            { 'creation.creator.id': userId },
            { 'manager.id': userId },
        ],
      };
      next();
    },
    listDepartment({
      db,
      getFilter: req => ({
        $or: [
            { 'creation.creator.id': req.user.id },
            { 'zyfzr.id': req.user.id },
            { 'bmscy.id': req.user.id },
        ],
      }),
    }),
    listWebsite({
      db,
      getFilter: req => req.queryFilter,
    }),
    listWechat({
      db,
      getFilter: req => req.queryFilter,
    }),
    listWeibo({
      db,
      getFilter: req => req.queryFilter,
    }),
    listEmail({
      db,
      getFilter: req => req.queryFilter,
    }),
    collectData(),
    // 可以使用{ data: sampleData }测试
    generateDocx(),
  );

  router.post('/',
    currentUser(),
    generateCreation(),
  async (req, res) => {
    const manager = {
      id: req.user.id,
    };
    const id = await aqzrm.insert({
      creation: req.creation,
      manager,
      ...req.body,
    });
    res.json({ id });
  }
  );

  router.put('/:id',
    currentUser(),
    updateById({ db }),
  );

  router.delete('/:id',
    currentUser(),
    deleteById({ db }),
  );


  return router;
};
