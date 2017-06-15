
/*
从request中获取jwt
 */
export const getToken = (req) => {
  if (req.query && req.query.token) {
    return req.query.token;
  }
  return '';
};
