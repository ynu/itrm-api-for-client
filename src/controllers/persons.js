/*
 eslint-disable no-param-reassign, no-undersocre-dangle
*/

import { Router } from 'express';
import { secret } from '../config';

const mockData = [{
  id: '2027001',
  name: '王六',
}, {
  id: '2027002',
  name: '张三',
}, {
  id: '2017003',
  name: '张思',
}, {
  id: '2017004',
  name: '王五',
}];
export default () => {
  const router = new Router();

  router.get('/', async (req, res) => {
    const { _start, _end, q } = req.query;
    const data = mockData.filter(p => p.name.includes(q) || p.id.includes(q))
        .slice(parseInt(_start, 10), parseInt(_end, 10));
    res.set('X-Total-Count', data.length);
    res.json(data);
  });

  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    res.json(mockData.find(p => p.id === id));
  });

  return router;
};
