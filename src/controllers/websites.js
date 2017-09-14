/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';
import { URL } from 'url';
import { formatQuery, setContentRange } from '../middlewares/simple-rest';
import { list, totalCount, listFilter, getById, updateById, deleteById, insert } from '../middlewares/websites';
import { resources, changeLogTypes, info, error, isAdmin, auditStatus } from '../config';

import WebSiteManager from '../models/websites';
import { generateCreation } from '../middlewares/creation';
import { currentUser } from '../middlewares/auth';
import { insert as insertChangeLog } from '../middlewares/changelogs';
import { list as zzjgList } from '../middlewares/zzjg';

// 根据输入的参数mainPageUrl获取域名domain
const getDomain = (req, res, next) => {
  if (!req.body.mainPageUrl) {
    res.status(500).send('必须提供参数：mainPageUrl');
    return;
  }
  const mainPageUrl = new URL(req.body.mainPageUrl);
  req.body.domain = mainPageUrl.host;
  next();
};

export default (options) => {
  const { db, routeName } = options;
  const wsm = new WebSiteManager(db);

  const router = new Router();

  router.get('/',
    currentUser({ db }),
    formatQuery({
      // 处理请求中的filter参数
      handleFilter: (filterString) => {
        try {
          const filter = JSON.parse(filterString);
          const query = {};
          // List页面的搜索过滤，根据name和domian检索
          if (filter.q) {
            query.$or = [
              { name: new RegExp(filter.q, 'i') },
              { domain: new RegExp(filter.q, 'i') },
            ];
          }
          // List根据最终状态过滤
          if (filter.status >= 0) {
            query['latestAuditLog.status'] = filter.latestAuditLog.status;
          }
          return query;
        } catch (err) {
          return {};
        }
      },
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

    // 根据mainPageUrl生成domian
    getDomain,

    // 获取组织机构列表
    zzjgList(),

    // 插入网站信息
    insert({
      manager: wsm,
      getData: (req) => {
        const zzjgs = req.zzjg.list;
        const zzjg = zzjgs.find(jg => req.body.dept.id === jg.dm);
        return {
          creation: req.creation,
          ...req.body,
          dept: {
            ...req.body.dept,
            name: zzjg.mc,
          },
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

  // 编辑数据
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

    /*
    检查当前用户是否具有编辑权限,必须满足条件：
    1. 用户角色
    2. 资源状态，不能是ITC_APPROVED状态
    */
    (req, res, next) => {
      const { id, roles } = req.user;

      if (isAdmin(roles)) next(); // 管理员可以编辑
      else {
        const website = req.records.website;
        try {
          // 创建者或站点管理员可以编辑未提交的数据
          if ((website.creation.creator.id === id
            || website.manager.id === id)
            && !auditStatus.isItcApproved(website)) next();
          else res.status(403).send('没有修改权限');
        } catch (err) {
          error('website getOneCheck:', err.message);
          res.status(500).send(err.message);
        }
      }
    },

    // 根据mainPageUrl生成domian
    getDomain,

    // 获取组织机构列表
    zzjgList(),

    updateById({
      db,
      getUpdateExpression: (req) => {
        // 更新的时候同时更新dept字段的name等字段
        const zzjg = req.zzjg.list.find(jg => req.body.dept.id === jg.dm);
        req.body.dept = {
          ...req.body.dept,
          name: zzjg.mc,
        };
        return req.body;
      },
      success: (id, req, res) => {
        // 操作成功后，最好的方式是返回整个对象的数据
        res.json({
          id,
          ...req.body,
        });
      },
    }),
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
