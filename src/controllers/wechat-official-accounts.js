/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';
// import { secret } from '../config';
import { formatQuery, setContentRange } from '../middlewares/simple-rest';

const { ObjectId } = require('mongodb');
const WeChatOfficialAccountManager = require('../models/wechat-official-accounts').default;
const { generateCreation } = require('../middlewares/creation').default;

export default (options) => {
  const { db, routeName } = options;
  const woam = new WeChatOfficialAccountManager(db);

  const router = new Router();

  router.get('/',
    formatQuery(),
    setContentRange({
      resource: routeName,
      getCount: () => woam.count(),
    }),
  async (req, res) => {
    const data = await woam.find(req.mongoQuery);
    res.json(data.map(({ _id, ...other }) => ({
      id: _id,
      ...other,
    })));
  });

  router.get('/:id', async (req, res) => {
    const id = new ObjectId(req.params.id);
    res.json(await woam.findById(id));
  });

  router.post('/',
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
