/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';
// import { secret } from '../config';
import { formatQuery, setContentRange } from '../middlewares/simple-rest';

import { ObjectId } from 'mongodb';
import WebSiteManager from '../models/websites';
import { generateCreation } from '../middlewares/creation';

export default (options) => {
  const { db, routeName } = options;
  const wsm = new WebSiteManager(db);

  const router = new Router();

  router.get('/',
    formatQuery(),
    setContentRange({
      resource: routeName,
      getCount: () => wsm.count(),
    }),
    async (req, res) => {
      const data = await wsm.find(req.mongoQuery);
      res.json(data.map(({ _id, ...other }) => ({
        id: _id,
        ...other,
      })));
    }
  );

  router.get('/:id', async (req, res) => {
    const id = new ObjectId(req.params.id);
    const data = await wsm.findById(id);
    res.json({
      id,
      ...data,
    });
  });


  // 创建数据
  router.post('/',
    // 规整数据
    (req, res, next) => {
      let { mainUrlPage } = req.body;
      const { domain } = req.body;
      if (!mainUrlPage) mainUrlPage = `http://${domain}`;
      req.website = {
        ...req.body,
        mainUrlPage,
      };
      next();
    },
    generateCreation(),
    async (req, res) => {
      const id = await wsm.insert({
        creation: req.creation,
        ...req.website,
      });
      res.json({ id });
    }
  );

  router.put('/:id',
    // 规整数据
    (req, res, next) => {
      let { mainUrlPage } = req.body;
      const { domain } = req.body;
      if (!mainUrlPage) mainUrlPage = `http://${domain}`;
      req.website = {
        ...req.body,
        mainUrlPage,
      };
      next();
    },
    async (req, res) => {
      const _id = new ObjectId(req.params.id);
      await wsm.updateById({
        ...req.body,
        _id,
      });
      res.json({ id: _id });
    }
  );

  router.delete('/:id', async(req, res) => {
    const id = new ObjectId(req.params.id);
    await wsm.removeById(id);
    res.json({ id });
  });


  return router;
};
