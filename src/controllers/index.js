import route from './route';

const websites = require('./websites').default;
const departments = require('./departments').default;
const persons = require('./persons').default;
const auth = require('./auth').default;

export default {
  route,
  websites,
  departments,
  persons,
  auth,
};
