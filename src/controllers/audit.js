import { Router } from 'express';
import { currentUser } from '../middlewares/auth';
import { addAuditLog, getById } from '../middlewares/resources';
import DepartmentManager from '../models/departments';
import { resources, changeLogTypes, info, error, isAdmin, auditStatus } from '../config';


export default (options) => {
  const { db } = options;
  const managers = {
    departments: new DepartmentManager(db),
  };

  const router = new Router();

  /*
  实现资源的审核
  - action 审核动作，包括：commit, withdraw, itc-approved, itc-rejected
  - resName 被审核的资源，包括：department, website等
  - id 资源Id
  */
  router.post('/:action/:resName/:id',
    currentUser({ db }),

    // 读取资源数据
    getById({
      getResourceManager: (req) => {
        const { resName } = req.params;
        return managers[resName];
      },
      // success: (record, req, res, next) => {
      //   req.records = {
      //     ...req.records,
      //     record,
      //   };
      //   next();
      // },
    }),
    /*
      检查当前用户、当前数据是否具备审核条件。
      不同的资源、不同的审核动作条件不一样。
    */
    (req, res, next) => {
      const { id, roles } = req.user;
      const { action, resName } = req.params;
      const { record } = req.records;
      try {
        // 根据action的值处理
        switch (action) {
          case 'commit':
            // 管理员可以进行所有资源的commit
            if (isAdmin(roles)) {
              next();
              return;
            }
            // 不同资源的commit条件不一样
            switch (resName) {
              // department的commit条件是：1. 当前用户必须是资源创建者；2. 资源处在CREATED状态.
              case 'departments':
                if (record.creation.creator.id === id && auditStatus.isCreated(record)) {
                  next();
                } else res.status(403).send('没有权限');
                break;
              default:
                break;
            }
            break;

          case 'withdraw':
            // 不同资源的withdraw条件不一样
            switch (resName) {
              // department的withdraw条件是：1. 当前用户必须是资源创建者；2. 资源处在SYDW_APPROVED状态.
              case 'department':
                if (record.creation.creator.id === id && auditStatus.isSydwApproved(record)) {
                  next();
                } else res.status(403).send('没有权限');
                break;
              default:
                break;
            }
            break;
          default:
            break;
        }
      } catch (err) {
        error('departments getOneCheck:', err.message);
        res.status(500).send(err.message);
      }
    },

    // 添加审核记录
    addAuditLog({
      getResourceManager: (req) => {
        const { resName } = req.params;
        return managers[resName];
      },
      getAuditLog: (req) => {
        const { action } = req.params;
        let status;
        switch (action) {
          case 'commit':
            status = auditStatus.SYDW_APPROVED;
            break;
          case 'withdraw':
            status = auditStatus.CREATED;
            break;
          default:
            break;
        }
        return {
          auditor: {
            id: req.user.id,
            name: req.user.name,
          },
          status,
        };
      },
    }),
    (req, res) => res.json({ id: req.params.id }),
  );
  return router;
};
