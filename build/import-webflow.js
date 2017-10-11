const https = require('https');
const zlib = require('zlib');
const fs = require('fs');
const Path = require('path');

const options = {
  host: 'vgl-designer.webflow.io',
  path: '/',
};

const DEST = Path.resolve(__dirname, '../src/assets/css/wf.css');

const request = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const regex = /href="(.*?)"/g;
    const CSS_URL = (data.match(regex) || []).map(e => e.replace(regex, '$1'))[0];
    console.log(`downloading : ${CSS_URL}`);
    if (CSS_URL == null) {
      console.log('Error CSS_URL');
      return;
    }
    https.get(CSS_URL, (res2) => {
      if (res2.headers['content-encoding'] === 'gzip') {
        res2.pipe(zlib.createGunzip()).pipe(fs.createWriteStream(DEST));
      } else {
        res2.pipe(fs.createWriteStream(DEST));
      }
    });
  });
});
request.on('error', (e) => {
  console.log(`err : ${e.message}`);
});
request.end();
