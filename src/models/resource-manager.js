/*
整合了AuditLog、Creation、ChangeLog功能的EntityManager

审核记录（AuditLog）数据结构：
{
  auditor: {}, // 审核者
  date, // Date, 审核日期
  status, // Number, 审核结果
  remark  // 备注
}

资源对象应当加上以下两个字段：
{
  ...
  latestAuditLog, // AuditLog
  auditLogs: [],  // AuditLog数组
}
*/


import EntityManager from 'entity-manager';

export default class ResourceManager extends EntityManager {

  /*
    添加AuditLog
    实现：在auditLogs中加入approvedData，把latestAuditLog更新为新的approvedData
  */
  addAuditLog(_id, approvedData) {
    if (!_id || !approvedData) throw new Error('必填系统id和approvedData');
    if (!approvedData.date) approvedData.date = new Date();
    return super.update({ _id }, {
      $addToSet: { auditLogs: approvedData },
      $set: { latestAuditLog: approvedData },
    });
  }
  async updateById(data) {
    return super.updateById(data);
  }
}
