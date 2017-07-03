import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import morgan from 'morgan';
import session from 'express-session';
import { cookieKey, mongoUrl, error, sessionSecret } from './config';
import controllers from './controllers/index';


/*
从request中获取jwt
 */
export const getToken = (req) => {
  if (req.query && req.query.token) {
    return req.query.token;
  }
  return '';
};

export const getMongoDb = () => new Promise((resolve, reject) => {
  MongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
      error(err.message);
      reject(err);
      return;
    }
    resolve(db);
  });
});

export const getApp = async () => {
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
  app.use(morgan('dev'));
  app.use(cors({
    origin: true,
    exposedHeaders: [
      'X-Total-Count',
      'Content-Range',
    ],
    credentials: true,
  }));
  // https://github.com/expressjs/cors
  app.options('*', cors()); // include before other routes

  /*
  通过controlers 文件夹注册API
  */
  const db = await getMongoDb();
  Object.entries(controllers).forEach(([routeName, getRoute]) => {
    app.use(`/${routeName}`, getRoute({
      db,
      routeName,
    }));
  });

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
  }
  return app;
};
