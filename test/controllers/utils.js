// import chai from 'chai';
import { getApp } from '../../src/utils';
// import { port } from '../../src/config';
// import UirManager from '../../src/models/users-in-roles';
import { sysRoles } from '../../src/config';

export const supervisor = {
  id: 'test_suerpvisor',
  roles: [sysRoles.supervisor],
};
export const admin = {
  id: 'test_admin',
  roles: [sysRoles.admin],
};

export const getTestApp = async (port) => {
  const app = await getApp();
  app.get('/test-auth/:userId', (req, res) => {
    // eslint-disable-next-line
    req.session.cas = { 
      user: req.params.userId,
    };
    res.json({});
  });
  app.listen(port, () => {
    console.log(`The test server is running at port: ${port}`); // eslint-disable-line
  });
  return app;
};

export const generalUser = {
  id: 'generalUser',
};
export const generalUser2 = {
  id: 'generalUser2',
};
