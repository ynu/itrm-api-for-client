/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';
import { formatQuery, setContentRange } from '../middlewares/simple-rest';

import DepartmentManager from '../models/departments';
import { generateCreation } from '../middlewares/creation';
import { currentUser } from '../middlewares/auth';
import { list, totalCount, getById, updateById, deleteById } from '../middlewares/departments';

export default (options) => {
  const { db, routeName } = options;
  const deptm = new DepartmentManager(db);

  const router = new Router();

  router.get('/',
    currentUser({ db }),
    formatQuery(),
    list({ db }),
    totalCount({ db }),
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
  async (req, res) => {
    const id = await deptm.insert({
      creation: req.creation,
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
