/* eslint-disable import/extensions */
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

export const mdLinks = (ruta, options) => {
  return new Promise((resolve, reject) => { // new promise realizará operaciones asíncronas y se resolverá o rechazará cuando las operaciones se completen
    let routeAbsolute = '';
    const isExists = existsPath(ruta);
    if (isExists) {
      routeAbsolute = pathToAbsolute(ruta);
    } else {
      reject(new Error('Tu ruta no existe'));
    }

    let archivos = [];
    if (isDirectory(routeAbsolute)) {
      archivos = extractMdFiles(routeAbsolute);
    } else if (fileIsMd(routeAbsolute)) {
      archivos.push(routeAbsolute);
    }
    if (archivos.length === 0) {
      reject(new Error('No se encontraron archivos md'));
    }

    const mdArrayData = readMdfiles(archivos);
    const objectLinks = extractLinksInMd(mdArrayData, archivos);

    if (objectLinks.length === 0) {
      console.log('No se encontraron links');
    }

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
        });
    } else if (options.validate) {
      validateLinks(objectLinks)
        .then((validatedLinks) => {
          resolve(validatedLinks);
        })
        .catch((error) => {
          console.error('Ocurrió un error al validar los enlaces:', error);
        });
    } else if (options.stats) {
      getLinksStats(objectLinks)
        .then((linkStats) => {
          resolve(linkStats);
        })
        .catch((error) => {
          console.error('Ocurrió un error al obtener las estadísticas:', error);
        });
    } else {
      resolve(objectLinks);
    }
  });
};
