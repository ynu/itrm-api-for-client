const EntityManager = require('entity-manager').default;

export default class AqzrManager extends EntityManager {
  constructor(db, collectionName = 'aqzr') {
    super(db, collectionName);
  }
}
