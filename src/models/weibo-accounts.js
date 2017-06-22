import EntityManager from 'entity-manager';

export default class WeiboAccountManager extends EntityManager {
  constructor(db, collectionName = 'weibo_accounts') {
    super(db, collectionName);
  }
}
