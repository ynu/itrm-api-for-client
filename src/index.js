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
import cors from 'cors';
import { MongoClient } from 'mongodb';
// import morgan from 'morgan';
import session from 'express-session';
import cas from 'connect-cas';
import { host, port, cookieKey, mongoUrl, error, info, sessionSecret } from './config';
import controllers from './controllers/index';


cas.configure({
  protocol: 'http',
  host: 'ids.ynu.edu.cn',
  port: 80,
  paths: {
    validate: '/authserver/validate',
    serviceValidate: '/authserver/serviceValidate',
    login: '/authserver/login',
    logout: '/authserver/logout',
  },
});


const app = express();

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(cookieParser(cookieKey));
app.use(session({
  secret: sessionSecret,
  resave: true,
  saveUninitialized: true,
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: true,
  exposedHeaders: [
    'X-Total-Count',
    'Content-Range',
  ],
  credentials: true,
}));

const morgan = require('morgan');
app.use(morgan('dev'));

// https://github.com/expressjs/cors
app.options('*', cors()); // include before other routes
MongoClient.connect(mongoUrl, (err, db) => {
  if (err) {
    error(err.message);
    return;
  }
  /*
  通过controlers 文件夹注册API
  */
  Object.entries(controllers).forEach(([routeName, getRoute]) => {
    app.use(`/${routeName}`, getRoute({
      db,
      routeName,
    }));
  });
  app.listen(port, () => {
    console.log(`The server is running at http://${host}/`);
  });
});


// error handling, see http://expressjs.com/en/guide/error-handling.html and
// https://derickbailey.com/2014/09/06/proper-error-handling-in-expressjs-route-handlers/

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err,
    });
  });


  // see https://github.com/nwjs/nw.js/issues/1699#issuecomment-84861481
  // see https://nodejs.org/api/process.html
  process.on('uncaughtException', (error) => {
    // console.group('Node uncaughtException');
    console.log('uncaughtException', error);
    // console.groupEnd();
  });
  process.on('unhandledRejection', (error) => {
    // console.group('Node unhandledRejection');
    console.log('unhandledRejection', error);
    // console.groupEnd();
  });
  process.on('rejectionHandled', (error) => {
    // console.group('Node rejectionHandled');
    console.log('rejectionHandled', error);
    // console.groupEnd();
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

