import debug from 'debug';

const pkg = require('../package.json');

// debug
export const error = debug(`${pkg.name}:error`);
export const info = debug(`${pkg.name}:info`);

export const port = process.env.PORT || 4000;

export const host = process.env.WEBSITE_HOSTNAME || `localhost:${port}`;

export const cookieKey = process.env.COOKIE_KEY || 'my cookie key';

export const sessionSecret = process.env.SESSION_SECRET || 'my session secret';

export const secret = process.env.SECRET || 'secret';

// mongoUrl see https://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#the-url-connection-format
export const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost';

export const casSecretKey = process.env.YNU_CAS_SECRET_KEY || 'my cas secret key';

export const webCallbackUrl = process.env.WEB_CALLBACK_URL || 'http://itrm.ynu.edu.cn:3000/';

export const casServiceUrl = process.env.CAS_SERVICE_URL || 'http://api.itrm.ynu.edu.cn:4000/auth/';

export const hrHost = process.env.HR_HOST || 'http://ynu-hr-api.ynu.edu.cn';

// 资源类型
export const resources = {
  DEPARTMENTS: 'departments',
  WEBSITES: 'websites',
  WECHAT_OFFICIAL_ACCOUNTS: 'wechat-official-accounts',
  WEIBO_ACCOUNTS: 'weibo-accounts',
  EMAILS: 'emails',
  AQZR: 'aqzr',
};

// 修改日志的类型
export const changeLogTypes = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

// 角色系统
export const sysRoles = {
  admin: 'itrm:admin',  // 超级管理员
  supervisor: 'itrm:supervisor',  // 仅具有查看权限的超级用户
  deptManager: 'itrm:dept-manager', // 部门管理员
  resourceManager: 'itrm:resource-manager', // 资源管理员
};

export const isAdmin = roles => Array.isArray(roles) && roles.includes(sysRoles.admin);

export const isSupervisor = roles => Array.isArray(roles) && (isAdmin(roles) || roles.includes(sysRoles.supervisor));
