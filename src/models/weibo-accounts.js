const EntityManager = require('entity-manager').default;

export default class WeiboAccountManager extends EntityManager {
  constructor(db, collectionName = 'weibo_accounts') {
    super(db, collectionName);
  }
}
