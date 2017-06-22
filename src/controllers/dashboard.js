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
    auth.currentUser(),
    deptm.totalCount({ db }),
    wsm.totalCount({ db }),
    woam.totalCount({ db }),
    weibom.totalCount({ db }),
    emailm.totalCount({ db }),
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
