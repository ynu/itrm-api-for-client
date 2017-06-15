/*
 eslint-disable no-param-reassign
*/

import { Router } from 'express';
import { secret } from '../config';

const { ObjectId } = require('mongodb');
const WebSiteManager = require('../models/websites').default;

export default (options) => {
  const { db } = options;
  const wsm = new WebSiteManager(db);

  const router = new Router();

  router.get('/', async (req, res) => {
    const data = await wsm.find();
    const count = await wsm.count();
    res.set('X-Total-Count', count);
    res.json(data.map(item => ({
      id: item._id,
      ...item,
    })));
  });

  router.get('/:id', async (req, res) => {
    const id = new ObjectId(req.params.id);
    res.json(await wsm.findById(id));
  });

  router.post('/', async (req, res) => {
    const id = await wsm.insert(req.body);
    res.json({ id });
  });

  router.put('/:id', async (req, res) => {
    const _id = new ObjectId(req.params.id);
    const { domain, name } = req.body;
    await wsm.updateById({
      _id,
      domain,
      name,
    });
    res.json({ id: _id });
  });

  router.delete('/:id', async(req, res) => {
    const id = new ObjectId(req.params.id);
    await wsm.removeById(id);
    res.json({ id });
  });


  return router;
};
