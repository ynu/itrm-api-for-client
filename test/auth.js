// import { expect } from 'chai';
// import { createMocks } from 'node-mocks-http';

// import { currentUser, signin, signout } from '../src/middlewares/auth';
// import { secret } from '../src/config';

// import signature from 'cookie-signature';

// describe('auth', () => {

//   const next = () => null;
//   describe('currentUser', () => {
//     it('用户未登录时，返回401', () => {

//       const { req, res } = createMocks();
//       currentUser()(req, res, next);
//       expect(res.statusCode).eql(401);
//     });
//     it('用户登录后，返回用户数据到 req.user', () => {
//       const signedUser = signature.sign(JSON.stringify({ id: 'test' }), secret);
//       const { req, res } = createMocks({
//         signedCookies: { user: signedUser },
//       });
//       currentUser()(req, res, next);
//       expect(req.user).is.ok;
//       expect(req.user.id).eql('test');
//     });
//   });

// });

// run();
