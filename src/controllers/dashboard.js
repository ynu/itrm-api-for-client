/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';

import deptm from '../middlewares/departments';
import wsm from '../middlewares/websites';
import woam from '../middlewares/wechat-official-accounts';
import weibom from '../middlewares/weibo-accounts';
import emailm from '../middlewares/emails';
import auth from '../middlewares/auth';

export default (options) => {
  const { db } = options;

  const router = new Router();

  router.get('/',
    auth.currentUser({ db }),
    deptm.totalCount({
      db,
      getFilter: deptm.listFilter,
    }),
    wsm.totalCount({
      db,
      getFilter: wsm.listFilter,
    }),
    woam.totalCount({
      db,
      getFilter: woam.listFilter,
    }),
    weibom.totalCount({
      db,
      getFilter: weibom.listFilter,
    }),
    emailm.totalCount({
      db,
      getFilter: emailm.listFilter,
    }),
    async (req, res) => {
      const { departments, websites, wechatOfficialAccounts, weiboAccounts, emails } = req;
      res.json({
        departments,
        websites,
        wechatOfficialAccounts,
        weiboAccounts,
        emails,
      });
    }
  );
  return router;
};
