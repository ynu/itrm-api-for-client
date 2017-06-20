import DepartmentManger from '../models/departments';
import {totalCount as totalCountCommon, list as listCommon,
  getById as getByIdCommon, updateById as updateByIdCommon,
  deleteById as deleteByIdCommon} from './crud';

const defaultOptions = {
  entityManger: DepartmentManger,
  dataName: 'departments',
  whereQueryOrFields: ['zyfzr.id', 'bmscy.id', 'creation.creator.id'],
  whereCheckOrFields: [['bmscy','id'], ['creation','creator','id']]
}

export const totalCount = (options = {}) => {
  const mergedOptions = Object.assign({}, defaultOptions, options);
  return totalCountCommon(mergedOptions);
};

export const list = (options = {}) => {
  const mergedOptions = Object.assign({}, defaultOptions, options);
  return listCommon(mergedOptions);
};

export const getById = (options = {}) => {
  const mergedOptions = Object.assign({}, defaultOptions, options);
  return getByIdCommon(mergedOptions);
};

export const updateById = (options = {}) => {
  const mergedOptions = Object.assign({}, defaultOptions, options);
  return updateByIdCommon(mergedOptions);
};

export const deleteById = (options = {}) => {
  let mergedOptions = Object.assign({}, defaultOptions, options);
  return deleteByIdCommon(mergedOptions);
};

export default {
  totalCount,
  list,
};
