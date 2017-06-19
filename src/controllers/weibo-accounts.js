/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';
// import { secret } from '../config';
import { formatQuery, setContentRange } from '../middlewares/simple-rest';

const { ObjectId } = require('mongodb');
const WeiboAccountManager = require('../models/wechat-official-accounts').default;

export default (options) => {
  const { db, routeName } = options;
  const weibom = new WeiboAccountManager(db);

  const router = new Router();

  router.get('/',
    formatQuery(),
    setContentRange({
      resource: routeName,
      getCount: () => weibom.count(),
    }),
  async (req, res) => {
    const data = await weibom.find(req.mongoQuery);
    res.json(data.map(({ _id, ...other }) => ({
      id: _id,
      ...other,
    })));
  });

  router.get('/:id', async (req, res) => {
    const id = new ObjectId(req.params.id);
    res.json(await weibom.findById(id));
  });

  router.post('/', async (req, res) => {
    const id = await weibom.insert(req.body);
    res.json({ id });
  });

  router.put('/:id', async (req, res) => {
    const _id = new ObjectId(req.params.id);
    const { domain, name } = req.body;
    await weibom.updateById({
      _id,
      domain,
      name,
    });
    res.json({ id: _id });
  });

  router.delete('/:id', async(req, res) => {
    const id = new ObjectId(req.params.id);
    await weibom.removeById(id);
    res.json({ id });
  });


  return router;
};
