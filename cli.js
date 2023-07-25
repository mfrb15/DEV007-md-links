/* eslint-disable no-console */
const { mdLinks } = require('./index.js');

mdLinks('/NoExiste')
  .then(() => {})
  .catch((error) => {
    console.log(error);
  });
