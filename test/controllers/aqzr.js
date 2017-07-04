import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { getTestApp, generalUser, generalUser2, supervisor, admin } from './utils';
import { getMongoDb } from '../../src/utils';
import UirManager from '../../src/models/users-in-roles';

chai.use(chaiHttp);
let app;
getTestApp(4201).then((testApp) => {
  app = testApp;
  run();
});
const controller = 'aqzr';

// 多个用户登录
[
  generalUser,
  generalUser2,
  // supervisor,
  // admin,
].map(user => describe(`${controller} controller, user: ${user.id}`, () => {
  let agent;
  before(async () => {
    agent = chai.request.agent(app);
    // 用户登录
    await agent.get(`/test-auth/${user.id}`);
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
    agent.post(`/${controller}`).send(dept).then((res) => {
      expect(res).to.have.status(200);
      const result = JSON.parse(res.text);
      expect(result.id).is.ok;
      newIds.push(result.id);
      done();
    });
  }));

  it('GET 获取列表，仅能获取自己具有权限的', (done) => {
    agent.get(`/${controller}`).query({
      sort: JSON.stringify(['id', 'ASC']),
      range: JSON.stringify([0, 1]),
    }).end((err, res) => {
      expect(res).to.have.status(200);
      const result = JSON.parse(res.text);
      expect(result.length).is.eql(2);
      expect(res).to.have.header('Content-Range', `${controller} 0-1/3`);
      done();
    });
  });

  it('PUT 修改数据', async () => {
    const res = await agent.put(`/${controller}/${newIds[0]}`).send({
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
    const res = await agent.get(`/${controller}/${newIds[0]}`);
    expect(res).to.have.status(200);
    const result = JSON.parse(res.text);
    expect(result.dept.id).is.eql('1002');
  });
  it('DELETE 删除数据', async () => {
    newIds.forEach(async (id) => {
      const res = await agent.delete(`/${controller}/${id}`);
      expect(res).to.have.status(200);
    });
  });

  it('GET 获取列表，删除后应该没有数据', (done) => {
    agent.get(`/${controller}`).query().end((err, res) => {
      expect(res).to.have.status(200);
      const result = JSON.parse(res.text);
      expect(result.length).is.eql(0);
      done();
    });
  });
}));

describe(`未登录用户：${controller} controller`, () => {
  let agent;
  before(() => {
    agent = chai.request.agent(app);
  });

  // 所有操作返回401
  [
    () => agent.get(`/${controller}`),
    () => agent.get(`/${controller}/34322`),
    () => agent.post(`/${controller}`),
    () => agent.put(`/${controller}/dfsfsf`),
    () => agent.delete(`/${controller}/sdfsdf`),
  ].map(getReq => it('未登录用户CRUD', (done) => {
    getReq().end((err, res) => {
      expect(res).to.have.status(401);
      done();
    });
  }));
});

describe(`Supervisor - ${controller} controller`, () => {
  let agent;
  // let newId;
  let newIds = [];
  before(async () => {

    // 设置测试用的管理员的角色
    const db = await getMongoDb();
    const uirm = new UirManager(db);
    supervisor._id = await uirm.insert({
      user: { ynu_cas: supervisor.id },
      roles: supervisor.roles,
    });

    const generalUserAgent = chai.request.agent(app);
    // 用户登录
    await generalUserAgent.get('/test-auth/test1');

    // 输入测试数据
    newIds = await Promise.all([
      {
        dept: { id: '1001' },
        zyfzr: { id: '101' },
        bmscy: { id: '101' },
        manager: { id: '102' },
      }, {
        dept: { id: '1001' },
        zyfzr: { id: '101' },
        bmscy: { id: '102' },
        manager: { id: '101' },
      }, {
        dept: { id: '1001' },
        zyfzr: { id: '101' },
        bmscy: { id: '102' },
        manager: { id: '101' },
      },
    ].map(async (dept) => {
      const res = await generalUserAgent.post(`/${controller}`).send(dept);
      const result = JSON.parse(res.text);
      return result.id;
    }));

    agent = chai.request.agent(app);
    // 用户登录
    await agent.get(`/test-auth/${supervisor.id}`);
  });
  it('GET 获取列表，可获取所有数据', (done) => {
    agent.get(`/${controller}`).query({
      sort: JSON.stringify(['id', 'ASC']),
      range: JSON.stringify([0, 1]),
    }).end((err, res) => {
      expect(res).to.have.status(200);
      const result = JSON.parse(res.text);
      expect(result.length).is.eql(2);
      expect(res).to.have.header('Content-Range', `${controller} 0-1/3`);
      done();
    });
  });

  it('GET 获取单个数据', async () => {
    const res = await agent.get(`/${controller}/${newIds[0]}`);
    expect(res).to.have.status(200);
    const result = JSON.parse(res.text);
    expect(result.dept.id).is.eql('1001');
  });

  it('PUT 返回 403', (done) => {
    agent.put(`/${controller}/${newIds[0]}`).send({ dept: '101' }).end((err, res) => {
      expect(res).to.have.status(403);
      done();
    });
  });

  it('DELETE 返回403', (done) => {
    agent.delete(`/${controller}/${newIds[0]}`).end((err, res) => {
      expect(res).to.have.status(403);
      done();
    });
  });

  after(async () => {
    const db = await getMongoDb();
    const uirm = new UirManager(db);
    await uirm.removeById(supervisor._id);

    const generalUserAgent = chai.request.agent(app);
    // 用户登录
    await generalUserAgent.get('/test-auth/test1');
    newIds.forEach(async (id) => {
      const res = await generalUserAgent.delete(`/${controller}/${id}`);
      expect(res).to.have.status(200);
    });
  });
});


describe(`Admin - ${controller} controller`, () => {
  let agent;
  let newIds = [];
  before(async () => {

    // 设置测试用的管理员的角色
    const db = await getMongoDb();
    const uirm = new UirManager(db);
    admin._id = await uirm.insert({
      user: { ynu_cas: admin.id },
      roles: admin.roles,
    });

    const generalUserAgent = chai.request.agent(app);
    // 用户登录
    await generalUserAgent.get('/test-auth/admin_test1');

    // 输入测试数据
    newIds = await Promise.all([
      {
        dept: { id: '1001' },
        zyfzr: { id: '101' },
        bmscy: { id: '101' },
        manager: { id: '102' },
      }, {
        dept: { id: '1001' },
        zyfzr: { id: '101' },
        bmscy: { id: '102' },
        manager: { id: '101' },
      }, {
        dept: { id: '1001' },
        zyfzr: { id: '101' },
        bmscy: { id: '102' },
        manager: { id: '101' },
      },
    ].map(async (dept) => {
      const res = await generalUserAgent.post(`/${controller}`).send(dept);
      const result = JSON.parse(res.text);
      return result.id;
    }));

    agent = chai.request.agent(app);
    // 用户登录
    await agent.get(`/test-auth/${admin.id}`);
  });
  it('GET 获取列表，可获取所有数据', (done) => {
    agent.get(`/${controller}`).query({
      sort: JSON.stringify(['id', 'ASC']),
      range: JSON.stringify([0, 1]),
    }).end((err, res) => {
      expect(res).to.have.status(200);
      const result = JSON.parse(res.text);
      expect(result.length).is.eql(2);
      expect(res).to.have.header('Content-Range', `${controller} 0-1/3`);
      done();
    });
  });

  it('GET 获取单个数据', async () => {
    const res = await agent.get(`/${controller}/${newIds[0]}`);
    expect(res).to.have.status(200);
    const result = JSON.parse(res.text);
    expect(result.dept.id).is.eql('1001');
  });

  it('PUT 修改数据', async () => {
    const res = await agent.put(`/${controller}/${newIds[0]}`).send({
      dept: { id: '1002' },
      zyfzr: { id: '101' },
      bmscy: { id: '102' },
      manager: { admin },
    });
    expect(res).to.have.status(200);
    const result = JSON.parse(res.text);
    expect(result.id).is.ok;
  });

  it('GET 获取修改后的数据', async () => {
    const res = await agent.get(`/${controller}/${newIds[0]}`);
    expect(res).to.have.status(200);
    const result = JSON.parse(res.text);
    expect(result.dept.id).is.eql('1002');
  });

  it('DELETE 删除数据', async () => {
    newIds.forEach(async (id) => {
      const res = await agent.delete(`/${controller}/${id}`);
      expect(res).to.have.status(200);
    });
  });

  it('GET 获取列表，删除后应该没有数据', (done) => {
    agent.get(`/${controller}`).query().end((err, res) => {
      expect(res).to.have.status(200);
      const result = JSON.parse(res.text);
      expect(result.length).is.eql(0);
      done();
    });
  });

  after(async () => {
    const db = await getMongoDb();
    const uirm = new UirManager(db);
    await uirm.removeById(admin._id);
  });
});
