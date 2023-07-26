/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable max-len */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-console */
/* eslint-disable arrow-body-style */
import {
  existsPath,
  pathToAbsolute,
  isDirectory,
  fileIsMd,
  extractMdFiles,
  readMdfiles,
  extractLinksInMd,
  validateLinks,
  getLinksStats,
  // eslint-disable-next-line import/extensions
} from './functions.js';

const ruta = process.argv[2];

export const mdLinks = (path) =>
  new Promise((resolve, reject) => {
    let pathAbsolute = '';
    const pathExists = existsPath(path);
    if (pathExists) {
      pathAbsolute = pathToAbsolute(path);
      console.log('Ruta Absoluta', pathAbsolute);
    }

    // Comprobar si la ruta es un directorio o archivo md
    let arrayMdFiles = [];
    if (isDirectory(pathAbsolute)) {
      arrayMdFiles = extractMdFiles(pathAbsolute);
    } else if (fileIsMd(pathAbsolute)) {
      // Si la ruta es un archivo md, simplemente lo agregamos al array
      arrayMdFiles.push(pathAbsolute);
    }
    arrayMdFiles = extractMdFiles(pathAbsolute);
    const mdArrayData = readMdfiles(arrayMdFiles);
    console.log('SOY MDARRAYDATA', mdArrayData);

    const objectLinks = extractLinksInMd(mdArrayData, arrayMdFiles);
    validateLinks(objectLinks)
      .then((validatedLinks) => {
        console.log('LINKS VALIDADOS', validatedLinks);
        return getLinksStats(validatedLinks);
      })
      .then((linkStats) => {
        console.log(linkStats);
        resolve(console.log('Links;', objectLinks));
      })
      .catch((error) => {
        console.error('Ocurrió un error al validar los enlaces:', error);
        reject(new Error('La ruta no existe'));
      });
  });

mdLinks(ruta);

export default mdLinks;
