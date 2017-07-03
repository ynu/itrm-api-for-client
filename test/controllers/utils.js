// import chai from 'chai';
import { getApp } from '../../src/utils';
import { port } from '../../src/config';

export const getTestApp = async () => {
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


// const supervisor = {
//   id: 'suerpvisor',
//   roles: [sysRoles.supervisor],
// };
// const admin = {
//   id: 'admin',
//   roles: [sysRoles.admin],
// };
