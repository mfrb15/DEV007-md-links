/* eslint-disable no-console */
import { mdLinks } from './app.js';

const ruta = process.argv[2];
const optionValidate = process.argv.includes('--validate');
const optionStats = process.argv.includes('--stats');

const options = {
  validate: optionValidate,
  stats: optionStats,
};

mdLinks(ruta, options)
  .then((links) => {
    // Si el usuario ingresa --validate Obj(Href, text, file, stattus, OK)
    if (options.validate && options.stats) {
      console.log('--validate --stats');
      // Si el usuario ingresa --stats Obj(total, Unique)
    } else if (options.stats) {
      console.log('--stats');
    } else if (options.validate) {
      links.forEach((link) => {
        console.log(`url: ${link.url}
          text: ${link.text}
          file: ${link.file}
          status: ${link.status}
          ok: ${link.ok}`);
      });
    } else {
      console.log('ninguno');
    }

    // console.log('total:', links.total);
    // Si el usuario no ingresa opciones
    // console.log(result);
  })
  .catch((error) => {
    // Handle any errors that occur during processing
    console.error('Error:', error);
  });
