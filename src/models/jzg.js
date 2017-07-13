import fetch from 'node-fetch';
import { hrHost, error, jwtToken } from '../config';


export default class ZzjgManager {
  async list() {
    try {
      const res = await fetch(`${hrHost}/jzg?token=${jwtToken}`);
      const data = await res.json();
      return data;
    } catch (err) {
      error(err.message);
      return [];
    }
  }
  async getById(id) {
    try {
      const res = await fetch(`${hrHost}/jzg?jgh=${id}&token=${jwtToken}`);
      const data = await res.json();
      if (data.length) return data[0];
      return null;
    } catch (err) {
      error(err.message);
      return null;
    }
  }
}
