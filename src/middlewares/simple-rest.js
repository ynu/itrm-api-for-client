/*
eslint-disable no-param-reassign
*/

/*
Simple REST 相关的中间件
/*

/*
格式化 GET_LIST 请求发来的 query 参数，并作为 mongodb 可用的参数输出
query参数包括：
- range 例如：[0, 9]
- sort 例如：["id","DESC"]
- filter 例如：{"q":"text"}
*/
export const formatQuery = (options = {}) => (req, res, next) => {
  const handleFilter = options.handleFilter || (() => ({}));
  const success = options.success || ((listOptions, req2, res2, next2) => {
    req2.mongoQuery = listOptions;
    next2();
  });
  const { filter } = req.query;
  const range = req.query.range ? JSON.parse(req.query.range) : [0, 10];
  const [orderBy, direction] = req.query.sort ? JSON.parse(req.query.sort) : ['id', 'DESC'];
  const listOptions = {
    sort: {
      [orderBy]: direction === 'DESC' ? 1 : -1,
    },
    skip: parseInt(range[0], 10),
    limit: (parseInt(range[1], 10) - parseInt(range[0], 10)) + 1,
    query: handleFilter(filter),
  };
  success(listOptions, req, res, next);
};

export const setContentRange = ({
  resource,
  getCount,
} = {}) => async (req, res, next) => {
  let [start, end] = req.query.range ? JSON.parse(req.query.range) : [0, 9];
  start = parseInt(start, 10);
  end = parseInt(end, 10);
  const count = await getCount(req, res);
  res.set('Content-Range', `${resource} ${start}-${end}/${count}`);
  next();
};

export default {
  formatQuery,
  setContentRange,
};

