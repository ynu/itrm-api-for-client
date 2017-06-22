/*
 eslint-disable no-param-reassign, no-underscore-dangle
*/

import { Router } from 'express';
import cas from 'connect-cas';
import url from 'url';
import {webCallbackUrl, casServiceUrl} from '../config'

export default (options) => {
  const router = new Router();

  // cas.ssout                    : handle logout requests directly from the CAS server
  // cas.serviceValidate()        : validate service tickets received from the CAS server
  // cas.authenticate()           : request an authentication if the user is not authenticated
  router.get('/', cas.ssout('/auth'), cas.serviceValidate(), cas.authenticate(), async (req, res) => {
    // 从query中获取客户端回调url
    const redirect_uri = req.query.redirect_uri || webCallbackUrl;
    // 从cas的成功回调中获取用户基本信息
    let user = null;
    if (req.session.cas && req.session.cas.user) {
      user = req.session.cas.user;
    }
    res.redirect(301, redirect_uri);
    // res.json({cas: req.session.cas});
  });

  route.get('/test', async (req, res) => {
    res.json({webCallbackUrl, casServiceUrl});
  });

  router.get('/logout', async (req, res) => {
    if (req.session.destroy) {
      req.session.destroy();
    } else {
      req.session = null;
    }
    // return res.json({message: 'ok'});
    const options = cas.configure();
    console.info('options', options);
    const casAuthLogoutUrl = `${options.protocol}://${options.host}${options.paths.logout}`;
    console.info('casAuthLogoutUrl', casAuthLogoutUrl);
    // options.pathname = options.paths.logout;
    // return res.redirect(url.format(options));
    res.send(`
          <html>
            <head>
              <meta http-equiv="refresh" content="0; url=${casAuthLogoutUrl}" />
            </head>
          </html>
        `);
  });

  router.get('/user', async (req, res) => {
    let user = null;
    if (req.session.cas && req.session.cas.user) {
      user = req.session.cas.user;
    }
    res.json({ username: user });
  });


  return router;
};
