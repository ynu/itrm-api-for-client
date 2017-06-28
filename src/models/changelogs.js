import EntityManager from 'entity-manager';

export default class ChangeLogManager extends EntityManager {
  constructor(db, collectionName = 'changelogs') {
    super(db, collectionName);
  }
}
