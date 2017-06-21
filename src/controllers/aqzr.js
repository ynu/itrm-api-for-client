/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';
import { formatQuery, setContentRange } from '../middlewares/simple-rest';

const AqzrManager = require('../models/aqzr').default;
const { generateCreation } = require('../middlewares/creation').default;
const { currentUser } = require('../middlewares/auth').default;
const { list, totalCount, getById, updateById, deleteById } = require('../middlewares/aqzr');

export default (options) => {
  const { db, routeName } = options;
  const aqzrm = new AqzrManager(db);

  const router = new Router();

  router.get('/',
    currentUser({ db }),
    formatQuery(),
    list({ db }),
    totalCount({ db }),
    setContentRange({
      resource: routeName,
      getCount: req => req.aqzr.totalCount,
    }),
    (req, res) => {
      const data = req.aqzr.list;
      res.json(data.map(({ _id, ...other }) => ({
        id: _id,
        ...other,
      })));
    });

  router.get('/:id',
    currentUser(),
    getById({ db }),
  );

  router.post('/',
    currentUser(),
    generateCreation(),
  async (req, res) => {
    const manager = {
      id: req.user.id,
    };
    const id = await aqzrm.insert({
      creation: req.creation,
      manager,
      ...req.body,
    });
    res.json({ id });
  }
  );

  router.put('/:id',
    currentUser(),
    updateById({ db }),
  );

  router.delete('/:id',
    currentUser(),
    deleteById({ db }),
  );


  return router;
};
