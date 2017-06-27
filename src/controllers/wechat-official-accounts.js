/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { formatQuery, setContentRange } from '../middlewares/simple-rest';
import { currentUser } from '../middlewares/auth';
import { list, totalCount } from '../middlewares/wechat-official-accounts';
import WeChatOfficialAccountManager from '../models/wechat-official-accounts';
import { generateCreation } from '../middlewares/creation';

export default (options) => {
  const { db, routeName } = options;
  const woam = new WeChatOfficialAccountManager(db);

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
      getCount: req => req.wechatOfficialAccounts.totalCount,
    }),
    (req, res) => {
      const data = req.wechatOfficialAccounts.list;
      res.json(data.map(({ _id, ...other }) => ({
        id: _id,
        ...other,
      })));
    }
  );

  router.get('/:id', async (req, res) => {
    const id = new ObjectId(req.params.id);
    res.json(await woam.findById(id));
  });

  router.post('/',
    currentUser(),
    generateCreation(),
    async (req, res) => {
      const id = await woam.insert({
        creation: req.creation,
        ...req.body,
      });
      res.json({ id });
    }
  );

  router.put('/:id', async (req, res) => {
    const _id = new ObjectId(req.params.id);
    await woam.updateById({
      ...req.body,
      _id,
    });
    res.json({ id: _id });
  });

  router.delete('/:id', async(req, res) => {
    const id = new ObjectId(req.params.id);
    await woam.removeById(id);
    res.json({ id });
  });


  return router;
};
