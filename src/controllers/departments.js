/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';
// import { secret } from '../config';

const { ObjectId } = require('mongodb');
const DepartmentManager = require('../models/departments').default;

export default (options) => {
  const { db, routeName } = options;
  const deptm = new DepartmentManager(db);

  const router = new Router();

  router.get('/', async (req, res) => {
    const { sort: [orderBy, direction], range, filter } = req.query;
    const findOptions = {
      sort: {
        [orderBy]: direction === 'DESC' ? 1 : -1,
      },
      skip: parseInt(range[0]),
      limit: parseInt(range[1]) - parseInt(range[0]) + 1,
      query: {},
    };
    const data = await deptm.find(findOptions);
    const count = await deptm.count(findOptions.query);
    res.set('Content-Range', `${routeName} ${range[0]}-${range[1]}/${count}`);
    res.json(data.map(item => ({
      id: item._id,
      ...item,
    })));
  });

  router.get('/:id', async (req, res) => {
    const id = new ObjectId(req.params.id);
    res.json(await deptm.findById(id));
  });

  router.post('/', async (req, res) => {
    const id = await deptm.insert(req.body);
    res.json({ id });
  });

  router.put('/:id', async (req, res) => {
    const _id = new ObjectId(req.params.id);
    const { domain, name } = req.body;
    await deptm.updateById({
      _id,
      domain,
      name,
    });
    res.json({ id: _id });
  });

  router.delete('/:id', async(req, res) => {
    const id = new ObjectId(req.params.id);
    await deptm.removeById(id);
    res.json({ id });
  });


  return router;
};
