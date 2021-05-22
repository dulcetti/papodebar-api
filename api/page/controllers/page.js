const axios = require('axios');

module.exports = {
  import: async (ctx) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization':
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjIxNjIzMjMwLCJleHAiOjE2MjQyMTUyMzB9.nU2b7uRnhhcrcKcD67xXXv-Hh_Fpv0fwijc9ZVHTTvE',
    };
    const { data } = await axios.get('https://www.papodebar.com/wp-json/wp/v2/pages?per_page=15');
    const usersWp = await axios.get('https://www.papodebar.com/wp-json/wp/v2/users?per_page=100');
    const strapiUsers = await axios.get('http://localhost:1337/admin/users', {
      headers: headers,
    });

    const verifyUserOfPage = (idAuthor) => {
      const resultStrapiUsers = strapiUsers.data.data.results;
      const userOfPage = resultStrapiUsers.find(
        (strapiUser) => strapiUser.username === getUsernameWp(idAuthor)
      );

      return userOfPage.id;
    };

    const getUsernameWp = (idUser) => {
      const { data } = usersWp;
      const userOfWpPage = data.find((user) => user.id === idUser);

      return userOfWpPage.slug;
    };

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
