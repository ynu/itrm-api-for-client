import EntityManager from 'entity-manager';

export default class AqzrManager extends EntityManager {
  constructor(db, collectionName = 'aqzr') {
    super(db, collectionName);
  }
}
