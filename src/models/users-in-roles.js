/*
UserInRole
一个用户和角色的对应表。结构如下：
{
  _id: ObjectId("5927910a436fb552219ba5eb"),
  user: {
    appId1: userId1,
    appId2: userId2
  },
  roles: [
    'app1:role1',
    'app1:role2',
    'app2:role1'
  ]
}
说明：
- 由于一个用户可能会在多个系统中共用，因此一个用户可能会具有多个不同的userid；
- 角色使用字符串形式，格式可自行定义；
- "_id" 是由MongoDB自动产生的，无实际用途。
*/


import { info } from '../config';

const EntityManager = require('entity-manager').default;

export default class UserInRole extends EntityManager {
  constructor(db, collectionName = 'users_in_roles') {
    super(db, collectionName);
  }

  // 添加用户
  async insertUser(appId, userId) {
    if (!appId || !userId) throw new Error('appId or userId must be provided.');
    const existedUser = await this.getUser(appId, userId);
    let uirId;
    if (existedUser) {
      // 进行更新
      info('Exist User:', existedUser);
      uirId = existedUser._id;
    } else {
      // 进行插入
      const result = await super.insert({
        user: { [appId]: userId },
      });
      info('insertUser Result:', result.insertedId);
      uirId = result.insertedId;
    }
    return uirId;
  }

  // 根据appId和userId获取用户
  getUser(appId, userId) {
    if (!appId || !userId) throw new Error('appId or userId must be provided.');
    const query = {
      user: { [appId]: userId },
    };
    info('findOne:', query);
    return super.findOne(query);
  }
  // 为指定用户添加角色
  async addRole(appId, userId, role) {
    if (!appId || !userId || !role) {
      throw new Error('appId, userId or role must be provided.');
    }
    const query = {
      user: { [appId]: userId },
    };
    const result = super.update(query, {
      $addToSet: { roles: role },
    });
    info('addRole Result: ', result);
    return true;
  }
  // 从指定用户删除角色
  async removeRole(appId, userId, role) {
    if (!appId || !userId || !role) {
      throw new Error('appId, userId or role must be provided.');
    }

    const existedUser = await this.getUser(appId, userId);
    if (!existedUser) throw new Error('user is not found');
    if (!existedUser.roles) throw new Error('no any role with this user');
    const updatedRoles = existedUser.roles.filter(r => r !== role);

    const query = {
      user: { [appId]: userId },
    };
    super.update(query, {
      $set: { roles: updatedRoles },
    });
    return true;
  }
  usersByAppId(appId) {
    const query = {
      [`user.${appId}`]: { $exists: true },
    };
    info('usersByAppId: ', query);
    return super.find({ query });
  }
  usersByRole(role) {
    const query = {
      roles: role,
    };
    info('usersByRole: ', query);
    return super.find({ query });
  }

  userByUserId(appId, userId) {
    const query = {
      [`user.${appId}`]: userId,
    };
    info('usersByUserId: ', query);
    return super.findOne({ query });
  }
}
