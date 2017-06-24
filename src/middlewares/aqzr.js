import AqzrManager from '../models/aqzr';
import { totalCount as totalCountCommon, list as listCommon,
  getById as getByIdCommon, updateById as updateByIdCommon,
  deleteById as deleteByIdCommon } from './crud';

const defaultOptions = {
  entityManger: AqzrManager,
  dataName: 'aqzr',
  whereCheckOrFields: [['bmscy', 'id'], ['creation', 'creator', 'id']],
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
};
