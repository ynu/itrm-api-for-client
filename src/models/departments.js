import ResourceManager from './resource-manager';

export default class DepartmentManager extends ResourceManager {
  constructor(db, collectionName = 'departments') {
    super(db, collectionName);
  }
}
