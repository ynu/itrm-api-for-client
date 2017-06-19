const EntityManager = require('entity-manager').default;

export default class EmailManager extends EntityManager {
  constructor(db, collectionName = 'emails') {
    super(db, collectionName);
  }
}
