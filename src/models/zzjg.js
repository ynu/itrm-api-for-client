import fetch from 'node-fetch';
import { hrHost, error } from '../config';


export default class ZzjgManager {
  async list() {
    try {
      const res = await fetch(`${hrHost}/zzjg?cc=2`);
      const data = await res.json();
      return data;
    } catch (err) {
      error(err.message);
      return [];
    }
  }
}
