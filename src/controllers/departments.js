/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';
import { resources, changeLogTypes, info, error, isAdmin, auditStatus } from '../config';
import { formatQuery, setContentRange } from '../middlewares/simple-rest';
import DepartmentManager from '../models/departments';
import { generateCreation } from '../middlewares/creation';
import { currentUser } from '../middlewares/auth';
import { list, totalCount, getById, updateById, deleteById, insert, listFilter } from '../middlewares/departments';
import { addAuditLog } from '../middlewares/resources';
import { insert as insertChangeLog } from '../middlewares/changelogs';
import { list as zzjgList } from '../middlewares/zzjg';

export default (options) => {
  const { db, routeName } = options;
  const deptm = new DepartmentManager(db);

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
      manager: deptm,
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
      success: (record, req, res, next) => {
        req.records = {
          ...req.records,
          record,
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

      if (isAdmin(roles)) next();
      else {
        const record = req.records.record;
        try {
          if ((record.creation.creator.id === id
            || record.zyfzr.id === id
            || record.bmscy.id === id)
            && !auditStatus.isItcApproved(record)) next();
          else res.status(403).send('没有修改权限');
        } catch (err) {
          error('departments getOneCheck:', err.message);
          res.status(500).send(err.message);
        }
      }
    },
    updateById({
      db,
      success: (id, req, res, next) => next(),
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
          id: req.params.id,
        },
        note: '修改记录',
        type: changeLogTypes.UPDATE,
      }),
    }),
    (req, res, next) => {
      if (auditStatus.isCreated(req.records.record)) res.json({ id: req.params.id });
      else next();
    },
    addAuditLog({
      manager: deptm,
      getAuditLog: req => ({
        auditor: {
          id: req.user.id,
          name: req.user.name,
        },
        status: auditStatus.CREATED,
      }),
    }),
    (req, res) => res.json({ id: req.params.id }),
  );

  // 提交审核
  router.put('/commit/:id',
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
    /*
      检查当前用户、当前数据是否能够提交给itc审核。
      必须满足以下条件：
      1. 当前用户必须创建者
      2. 资源最后状态为CREATED
    */
    (req, res, next) => {
      const { id, roles } = req.user;

      if (isAdmin(roles)) next();
      else {
        const record = req.records.record;
        try {
          if (record.creation.creator.id === id && auditStatus.isCreated(record)) {
            next();
          } else res.status(403).send('没有权限');
        } catch (err) {
          error('departments getOneCheck:', err.message);
          res.status(500).send(err.message);
        }
      }
    },
    addAuditLog({
      manager: deptm,
      getAuditLog: req => ({
        auditor: {
          id: req.user.id,
          name: req.user.name,
        },
        status: auditStatus.SYDW_APPROVED,
      }),
    }),
    (req, res) => res.json({ id: req.params.id }),
  );

  // 撤回
  router.put('/withdraw/:id',
    currentUser({ db }),
    getById({ db }),
    /*
      检查当前用户、当前数据是否能够撤回。
      必须满足以下条件：
      1. 当前用户必须创建者
      2. 资源最后状态为SYDW_APPROVED
    */
    (req, res, next) => {
      const { id, roles } = req.user;

      if (isAdmin(roles)) next();
      else {
        const record = req.records.record;
        try {
          if (record.creation.creator.id === id && auditStatus.isSydwApproved(record)) {
            next();
          } else res.status(403).send('没有权限');
        } catch (err) {
          error('departments getOneCheck:', err.message);
          res.status(500).send(err.message);
        }
      }
    },
    addAuditLog({
      manager: deptm,
      getAuditLog: req => ({
        auditor: {
          id: req.user.id,
          name: req.user.name,
        },
        status: auditStatus.CREATED,
      }),
    }),
    (req, res) => res.json({ id: req.params.id }),
  );

  router.put('/itc-approve/:id',
    currentUser({ db }),
    getById({ db }),
    /*
      检查当前用户、当前数据是否能够通过审核。
      必须满足以下条件：
      1. 当前用户必须创建者
      2. 资源最后状态为SYDW_APPROVED
    */
    (req, res, next) => {
      const { id, roles } = req.user;

      if (isAdmin(roles)) next();
      else {
        const record = req.records.record;
        try {
          if (record.creation.creator.id === id && auditStatus.isSydwApproved(record)) {
            next();
          } else res.status(403).send('没有权限');
        } catch (err) {
          error('departments getOneCheck:', err.message);
          res.status(500).send(err.message);
        }
      }
    },
    addAuditLog({
      manager: deptm,
      getAuditLog: req => ({
        auditor: {
          id: req.user.id,
          name: req.user.name,
        },
        status: auditStatus.ITC_APPROVED,
      }),
    }),
    (req, res) => res.json({ id: req.params.id }),
  );

  router.put('/itc-reject/:id',
    currentUser({ db }),
    getById({ db }),
    /*
      检查当前用户、当前数据是否可以被ITC拒绝。
      必须满足以下条件：
      1. 当前用户必须创建者
      2. 资源最后状态为SYDW_APPROVED
      3. req.body必须有remark字段
    */
    (req, res, next) => {
      const { id, roles } = req.user;
      const { remark } = req.body;
      if (!remark) {
        res.status(500).send('必须提供填写驳回理由');
        return;
      }
      const record = req.records.record;
      if (isAdmin(roles) && (
            auditStatus.isSydwApproved(record) || auditStatus.isItcApproved(record)
          )) next();
      else {
        try {
          if (record.creation.creator.id === id && (
            auditStatus.isSydwApproved(record) || auditStatus.isItcApproved(record)
          )) {
            next();
          } else res.status(403).send('没有权限');
        } catch (err) {
          error('departments getOneCheck:', err.message);
          res.status(500).send(err.message);
        }
      }
    },
    addAuditLog({
      manager: deptm,
      getAuditLog: req => ({
        auditor: {
          id: req.user.id,
          name: req.user.name,
        },
        status: auditStatus.ITC_REJECTED,
        remark: req.body.remark,
      }),
    }),
    (req, res) => res.json({ id: req.params.id }),
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
