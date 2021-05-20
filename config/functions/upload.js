const path = require('path');
const mime = require('mime-types');
const fs = require('fs');

module.exports = async (imgPath) => {
  const extension = path.extname(imgPath);
  const name = path.basename(imgPath, extension);
  const stats = fs.statSync(imgPath);

  return strapi.plugins.upload.services.upload.upload({
    files: {
      path: imgPath,
      name: name,
      type: mime.lookup(imgPath),
      size: stats.size,
    },
    data: {},
  });
};
