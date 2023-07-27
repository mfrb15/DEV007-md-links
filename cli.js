/* eslint-disable no-console */
import chalk from 'chalk';
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
    if (options.validate && options.stats) {
      console.log(chalk.bold.blueBright('Total: ', links.total));
      console.log(chalk.bold.yellowBright('Unique: ', links.unique));
      console.log(chalk.bold.greenBright('Working: ', links.working));
      console.log(chalk.bold.redBright('Broken: ', links.broken));
    } else if (options.stats) {
      console.log(chalk.bold.blueBright('Total: ', links.total));
      console.log(chalk.bold.yellowBright('Unique: ', links.unique));
    } else if (options.validate) {
      links.forEach((link) => {
        console.log(chalk.bold.magenta(`
        url: ${link.url}
        text: ${link.text}
        file: ${link.file}
        status: ${link.status}
        OK: ${link.OK}`));
      });
    } else {
      links.forEach((link) => {
        console.log(chalk.bold.magenta(`
      url: ${link.url}
      text: ${link.text}
      file: ${link.file}
                    `));
      });
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
