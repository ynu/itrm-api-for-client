import { expect } from 'chai';
import { createMocks } from 'node-mocks-http';
import { formatQuery, setContentRange } from '../src/middlewares/simple-rest';

describe('simple-rest', () => {

  const next = () => null;
  describe('formatQuery', () => {
    it('GET_LIST', () => {
      const query = {
        sort: JSON.stringify(['title', 'ASC']),
        range: JSON.stringify([10, 20]),
        filter: JSON.stringify({ name: 'name' }),
      };
      const { req, res } = createMocks({ query });
      formatQuery()(req, res, next);
      const result = req.mongoQuery;
      expect(result).is.ok;
      expect(result.sort).eql({ title: -1 });
      expect(result.skip).eql(10);
      expect(result.limit).eql(11);
    });
  });
  describe('setContentRange', () => {
    it('正确设置', async () => {
      const { req, res } = createMocks({ query: { range: JSON.stringify([10, 20]) } });
      const resource = 'res1';
      const getCount = () => Promise.resolve(88);
      await setContentRange({ resource, getCount })(req, res, next);
      const result = res.get('Content-Range');
      expect(result).eql('res1 10-20/88');
    });
  });
});

run();
