const EntityManager = require('entity-manager').default;

export default class WebChatOfficialAccountManager extends EntityManager {
  constructor(db, collectionName = 'wechat_official_accounts') {
    super(db, collectionName);
  }
}
