import WebsiteManager from '../models/websites';
import { totalCount as totalCountCommon, list as listCommon,
  getById as getByIdCommon, updateById as updateByIdCommon,
  deleteById as deleteByIdCommon } from './crud';

const defaultOptions = {
  entityManger: WebsiteManager,
  dataName: 'websites',
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

export const getById = (options = {}) => {
  const mergedOptions = Object.assign({}, defaultOptions, options);
  return getByIdCommon(mergedOptions);
};

export const updateById = (options = {}) => {
  const mergedOptions = Object.assign({}, defaultOptions, options);
  return updateByIdCommon(mergedOptions);
};

export const deleteById = (options = {}) => {
  const mergedOptions = Object.assign({}, defaultOptions, options);
  return deleteByIdCommon(mergedOptions);
};

export default {
  totalCount,
  list,
};
