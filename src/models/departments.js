const EntityManager = require('entity-manager').default;

export default class DepartmentManager extends EntityManager {
  constructor(db, collectionName = 'departments') {
    super(db, collectionName);
  }
}
