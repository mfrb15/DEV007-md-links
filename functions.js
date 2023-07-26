/* eslint-disable indent */
/* eslint-disable max-len */
/* eslint-disable no-console */
import fs from 'fs';

import path from 'path';

import axios from 'axios';

const ruta = process.argv[2];

// console.log('SOY PROCESS', process.argv);

// Creando constante para ver si existe la ruta.
// export const existsPath = (receivedPath) => fs.existsSync(receivedPath);
export function existsPath(receivedPath) {
  // parametro
  if (fs.existsSync(receivedPath)) {
    return true;
  } else {
    return false;
  }
}
console.log(1000000, existsPath(ruta));
// console.log('soy Existe el archivo', existsPath);
// console.log('ruta relativa:', ruta);
// FUNCIóN para convertir la ruta a absoluta.
export function pathToAbsolute(receivedPath) {
  if (path.isAbsolute(receivedPath) === false) {
    const pathAbsolute = path.resolve(receivedPath);
    // console.log('SOY CONVERTIENDO EN ABSOLUTA, ', pathAbsolute);
    return pathAbsolute;
  } else {
    console.log('LA RUTA YA ERA ABSOLUTA');
    return receivedPath;
  }
}
pathToAbsolute(ruta);

// FUNCIÓN para ver si el archivo es md
export function fileIsMd(receivedPath) {
  // console.log('Soy un archivo Md ');
  return path.extname(receivedPath) === '.md';
}
fileIsMd(ruta);

// FUNCIÓN para ver si el archivo NO es md
// export function fileNotMd(receivedPath) {
//   console.log('NO SOY UN archivo Md ');
//   return path.extname(receivedPath) !== '.md';
// }
// fileNotMd(ruta);
// FUNCIÓN para extraer archivos md RECURSIVIDAD
export const extractMdFiles = (receivedPath) => {
  let mdFiles = [];

  if (fs.statSync(receivedPath).isDirectory()) {
    const files = fs.readdirSync(receivedPath);
    files.forEach((file) => {
      const pathFiles = path.join(receivedPath, file);
      mdFiles = mdFiles.concat(extractMdFiles(pathFiles));
    });
  } else if (path.extname(receivedPath) === '.md') {
    mdFiles.push(receivedPath);
  }

  return mdFiles;
};
// console.log('Archivos MD encontrados:', extractMdFiles(ruta));

// FUNCIÓN para comprobar si la ruta es un directorio.
export function isDirectory(receivedPath) {
  const directory = fs.statSync(receivedPath);
  // fs.statSync es una función sincrónica que devuelve un objeto que
  // contiene información sobre el archivo o directorio.
  return directory.isDirectory();
}

// isDirectory(ruta);
// console.log(isDirectory(ruta), 'ISDIRECTORY');

// FUNCIÓN que lea el array con mdFiles
export const readMdfiles = (mdFiles) => {
  const dataMdfiles = [];
  mdFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    dataMdfiles.push(content);
  });
  // console.log(dataMdfiles, 'soy dataMdfiles');
  return dataMdfiles;
};
//  const contentFileMd = readMdfiles(extractMdFiles(ruta));

// FUNCIÓN para encontrar los enlaces en el contenido de un archivo MD
export const extractLinksInMd = (dataMdfiles, filePaths) => {
  const regex = /\[(.*?)\]\((.*?)\)/g;
  const allLinks = [];
  dataMdfiles.forEach((content, index) => {
    // Guardar en un array la ruta de cada uno en la recursividad
    const links = [];
    let match = regex.exec(dataMdfiles);
    while (match !== null) {
      links.push({ text: match[1], url: match[2], filePath: filePaths });
      // console.log('SOY LINKS', links);
      match = regex.exec(dataMdfiles);
    }
    allLinks.push(...links);
  });

  return allLinks;
};

// FUNCIÓN para validar los enlaces encontrados
export function validateLinks(links) {
  const promises = links.map((link) => {
    return axios
      .get(link.url)
      .then((response) => {
        const isValid = response.status >= 200 && response.status < 400;
        // console.log('Soy es valid', isValid);
        return {
          ...link,
          status: response.status,
          OK: isValid ? 'OK' : 'FAIL',
        };
      })
      .catch((error) => {
        if (error.response) {
          // console.log(40000, 'ERROR-RESPONSE', error.response.status);
          return {
            ...link,
            status: error.response.status,
            OK: 'FAIL',
          };
        }
        return {
          ...link,
          status: 0,
          OK: 'FAIL',
        };
      });
  });

  return Promise.all(promises);
}

// FUNCIÓN para obtener las estadísticas de los enlaces, incluyendo los broken links
export function getLinksStats(links, optionValidate) {
  return new Promise((resolve, reject) => {
    const totalLinks = links.length;
    const uniqueLinks = new Set(links.map((link) => link.url)).size;
    const stats = {
      total: totalLinks,
      unique: uniqueLinks,
    };
    if (optionValidate) {
      stats.working = links.filter((obj) => obj.mensaje == 'OK').length;
      stats.broken = links.filter((obj) => obj.mensaje == 'Fail').length;
    }
    resolve(stats);
  });
}

// Llamar a la función para obtener los enlaces
// export const linksInMdFiles = extractLinksInMd(
//   contentFileMd,
//   extractMdFiles(ruta),
// );

// Llamar a la función para validar los enlaces
// validateLinks(linksInMdFiles)
//   .then((validatedLinksInMdFiles) => {
//     // Mostrar los enlaces validados en la consola
//     console.log('Enlaces válidos y falsos encontrados en los archivos MD:');
//     console.log(validatedLinksInMdFiles);

//     // Obtener y mostrar las estadísticas de los enlaces, incluyendo los broken links
//     return getLinksStats(validatedLinksInMdFiles);
//   })
//   .then((linksStats) => {
//     console.log('Estadísticas de los enlaces:');
//     console.log(linksStats);
//   })
//   .catch((error) => {
//     console.error('Ocurrió un error al validar los enlaces:', error);
//   });
