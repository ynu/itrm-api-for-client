/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';
import { formatQuery, setContentRange } from '../middlewares/simple-rest';
import { generateDocx, sampleData } from '../middlewares/utils';

import AqzrManager from '../models/aqzr';
import { generateCreation } from '../middlewares/creation';
import { currentUser } from '../middlewares/auth';
import { list, totalCount, getById, updateById, deleteById, collectData } from '../middlewares/aqzr';
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
    formatQuery(),
    list({ db }),
    totalCount({ db }),
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
  );

  router.get('/:id/docx',
    currentUser(),
    formatQuery(),
    listDepartment({ db }),
    listWebsite({ db }),
    listWechat({ db }),
    listWeibo({ db }),
    listEmail({ db }),
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
