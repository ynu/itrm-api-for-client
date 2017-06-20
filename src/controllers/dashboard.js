/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';

const deptm = require('../middlewares/departments').default;
const wsm = require('../middlewares/websites').default;
const woam = require('../middlewares/wechat-official-accounts').default;
const weibom = require('../middlewares/weibo-accounts').default;
const emailm = require('../middlewares/emails').default;
const auth = require('../middlewares/auth').default;

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
