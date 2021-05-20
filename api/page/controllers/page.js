const axios = require('axios');

module.exports = {
  import: async (ctx) => {
    const { data } = await axios.get('https://www.papodebar.com/wp-json/wp/v2/pages?per_page=1');
    const pages = await Promise.all(
      data.map(
        (page) =>
          new Promise(async (resolve, reject) => {
            const {
              author,
              content: { rendered: contentRendered },
              date,
              date_gmt,
              excerpt: { rendered: excerptRendered },
              featured_media_src_url,
              id,
              slug,
              status,
              title: { rendered: titleRendered },
            } = page;
            const dataAuthor = await axios.get(
              `https://www.papodebar.com/wp-json/wp/v2/users/${author}`
            );

            try {
              const downloaded = await strapi.config.functions.download(featured_media_src_url);
              const [{ id: fileId }] = await strapi.config.functions.upload(downloaded);

              const pageData = {
                author: dataAuthor,
                content: contentRendered,
                original_date: date,
                publish_date: date_gmt,
                excerpt: excerptRendered,
                feature_image: [fileId],
                published: status === 'publish',
                wp_id: id,
                slug,
                title: titleRendered,
              };
              console.info(pageData);
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
