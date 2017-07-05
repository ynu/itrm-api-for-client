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
    getById({
      db,
      success: (data, req, res, next) => {
        req.aqzr = data;
        next();
      },
    }),
    listDepartment({
      db,
      getQueryOptions: (req, res) => ({
        query: {"dept.id":req.aqzr.dept.id},
        skip: 0,
        limit: 100,
      }),
      success: (data, req, res, next) => {
        req.departments = data;
        req.department = data[0];
        next();
      },
    }),
    listWebsite({
      db,
      getFilter: req => req.queryFilter,
      getQueryOptions: (req, res) => {
        return {
          query: {"dept.id": req.department.dept.id},
          skip: 0,
          limit: 100,
        }
      },
    }),
    listWechat({
      db,
      getFilter: req => req.queryFilter,
      getQueryOptions: (req, res) => {
        return {
          query: {"dept.id": req.department.dept.id},
          skip: 0,
          limit: 100,
        }
      },
    }),
    listWeibo({
      db,
      getFilter: req => req.queryFilter,
      getQueryOptions: (req, res) => {
        return {
          query: {"dept.id": req.department.dept.id},
          skip: 0,
          limit: 100,
        }
      },
    }),
    listEmail({
      db,
      getFilter: req => req.queryFilter,
      getQueryOptions: (req, res) => {
        return {
          query: {"dept.id": req.department.dept.id},
          skip: 0,
          limit: 100,
        }
      },
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
          if (record.creation.creator.id === id) next();
          else res.status(403).send('没有修改权限');
        } catch (err) {
          error('departments getOneCheck:', err.message);
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
          if (record.creation.creator.id === id) next();
          else res.status(403).send('没有删除权限');
        } catch (err) {
          error('aqzr getOneCheck:', err.message);
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
