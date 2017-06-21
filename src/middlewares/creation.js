
/*
生成创建信息
*/
export const generateCreation = (options = {}) => (req, res, next) => {
  const getCreator = options.getCreator || (req2 => ({ id: req2.user.user }) || {});
  const success = options.success || ((creation, req2, res2, next2) => {
    req2.creation = creation;
    next2();
  });
  const creator = getCreator(req);
  success({
    creator,
    date: new Date(),
  }, req, res, next);
};

export default {
  generateCreation,
};
