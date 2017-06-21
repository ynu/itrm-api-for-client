import DepartmentManger from '../models/departments';
import { totalCount as totalCountCommon, list as listCommon,
  getById as getByIdCommon, updateById as updateByIdCommon,
  deleteById as deleteByIdCommon } from './crud';

const defaultOptions = {
  entityManger: DepartmentManger,
  dataName: 'departments',
  whereQueryOrFields: ['zyfzr.id', 'bmscy.id', 'creation.creator.id'],
  whereCheckOrFields: [['bmscy', 'id'], ['creation', 'creator', 'id']],
};

export const totalCount = (options = {}) => totalCountCommon({
  ...defaultOptions,
  ...options,
});

export const list = (options = {}) => {
  const mergedOptions = Object.assign({}, defaultOptions, options);
  return listCommon(mergedOptions);
};

export const getById = (options = {}) => getByIdCommon({
  ...defaultOptions,
  ...options,
});

export const updateById = (options = {}) => updateByIdCommon({
  ...defaultOptions,
  ...options,
});

export const deleteById = (options = {}) => deleteByIdCommon({
  ...defaultOptions,
  ...options,
});

export default {
  totalCount,
  list,
  getById,
  updateById,
  deleteById,
};
