import EntityManager from 'entity-manager';

export default class DepartmentManager extends EntityManager {
  constructor(db, collectionName = 'departments') {
    super(db, collectionName);
  }
}
