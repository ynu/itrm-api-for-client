/*
修改记录 中间件
*/

import * as crud from './crud';
import ChnageLogManager from '../models/changelogs';

/*
添加修改记录
*/
export const insert = (options) => {
  if (!options.manager) {
    if (options.db) options.manager = new ChnageLogManager(options.db);
  } else {
    throw new Error('必须指定manager或db参数');
  }
  return crud.insert({
    success: (id, req, res, next) => {
      res.changeLogId = id;
      next();
    },
    ...options,
  });
};
