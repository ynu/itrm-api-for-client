/*
 eslint-disable no-param-reassign
*/

import { Router } from 'express';
import expressJwt from 'express-jwt';
import { getToken } from '../utils';
import { secret } from '../config';

const expressJwtOptions = {
  secret,
  credentialsRequired: true,
  getToken,
};

const router = new Router();

router.get('/', (req, res) => {
  res.send({ ret: 0, data: 'hell, world' });
});

router.get('/secret',
  expressJwt(expressJwtOptions),
  (req, res) => {
    res.send({ ret: 0, data: 'hell, secret' });
  }
);

export default router;
