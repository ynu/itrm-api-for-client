/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';

import { currentUser } from '../middlewares/auth';
import { setContentRange } from '../middlewares/simple-rest';

export default (options) => {
  const { db, routeName } = options;

  const router = new Router();

  router.get('/',
    currentUser({ db }),
    setContentRange({
      resource: routeName,
      getCount: () => 10,
    }),
    (req, res) => {
      const data = [{
        dm: '1001',
        mc: '1单位',
      }, {
        dm: '1002',
        mc: '1单位1',
      }, {
        dm: '1003',
        mc: '2单位1',
      }, {
        dm: '1004',
        mc: '2单位2',
      }, {
        dm: '1005',
        mc: '23单位',
      }];
      res.json(data.map(item => ({
        id: item.dm,
        name: item.mc,
        ...item,
      })));
    });

  return router;
};
