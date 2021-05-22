const axios = require('axios');

module.exports = {
  import: async (ctx) => {
    const { data } = await axios.get(
      'https://www.papodebar.com/wp-json/wp/v2/categories?per_page=25'
    );
    const categories = await Promise.all(
      data.map(
        (category) =>
          new Promise(async (resolve, reject) => {
            const { id, description, name, slug, parent } = category;

            try {
              const categoryData = {
                description,
                id,
                name,
                parent,
                slug,
                wp_id: id,
              };
              const created = await strapi.services.category.create(categoryData);
              resolve(created);
            } catch (err) {
              reject(err);
            }
          })
      )
    );

    ctx.send(categories);
  },
};
