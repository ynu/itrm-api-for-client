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
      success: (totalCount, req, res, next) => {
        req.departments = {
          ...req.departments,
          totalCount,
        };
        next();
      },
    }),
    wsm.totalCount({
      db,
      getFilter: wsm.listFilter,
      success: (totalCount, req, res, next) => {
        req.websites = {
          ...req.websites,
          totalCount,
        };
        next();
      },
    }),
    woam.totalCount({
      db,
      getFilter: woam.listFilter,
      success: (totalCount, req, res, next) => {
        req.wechatOfficialAccounts = {
          ...req.wechatOfficialAccounts,
          totalCount,
        };
        next();
      },
    }),
    weibom.totalCount({
      db,
      getFilter: weibom.listFilter,
      success: (totalCount, req, res, next) => {
        req.weiboAccounts = {
          ...req.weiboAccounts,
          totalCount,
        };
        next();
      },
    }),
    emailm.totalCount({
      db,
      getFilter: emailm.listFilter,
      success: (totalCount, req, res, next) => {
        req.emails = {
          ...req.emails,
          totalCount,
        };
        next();
      },
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
