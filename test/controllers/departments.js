import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { getApp } from '../../src/utils';
import { port, sysRoles } from '../../src/config';

chai.use(chaiHttp);
let app;
(async () => {
  app = await getApp();
  app.get('/test-auth/:userId', (req, res) => {
    req.session.cas = {
      user: req.params.userId,
    };
    res.json({});
  });
  app.listen(port, () => {
    console.log(`The test server is running at port: ${port}`);
    run();
  });
})();

const generalUser = {
  id: 'generalUser',
};
const generalUser2 = {
  id: 'generalUser2',
};
// const supervisor = {
//   id: 'suerpvisor',
//   roles: [sysRoles.supervisor],
// };
// const admin = {
//   id: 'admin',
//   roles: [sysRoles.admin],
// };


// 多个用户登录
[
  generalUser,
  generalUser2,
  // supervisor,
  // admin,
].map(user => describe(`departments controller, user: ${user.id}`, () => {
  let agent;
  before((done) => {
    agent = chai.request.agent(app);

    // 用户登录
    agent.get(`/test-auth/${user.id}`).end(done);
  });

  const newIds = [];
  // 添加一批数据
  [
    {
      dept: { id: '1001' },
      zyfzr: user,
      bmscy: { id: '101' },
      manager: { id: '102' },
    }, {
      dept: { id: '1001' },
      zyfzr: { id: '101' },
      bmscy: user,
      manager: { id: '102' },
    }, {
      dept: { id: '1001' },
      zyfzr: { id: '101' },
      bmscy: { id: '102' },
      manager: user,
    },
  ].map(dept => it('POST 添加数据', (done) => {
    agent.post('/departments').send(dept).then((res) => {
      expect(res).to.have.status(200);
      const result = JSON.parse(res.text);
      expect(result.id).is.ok;
      newIds.push(result.id);
      done();
    });
  }));

  it('GET 获取列表，仅能获取自己具有权限的', (done) => {
    agent.get('/departments').query({
      sort: JSON.stringify(['id', 'ASC']),
      range: JSON.stringify([0, 1]),
    }).end((err, res) => {
      expect(res).to.have.status(200);
      const result = JSON.parse(res.text);
      expect(result.length).is.eql(2);
      expect(res).to.have.header('Content-Range', 'departments 0-1/3');
      done();
    });
  });

  it('PUT 修改数据', async () => {
    const res = await agent.put(`/departments/${newIds[0]}`).send({
      dept: { id: '1002' },
      zyfzr: { id: '101' },
      bmscy: { id: '102' },
      manager: user,
    });
    expect(res).to.have.status(200);
    const result = JSON.parse(res.text);
    expect(result.id).is.ok;
  });
  it('GET 获取修改后的数据', async () => {
    const res = await agent.get(`/departments/${newIds[0]}`);
    expect(res).to.have.status(200);
    const result = JSON.parse(res.text);
    expect(result.dept.id).is.eql('1002');
  });
  it('DELETE 删除数据', async () => {
    newIds.forEach(async (id) => {
      const res = await agent.delete(`/departments/${id}`);
      expect(res).to.have.status(200);
    });
  });

  it('GET 获取列表，删除后应该没有数据', (done) => {
    agent.get('/departments').query().end((err, res) => {
      expect(res).to.have.status(200);
      const result = JSON.parse(res.text);
      expect(result.length).is.eql(0);
      done();
    });
  });
}));

describe('未登录用户：departments controller', () => {
  let agent;
  before(() => {
    agent = chai.request.agent(app);
  });

  // 所有操作返回401
  [
    () => agent.get('/departments'),
    () => agent.get('/departments/34322'),
    () => agent.post('/departments'),
    () => agent.put('/departments/dfsfsf'),
    () => agent.delete('/departments/sdfsdf'),
  ].map(getReq => it('opteartion', (done) => {
    getReq().end((err, res) => {
      expect(res).to.have.status(401);
      done();
    });
  }));
});
