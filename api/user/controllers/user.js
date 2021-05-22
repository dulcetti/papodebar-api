const axios = require('axios');

module.exports = {
  import: async () => {
    const { data } = await axios.get('https://www.papodebar.com/wp-json/wp/v2/users?per_page=100');
    await Promise.all(
      data.map(
        (user) =>
          new Promise(async (resolve, reject) => {
            const { user_email, name, slug } = user;

            if (slug !== 'dulcetti') {
              try {
                const user = {
                  email: user_email,
                  firstname: name,
                  lastname: name,
                };
                const headers = {
                  'Content-Type': 'application/json',
                  'Authorization':
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjIxNjM5NDY4LCJleHAiOjE2MjQyMzE0Njh9.G6WXpjCpuqremeX_Ztr8x5jmIT9cuo9bMoct88XO-_c',
                };
                const { data } = await axios.post('http://localhost:1337/admin/users', user, {
                  headers: headers,
                });
                const userUpdated = {
                  ...user,
                  roles: [3],
                  username: slug,
                };
                const updateCreatedUser = await axios.put(
                  `http://localhost:1337/admin/users/${data.data.id}`,
                  userUpdated,
                  {
                    headers: headers,
                  }
                );
                resolve(updateCreatedUser);
              } catch (error) {
                console.error(error.response.data.data[0].messages);
                reject(error);
              }
            }
          })
      )
    );
  },
};
