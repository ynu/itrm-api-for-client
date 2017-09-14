import ResourceManager from './resource-manager';

export default class WebSiteManager extends ResourceManager {
  constructor(db, collectionName = 'websites') {
    super(db, collectionName);
  }
}
