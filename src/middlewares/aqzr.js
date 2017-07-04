import AqzrManager from '../models/aqzr';
import { totalCount as totalCountCommon, list as listCommon,
  getById as getByIdCommon, updateById as updateByIdCommon,
  deleteById as deleteByIdCommon } from './crud';
import { isSupervisor, isAdmin, info, error } from '../config';

const defaultOptions = {
  entityManger: AqzrManager,
  dataName: 'aqzr',
  whereCheckOrFields: [['bmscy', 'id'], ['creation', 'creator', 'id']],
};

// 添加权限过滤
// 一条记录的查询条件仅限于：创建者、主要负责人、保密审查员。
export const listFilter = (req) => {
  if (!req.user) throw new Error('无法获取用户信息，请先执行中间件currrentUser');

  const { id, roles } = req.user;
  let filter = {};
  if (!isSupervisor(roles)) {
    filter = {
      'creation.creator.id': id,
    };
  }
  info('aqzr listFilter:', filter);
  return filter;
};

export const totalCount = (options = {}) => totalCountCommon({
  ...defaultOptions,
  ...options,
});

export const list = (options = {}) => listCommon({
  ...defaultOptions,
  ...options,
});

export const getById = (options = {}) => getByIdCommon({
  ...defaultOptions,
  ...options,
});

export const updateById = (options = {}) => {
  const mergedOptions = Object.assign({}, defaultOptions, options);
  return updateByIdCommon(mergedOptions);
};

export const deleteById = (options = {}) => deleteByIdCommon({
  ...defaultOptions,
  ...options,
});

export const collectData = (options = {}) => async (req, res, next) => {
  req.data = {};
  req.data.department = req.departments.list[0];
  req.data.websites = req.websites.list;
  req.data.weixins = req.wechatOfficialAccounts.list;
  req.data.weibos = req.weiboAccounts.list;
  req.data.emails = req.emails.list;
  next();
};

export default {
  totalCount,
  list,
  listFilter,
};
