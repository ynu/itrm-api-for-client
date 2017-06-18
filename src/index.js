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
import { host, port, cookieKey, mongoUrl, error, info } from './config';
import controllers from './controllers';

const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(cookieParser(cookieKey));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  exposedHeaders: [
    'X-Total-Count',
    'Content-Range',
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

