import EntityManager from 'entity-manager';

export default class WebSiteManager extends EntityManager {
  constructor(db, collectionName = 'websites') {
    super(db, collectionName);
  }
}
