const axios = require('axios');

module.exports = {
  import: async (ctx) => {
    const { data } = await axios.get('https://www.papodebar.com/wp-json/wp/v2/posts?per_page=1');
    const posts = await Promise.all(
      data.map(
        (post) =>
          new Promise(async (resolve, reject) => {
            const {
              author,
              content: { rendered: contentRendered },
              categories,
              date,
              date_gmt,
              excerpt: { rendered: excerptRendered },
              featured_media_src_url,
              id,
              slug,
              status,
              title: { rendered: titleRendered },
            } = post;
            const dataAuthor = await axios.get(
              `https://www.papodebar.com/wp-json/wp/v2/users/${author}`
            );
            const dataCategory = await axios.get(
              `https://www.papodebar.com/wp-json/wp/v2/categories/${categories[0]}`
            );

            try {
              const downloaded = await strapi.config.functions.download(featured_media_src_url);
              const [{ id: fileId }] = await strapi.config.functions.upload(downloaded);

              const postData = {
                author: dataAuthor,
                content: contentRendered,
                categories: dataCategory,
                original_date: date,
                publish_date: date_gmt,
                excerpt: excerptRendered,
                feature_image: [fileId],
                published: status === 'publish',
                wp_id: id,
                slug,
                title: titleRendered,
              };
              console.info(postData);
              const created = await strapi.services.post.create(postData);
              resolve(created);
            } catch (err) {
              reject(err);
            }
          })
      )
    );

    ctx.send(posts);
  },
};
