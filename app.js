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
} from './functions.js';

// const ruta = process.argv[2];

export const mdLinks = (document, options) => {
  return new Promise((resolve, reject) => {
    let routeAbsolute = '';
    const isExists = existsPath(document);
    if (isExists) {
      routeAbsolute = pathToAbsolute(document);
    } else {
      reject(Error('Tu ruta no existe'));
      return;
    }

    let archivos = [];
    if (isDirectory(routeAbsolute)) {
      archivos = extractMdFiles(routeAbsolute);
    }
    const mdArrayData = readMdfiles(archivos);
    const objectLinks = extractLinksInMd(mdArrayData, archivos);

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
