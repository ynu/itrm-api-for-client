import EntityManager from 'entity-manager';

export default class EmailManager extends EntityManager {
  constructor(db, collectionName = 'emails') {
    super(db, collectionName);
  }
}
