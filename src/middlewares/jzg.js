import { error } from '../config';
import JzgManager from '../models/jzg';

const jzgm = new JzgManager();

export const getById = (options = {}) => async (req, res, next) => {
  const getId = options.getId || (() => null);
  const success = options.success || ((jzg, req2, res2, next2) => {
    req2.jzg = {
      ...req2.jzg,
      getById: jzg,
    };
    next2();
  });
  const fail = options.fail || ((err, req2, res2) => {
    error('jzg middlewares getById error:', err.message);
    res2.status(500).end(err.message);
  });
  try {
    const id = getId(req);
    const data = await jzgm.getById(id);
    success(data, req, res, next);
  } catch (e) {
    fail(e, req, res, next);
  }
};
