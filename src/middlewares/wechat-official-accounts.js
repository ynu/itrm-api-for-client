import WechatOfficialAccountManager from '../models/wechat-official-accounts';
import { totalCount as totalCountCommon, list as listCommon,
  getById as getByIdCommon, updateById as updateByIdCommon,
  deleteById as deleteByIdCommon } from './crud';

const defaultOptions = {
  entityManger: WechatOfficialAccountManager,
  dataName: 'wechatOfficialAccounts',
  whereQueryOrFields: ['manager.id', 'creation.creator.id'],
  whereCheckOrFields: [['manager', 'id'], ['creation', 'creator', 'id']],
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

export default {
  totalCount,
  list,
};
