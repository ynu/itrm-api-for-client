const mockData = [{
  id: '2027001',
  name: '王六',
}, {
  id: '2027002',
  name: '张三',
}, {
  id: '2017003',
  name: '张思',
}, {
  id: '2017004',
  name: '王五',
}];

export default class PersonManager {
  getById(id) {
    console.log(id);
    return mockData.find(p => p.id === id);
  }
  manyByIds(ids) {
    console.log(ids);
    return mockData.filter(p => ids.some(id => id === p.id));
  }
}
