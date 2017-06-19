/**
 * Babel Starter Kit (https://www.kriasoft.com/babel-starter-kit)
 *
 * Copyright © 2015-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import 'babel-polyfill';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { host, port, cookieKey, mongoUrl, error, info, sessionSecret } from './config';
import controllers from './controllers';
import session from 'express-session';
import cas from 'connect-cas';

cas.configure({
  protocol: 'http',
  host: 'ids.ynu.edu.cn',
  port: 80,
  paths: {
    validate: '/authserver/validate',
    serviceValidate: '/authserver/serviceValidate',
    login: '/authserver/login',
    logout: '/authserver/logout'
  }
});

const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(cookieParser(cookieKey));
app.use(session({
  secret: sessionSecret,
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  exposedHeaders: [
    'X-Total-Count',
  ],
}));

const morgan = require('morgan');

app.use(morgan('dev'));


MongoClient.connect(mongoUrl, (err, db) => {
  if (err) {
    error(err.message);
    return;
  }
  /*
  注册API
  */
  app.use('/route', controllers.route);
  app.use('/websites', controllers.websites({ db }));
  app.use('/departments', controllers.departments({ db }));
  app.use('/persons', controllers.persons());
  app.use('/auth', controllers.auth());
  app.listen(port, () => {
    console.log(`The server is running at http://${host}/`);
  });
});

