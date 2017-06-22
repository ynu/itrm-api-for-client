/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';
import { formatQuery, setContentRange } from '../middlewares/simple-rest';

import DepartmentManager from '../models/departments';
import { generateCreation } from '../middlewares/creation';
import { currentUser } from '../middlewares/auth';
import { list, totalCount, getById, updateById, deleteById } from '../middlewares/departments';
import { list as zzjgList } from '../middlewares/zzjg';

export default (options) => {
  const { db, routeName } = options;
  const deptm = new DepartmentManager(db);

  const router = new Router();

  router.get('/',
    currentUser({ db }),
    formatQuery(),
    // 添加权限过滤
    // 一条记录的查询条件仅限于：创建者、主要负责人、保密审查员。
    (req, res, next) => {
      const userId = req.user.id;
      req.queryFilter = {
        $or: [
            { 'creation.creator.id': userId },
            { 'zyfzr.id': userId },
            { 'bmscy.id': userId },
        ],
      };
      next();
    },
    list({
      db,
      getFilter: req => req.queryFilter,
    }),
    totalCount({
      db,
      getFilter: req => req.queryFilter,
    }),
    setContentRange({
      resource: routeName,
      getCount: req => req.departments.totalCount,
    }),
    (req, res) => {
      const data = req.departments.list;
      res.json(data.map(({ _id, ...other }) => ({
        id: _id,
        ...other,
      })));
    });

  router.get('/:id',
    currentUser(),
    getById({ db }),
  );

  router.post('/',
    currentUser(),
    generateCreation(),
    zzjgList(),
  async (req, res) => {
    const zzjgs = req.zzjg.list;
    const zzjg = zzjgs.find(jg => req.body.dept.id === jg.dm);
    const id = await deptm.insert({
      creation: req.creation,
      ...req.body,
      name: zzjg.mc,
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
