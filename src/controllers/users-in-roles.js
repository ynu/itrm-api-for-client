/*
 eslint-disable no-param-reassign
*/

import { Router } from 'express';
import expressJwt from 'express-jwt';
import { SUCCESS, UNAUTHORIZED,
  OBJECT_ALREADY_EXISTS } from 'nagu-validates';
import { secret } from '../config';
import { getToken, isMockVersion } from '../utils';
import UserInRole from '../models/user-in-role';

export default (options = {}) => {
  const { db } = options;
  const uir = new UserInRole({ db });

  const router = new Router();

// 根据appId和userId获取角色列表
  router.get('/roles/app/:appId/user/:userId',
  async (req, res) => {
    const { appId, userId } = req.params;
    try {
      const user = (await uir.userByUserId(appId, userId)) || {
        roles: [],
      };
      res.json({
        ret: SUCCESS,
        data: user.roles,
      });
    } catch (err) {
      res.json({
        ret: -1,
        msg: err.message,
      });
    }
  }
);

// 根据appId获取用户列表
  router.get('/users/app/:appId',
  // 确保用户已登录
  expressJwt({
    secret,
    credentialsRequired: true,
    getToken,
  }),
    async (req, res) => {
      const { appId } = req.params;
      const users = await uir.usersByAppId(appId);
      res.json({
        ret: SUCCESS,
        data: users,
      });
    }
);

// 创建新用户，并设置角色
  router.put('/users',
  // 确保用户已登录
  expressJwt({
    secret,
    credentialsRequired: true,
    getToken,
  }),
  async (req, res) => {
    const { appId, userId, role } = req.body;
    try {
      // 创建新用户
      const user = await uir.insertUser(appId, userId);
      // 设置角色
      if (role) await uir.addRole(appId, userId, role);

      res.json({
        ret: SUCCESS,
        data: {
          _id: user,
        },
      });
    } catch (e) {
      res.json({
        ret: -1,
        msg: e.message,
      });
    }
  }
);
};

