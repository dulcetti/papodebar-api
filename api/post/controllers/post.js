const axios = require('axios');

module.exports = {
  import: async (ctx) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization':
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjIxNjIzMjMwLCJleHAiOjE2MjQyMTUyMzB9.nU2b7uRnhhcrcKcD67xXXv-Hh_Fpv0fwijc9ZVHTTvE',
    };
    const { data } = await axios.get('https://www.papodebar.com/wp-json/wp/v2/posts?per_page=1');
    const usersWp = await axios.get('https://www.papodebar.com/wp-json/wp/v2/users?per_page=100');
    const categoriesWp = await axios.get(
      'https://www.papodebar.com/wp-json/wp/v2/categories?per_page=100'
    );
    const strapiUsers = await axios.get('http://localhost:1337/admin/users', {
      headers: headers,
    });
    const strapiCategories = await axios.get('http://localhost:1337/categories', {
      headers: headers,
    });

    const verifyUserOfPost = (idAuthor) => {
      const resultStrapiUsers = strapiUsers.data.data.results;
      const userOfPost = resultStrapiUsers.find(
        (strapiUser) => strapiUser.username === getUsernameWp(idAuthor)
      );

      return userOfPost.id;
    };

    const getUsernameWp = (idUser) => {
      const { data } = usersWp;
      const userOfWpPost = data.find((user) => user.id === idUser);

      return userOfWpPost.slug;
    };

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
