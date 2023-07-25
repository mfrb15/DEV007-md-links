/* eslint-disable no-console */
import { mdLinks } from './app.js';

const optionsObject = [];

console.log(process.argv);
if (process.argv[3] === '--validate' || process.argv[4] === '--validate') {
  optionsObject.validate = true;
} else {
  optionsObject.validate = false;
}
mdLinks(process.argv[2], optionsObject)
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.log(error);
  });
