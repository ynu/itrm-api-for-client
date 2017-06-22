/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';

import { currentUser } from '../middlewares/auth';
import { setContentRange } from '../middlewares/simple-rest';
import { list } from '../middlewares/zzjg';

export default (options) => {
  const { db, routeName } = options;

  const router = new Router();

  router.get('/',
    currentUser({ db }),
    list(),
    setContentRange({
      resource: routeName,
      getCount: req => req.zzjg.list.length,
    }),
    (req, res) => {
      const data = req.zzjg.list;
      res.json(data.map(item => ({
        id: item.dm,
        name: item.mc,
        ...item,
      })));
    });

  return router;
};
