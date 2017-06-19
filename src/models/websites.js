const EntityManager = require('entity-manager').default;

export default class WebSiteManager extends EntityManager {
  constructor(db, collectionName = 'websites') {
    super(db, collectionName);
  }
}
