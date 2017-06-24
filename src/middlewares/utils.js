/*
 eslint-disable no-param-reassign
 */
import JSZip from 'jszip';
import Docxtemplater from 'docxtemplater';
import expressions from 'angular-expressions';
import fs from 'fs';
import path from 'path';

expressions.filters.lower = (input) => {
  // This condition should be used to make sure that if your input is undefined, your output will be undefined as well and will not throw an error
  if (!input) return input;
  return input.toLowerCase();
};

expressions.filters.leftPadding = (data, len) => {
  let dataLength = String(data).length;
  while (dataLength < len) {
    data = ` ${data}`;
    dataLength++;
  }
  return data;
};

expressions.filters.rightPadding = (data, len) => {
  let dataLength = String(data).length;
  while (dataLength < len) {
    data += ' ';
    dataLength++;
  }
  return data;
};

const angularParser = (tag) => {
  const expr = expressions.compile(tag);
  return { get: expr };
};

export const generateDocx = (options = {}) => async (req, res, next) => {
  const data = options.data || req.data || {};
  const filename = options.filename || '安全责任书.docx';

  // 读取docx模板文件，由于编译执行是在dist目录，所以模板的位置有变
  const content = fs
    .readFileSync(path.resolve(__dirname, '../resources', '安全责任书.docx'), 'binary');
  const zip = new JSZip(content);
  const doc = new Docxtemplater();
  doc.loadZip(zip);
  // 设置使用angular表达式语言
  doc.setOptions({ parser: angularParser });
  // 设置模板填充数据
  doc.setData(data);
  try {
    // 生成docx
    doc.render();
  } catch (error) {
    const e = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      properties: error.properties,
    };
    console.log(JSON.stringify({ error: e }));
    res.json(e);
  }

  const buf = doc.getZip().generate({ type: 'nodebuffer' });

  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
  // const writeFilePath = path.resolve(__dirname, '../../resources', '安全责任书-' + '20160019' + '.docx')
  // fs.writeFileSync(writeFilePath, buf);

  // tell the browser to download this
  res.setHeader('Content-disposition', `attachment; filename=${encodeURIComponent(filename)}`);
  res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  return res.status(200).send(buf);
  // res.sendFile(writeFilePath);
};

export const sampleData = {
  department: {
    name: '信息技术中心',
    zyfzr: {
      name: '刘东华',
      id: '20160019',
      zw: '开发',
      phone: 15288117371,
    },
    bmscy: {
      name: '李洋',
      id: '20190019',
      phone: 15288117371,
    },
  },
  websites: [
    {
      name: '网站1',
      domain: 'site1.com',
      mainPageUrl: 'http://site1.com',
      catagory: 1,
      dept: {
        id: null,
      },
      kbrq: '2017-06-14T16:00:00.000Z',
      yt: 'ddd',
      englishVersion: {
        status: 3,
      },
      english: {
        mainPageUrl: 'ddd',
      },
      provideInfo: {
        tgfs: 4,
        realServersText: 'dd',
      },
    },
    {
      name: 'ssssss',
      domain: 'sss',
      mainPageUrl: 's',
      catagory: 2,
      dept: {
        id: '5944ca65f761ba31884bd182',
      },
      kbrq: '2017-06-21T16:00:00.000Z',
      yt: 'ss',
      englishVersion: {
        status: 3,
      },
      english: {
        mainPageUrl: 'sss',
      },
      provideInfo: {
        tgfs: 3,
        realServersText: 'sss',
      },
    },
  ],
  weixins: [
    {
      name: 'weixins1',
      account: 'weixins account',
      type: 'type1',
      certification: 'certification',
    },
    {
      name: 'weixins2',
      account: 'weixins account',
      type: 'type1',
      certification: 'certification',
    },
  ],
  weibos: [
    {
      name: 'weibo1',
      account: 'weibo1 account',
      url: 'url',
      certification: 'certification',
    },
    {
      name: 'weibo2',
      account: 'weixins account',
      url: 'url',
      certification: 'certification',
    },
  ],
  emails: [
    {
      account: 'liudonghua@ynu.edu.cn',
      yt: '用途1',
    },
    {
      account: 'liudonghua2@ynu.edu.cn',
      yt: '用途2',
    },
  ],
};

export default {
  generateDocx,
};

