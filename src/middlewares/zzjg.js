import { error } from '../config';
import ZzjgManager from '../models/zzjg';

const zzjgm = new ZzjgManager();

// 读取层次为2的组织机构信息
export const list = (options = {}) => async (req, res, next) => {
  const success = options.success || ((zzjg, req2, res2, next2) => {
    req2.zzjg = {
      ...req2.zzjg,
      list: zzjg,
    };
    next2();
  });
  const fail = options.fail || ((err, req2, res2) => {
    error('zzjg middlewares listcc2 error:', err.message);
    res2.status(500).end(err.message);
  });
  try {
    const data = await zzjgm.list();
    success(data, req, res, next);
  } catch (e) {
    fail(e, req, res, next);
  }
};
