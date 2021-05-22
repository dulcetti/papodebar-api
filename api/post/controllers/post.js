const axios = require('axios');

module.exports = {
  import: async (ctx) => {
    const { data } = await axios.get('https://www.papodebar.com/wp-json/wp/v2/posts/35180');

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
              title: { rendered: titleRendered },
            } = post;

            try {
              const downloaded = await strapi.config.functions.download(featured_media_src_url);
              const [{ id: fileId }] = await strapi.config.functions.upload(downloaded);

              const postData = {
                author: verifyUserOfPost(author),
                content: contentRendered,
                categories: verifyCategoryOfPost(categories[0]),
                original_date: date,
                publish_date: date_gmt,
                excerpt: excerptRendered,
                featured_image: [fileId],
                wp_id: id,
                slug,
                title: titleRendered,
              };
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
