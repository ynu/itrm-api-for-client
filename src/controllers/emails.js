/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/
import { ObjectId } from 'mongodb';
import { Router } from 'express';
// import { secret } from '../config';
import { formatQuery, setContentRange } from '../middlewares/simple-rest';
import { currentUser } from '../middlewares/auth';
import { list, totalCount } from '../middlewares/emails';

import EmailManager from '../models/emails';
import { generateCreation } from '../middlewares/creation';

export default (options) => {
  const { db, routeName } = options;
  const emailm = new EmailManager(db);

  const router = new Router();

  router.get('/',
    currentUser({ db }),
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
      getCount: req => req.records.totalCount,
    }),
  async (req, res) => {
    const data = req.records.list;
    res.json(data.map(({ _id, ...other }) => ({
      id: _id,
      ...other,
    })));
  });

  router.get('/:id', async (req, res) => {
    const id = new ObjectId(req.params.id);
    res.json(await emailm.findById(id));
  });

  router.post('/',
    currentUser(),
    generateCreation(),
    async (req, res) => {
      const id = await emailm.insert({
        creation: req.creation,
        ...req.body,
      });
      res.json({ id });
    }
  );

  router.put('/:id', async (req, res) => {
    const _id = new ObjectId(req.params.id);
    await emailm.updateById({
      ...req.body,
      _id,
    });
    res.json({ id: _id });
  });

  router.delete('/:id', async(req, res) => {
    const id = new ObjectId(req.params.id);
    await emailm.removeById(id);
    res.json({ id });
  });


  return router;
};
