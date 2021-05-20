const axios = require('axios');
const path = require('path');
const fs = require('fs');

module.exports = async (url) => {
  const name = path.basename(url);
  const filePath = `/tmp/${name}`;
  const writeStream = fs.createWriteStream(filePath);
  const { data } = await axios.get(url, { responseType: 'stream' });

  data.pipe(writeStream);

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      resolve(filePath);
    });
    writeStream.on('error', reject);
  });
};
