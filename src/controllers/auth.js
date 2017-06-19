/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';
import cas from 'connect-cas';

export default (options) => {

  const router = new Router();

  // cas.ssout                    : handle logout requests directly from the CAS server
  // cas.serviceValidate()        : validate service tickets received from the CAS server
  // cas.authenticate()           : request an authentication if the user is not authenticated
  router.get('/', cas.ssout('/auth'), cas.serviceValidate(), cas.authenticate(), async (req, res) => {
    // 从query中获取客户端回调url
    let redirect_uri = req.query.redirect_uri || 'http://itrs-web.itrm.ynu.edu.cn:3000/callback';
    // 从cas的成功回调中获取用户基本信息
    let user = null;
    if (req.session.cas && req.session.cas.user) {
      user = req.session.cas.user;
    }
    res.redirect(301, redirect_uri);
  });


  return router;
};
