/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';
// import { secret } from '../config';
import { formatQuery, setContentRange } from '../middlewares/simple-rest';

import { ObjectId } from 'mongodb';
import EmailManager from '../models/emails';
import { generateCreation } from '../middlewares/creation';

export default (options) => {
  const { db, routeName } = options;
  const emailm = new EmailManager(db);

  const router = new Router();

  router.get('/',
    formatQuery(),
    setContentRange({
      resource: routeName,
      getCount: () => emailm.count(),
    }),
  async (req, res) => {
    const data = await emailm.find(req.mongoQuery);
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
    generateCreation(),
  async (req, res) => {
    const id = await emailm.insert({
      creation: req.creation,
      ...req.body,
    });
    res.json({ id });
  });

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
