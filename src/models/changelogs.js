const EntityManager = require('../entity-manager').default;

export default class ChangeLogManager extends EntityManager {
  constructor(db, collectionName = 'changelogs') {
    super(db, collectionName);
  }
}
