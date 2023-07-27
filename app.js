/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable max-len */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-console */
/* eslint-disable arrow-body-style */
import {
  existsPath,
  pathToAbsolute,
  isDirectory,
  extractMdFiles,
  readMdfiles,
  extractLinksInMd,
  validateLinks,
  getLinksStats,
  fileIsMd,
} from './functions.js';

// const ruta = process.argv[2];

export const mdLinks = (ruta, options) => {
  // console.log(ruta, 'soy ruta');
  return new Promise((resolve, reject) => { // new promise realizará operaciones asíncronas y se resolverá o rechazará cuando las operaciones se completen
    let routeAbsolute = '';
    const isExists = existsPath(ruta);
    if (isExists) {
      routeAbsolute = pathToAbsolute(ruta);
    } else {
      reject(Error('Tu ruta no existe'));
      return;
    }

    let archivos = [];
    if (isDirectory(routeAbsolute)) {
      archivos = extractMdFiles(routeAbsolute);
    } else if (fileIsMd(routeAbsolute)) {
      archivos.push(routeAbsolute);
      // console.log(archivos, 'soy archivos');
    }

    const mdArrayData = readMdfiles(archivos);
    const objectLinks = extractLinksInMd(mdArrayData, archivos);
    // console.log('Hola', objectLinks);

    if (options.validate && options.stats) {
      validateLinks(objectLinks)
        .then((validatedLinks) => {
          getLinksStats(validatedLinks, options.validate)
            .then((res) => resolve(res))
            .catch(() =>
              reject(new Error('Hubo un problema al validar links')));
        })
        .catch((error) => {
          console.error('Ocurrió un error al validar los enlaces:', error);
          reject(error);
        });
    } else if (options.validate) {
      validateLinks(objectLinks)
        .then((validatedLinks) => {
          resolve(validatedLinks);
        })
        .catch((error) => {
          console.error('Ocurrió un error al validar los enlaces:', error);
          reject(error);
        });
    } else if (options.stats) {
      getLinksStats(objectLinks)
        .then((linkStats) => {
          resolve(linkStats);
        })
        .catch((error) => {
          console.error('Ocurrió un error al obtener las estadísticas:', error);
          reject(error);
        });
    } else {
      resolve(objectLinks);
    }
  });
};
// console.log(20000, mdLinks(ruta));
