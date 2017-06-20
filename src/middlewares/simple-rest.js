/*
eslint-disable no-param-reassign
*/

/*
Simple REST 相关的中间件
/*

/*
格式化 GET_LIST 请求发来的 query 参数，并作为 mongodb 可用的参数输出
*/

export const formatQuery = ({
  handleFilter,
} = {}) => (req, res, next) => {
  handleFilter = handleFilter || (() => ({}));
  const { filter } = req.query;
  const range = JSON.parse(req.query.range);
  const [orderBy, direction] = JSON.parse(req.query.sort);
  req.mongoQuery = {
    sort: {
      [orderBy]: direction === 'DESC' ? 1 : -1,
    },
    skip: parseInt(range[0], 10),
    limit: (parseInt(range[1], 10) - parseInt(range[0], 10)) + 1,
    query: handleFilter(filter),
  };
  next();
};

export const setContentRange = ({
  resource,
  getCount,
} = {}) => async (req, res, next) => {
  let [start, end] = JSON.parse(req.query.range);
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

