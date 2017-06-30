import DepartmentManger from '../models/departments';
import { totalCount as totalCountCommon, list as listCommon,
  getById as getByIdCommon, updateById as updateByIdCommon,
  deleteById as deleteByIdCommon, insert as insertCommon } from './crud';
import { isSupervisor } from '../config';

const defaultOptions = {
  entityManger: DepartmentManger,
  dataName: 'departments',
  whereQueryOrFields: ['zyfzr.id', 'bmscy.id', 'creation.creator.id'],
  whereCheckOrFields: [['bmscy', 'id'], ['creation', 'creator', 'id']],
};

// 添加权限过滤
// 一条记录的查询条件仅限于：创建者、主要负责人、保密审查员。
export const getFilter = (req) => {
  if (!req.user) throw new Error('无法获取用户信息，请先执行中间件currrentUser');

  const { id, roles } = req.user;
  if (isSupervisor(roles)) {
    return {};
  }
  return {
    $or: [
      { 'creation.creator.id': id },
      { 'zyfzr.id': id },
      { 'bmscy.id': id },
    ],
  };
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

export const updateById = (options = {}) => updateByIdCommon({
  ...defaultOptions,
  ...options,
});

export const deleteById = (options = {}) => deleteByIdCommon({
  ...defaultOptions,
  ...options,
});

export const insert = (options = {}) => insertCommon({
  ...defaultOptions,
  ...options,
});

export default {
  totalCount,
  list,
  getById,
  updateById,
  deleteById,
  insert,
  getFilter,
};
