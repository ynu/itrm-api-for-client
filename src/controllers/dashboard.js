/*
 eslint-disable no-param-reassign, no-underscore-dangle, import/no-named-as-default-member
*/

import { Router } from 'express';

import deptm from '../middlewares/departments';
import wsm from '../middlewares/websites';
import woam from '../middlewares/wechat-official-accounts';
import weibom from '../middlewares/weibo-accounts';
import emailm from '../middlewares/emails';
import aqzrm from '../middlewares/aqzr';
import auth from '../middlewares/auth';
import { list as zzjgList } from '../middlewares/zzjg';

export default (options) => {
  const { db } = options;

  const router = new Router();

  router.get('/',
    auth.currentUser({ db }),
    zzjgList(),
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
    aqzrm.totalCount({
      db,
      getFilter: aqzrm.listFilter,
      success: (totalCount, req, res, next) => {
        req.aqzr = {
          ...req.aqzr,
          totalCount,
        };
        next();
      },
    }),
    // 获取websites列表
    wsm.list({
      db,
      getQueryOptions: req => ({
        limit: 1000,
        query: wsm.listFilter(req),
      }),
      success: (list, req, res, next) => {
        req.websites = {
          ...req.websites,
          list,
        };
        next();
      },
    }),
    woam.list({
      db,
      getQueryOptions: req => ({
        limit: 1000,
        query: woam.listFilter(req),
      }),
      success: (list, req, res, next) => {
        req.wechatOfficialAccounts = {
          ...req.wechatOfficialAccounts,
          list,
        };
        next();
      },
    }),
    weibom.list({
      db,
      getQueryOptions: req => ({
        limit: 1000,
        query: weibom.listFilter(req),
      }),
      success: (list, req, res, next) => {
        req.weiboAccounts = {
          ...req.weiboAccounts,
          list,
        };
        next();
      },
    }),
    emailm.list({
      db,
      getQueryOptions: req => ({
        limit: 1000,
        query: emailm.listFilter(req),
      }),
      success: (list, req, res, next) => {
        req.emails = {
          ...req.emails,
          list,
        };
        next();
      },
    }),
    aqzrm.list({
      db,
      getQueryOptions: req => ({
        limit: 1000,
        query: aqzrm.listFilter(req),
      }),
      success: (list, req, res, next) => {
        req.aqzr = {
          ...req.aqzr,
          list,
        };
        next();
      },
    }),
    (req, res, next) => {
      const { websites, wechatOfficialAccounts, weiboAccounts, emails, aqzr } = req;
      const countOne = (acc, cur, propertyName) => {
        let stat = acc.find(s => s.dept.id === cur.dept.id);
        if (stat) {
          stat[propertyName] += 1;
        } else {
            // 补齐dept的资料
          if (!cur.dept.name) {
            const jg = req.zzjg.list.find(j => j.dm === cur.dept.id) || { mc: '未知单位' };
            cur.dept = {
              ...cur.dept,
              name: jg.mc,
            };
          }
          stat = {
            websites: 0,
            wechatOfficialAccounts: 0,
            weiboAccounts: 0,
            emails: 0,
            aqzr: 0,
            dept: cur.dept,
          };
          stat[propertyName] += 1;
          acc.push(stat);
        }
        return acc;
      };
      let countByDept = [];
      countByDept = websites.list.reduce((acc, cur) => countOne(acc, cur, 'websites'), countByDept);
      countByDept = wechatOfficialAccounts.list.reduce((acc, cur) => countOne(acc, cur, 'wechatOfficialAccounts'), countByDept);
      countByDept = weiboAccounts.list.reduce((acc, cur) => countOne(acc, cur, 'weiboAccounts'), countByDept);
      countByDept = emails.list.reduce((acc, cur) => countOne(acc, cur, 'emails'), countByDept);
      countByDept = aqzr.list.reduce((acc, cur) => countOne(acc, cur, 'aqzr'), countByDept);
      countByDept.sort((a, b) => {
        if (a.dept.id > b.dept.id) return 1;
        return -1;
      });
      req.countByDept = countByDept;
      next();
    },
    async (req, res) => {
      const { departments, websites, wechatOfficialAccounts, weiboAccounts, emails, countByDept } = req;
      res.json({
        departments,
        websites,
        wechatOfficialAccounts,
        weiboAccounts,
        emails,
        countByDept,
      });
    }
  );
  return router;
};
