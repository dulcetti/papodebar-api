const axios = require('axios');

module.exports = {
  import: async (ctx) => {
    const { data } = await axios.get('https://www.papodebar.com/wp-json/wp/v2/pages?per_page=15');

    const pages = await Promise.all(
      data.map(
        (page) =>
          new Promise(async (resolve, reject) => {
            const {
              author,
              content: { rendered: contentRendered },
              date,
              date_gmt,
              featured_media_src_url,
              id,
              slug,
              title: { rendered: titleRendered },
            } = page;

            try {
              let fileFeaturedImage = null;

              if (featured_media_src_url) {
                const downloaded = await strapi.config.functions.download(featured_media_src_url);
                const [{ id: fileId }] = await strapi.config.functions.upload(downloaded);
                fileFeaturedImage = [fileId];
              }

              const pageData = {
                author: verifyUserOfPage(author),
                content: contentRendered,
                original_date: date,
                publish_date: date_gmt,
                featured_image: fileFeaturedImage,
                wp_id: id,
                slug,
                title: titleRendered,
              };
              const created = await strapi.services.page.create(pageData);
              resolve(created);
            } catch (err) {
              reject(err);
            }
          })
      )
    );

    ctx.send(pages);
  },
};
