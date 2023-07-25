/* eslint-disable indent */
/* eslint-disable max-len */
/* eslint-disable no-console */
import fs from 'fs';

import path from 'path';

import axios from 'axios';

const ruta = process.argv[2];

// console.log('SOY PROCESS', process.argv);

// Creando constante para ver si existe la ruta.
const existsPath = (receivedPath) => fs.existsSync(receivedPath);
console.log('soy Existe el archivo', existsPath);
// console.log('ruta relativa:', ruta);
// FUNCIóN para convertir la ruta a absoluta.
export function pathToAbsolute(receivedPath) {
  if (existsPath === false) {
    console.log('NO HAY RUTA');
  } else if (path.isAbsolute(receivedPath) === false) {
    const pathAbsolute = path.resolve(receivedPath);
    console.log('SOY CONVERTIENDO EN ABSOLUTA, ', pathAbsolute);
    return pathAbsolute;
  } else {
    console.log('LA RUTA YA ERA ABSOLUTA');
    return receivedPath;
  }
}
pathToAbsolute(ruta);

// FUNCIÓN para ver si el archivo es md
export function fileIsMd(receivedPath) {
  console.log('Soy un archivo Md ');
  return path.extname(receivedPath) === '.md';
}
fileIsMd(ruta);

// FUNCIÓN para ver si el archivo NO es md
export function fileNotMd(receivedPath) {
  console.log('NO SOY UN archivo Md ');
  return path.extname(receivedPath) !== '.md';
}
fileNotMd(ruta);

// FUNCIÓN para comprobar si la ruta es un directorio.
export function isDirectory(receivedPath) {
  const directory = fs.statSync(receivedPath);
  // fs.statSync es una función sincrónica que devuelve un objeto que
  // contiene información sobre el archivo o directorio.
  return directory.isDirectory();
}

isDirectory(ruta);
console.log(isDirectory(ruta), 'ISDIRECTORY');

// FUNCIÓN para extraer archivos md
export const extractMdFiles = (receivedPath) => {
  let mdFiles = [];

  const files = fs.readdirSync(receivedPath);
  files.forEach((file) => {
    const pathFiles = path.join(receivedPath, file);
    const stats = fs.statSync(pathFiles);
    if (stats.isDirectory()) {
      mdFiles = mdFiles.concat(extractMdFiles(pathFiles));
    } else if (path.extname(file) === '.md') {
      mdFiles.push(pathFiles);
    }
  });

  return mdFiles;
};
console.log('Archivos MD encontrados:', extractMdFiles(ruta));

// FUNCIÓN que lea el array con mdFiles
export const readMdfiles = (mdFiles) => {
  const dataMdfiles = [];
  mdFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    dataMdfiles.push(content);
  });
  console.log(dataMdfiles, 'soy dataMdfiles');
  return dataMdfiles;
};
const contentFileMd = readMdfiles(extractMdFiles(ruta));

// FUNCIÓN para encontrar los enlaces en el contenido de un archivo MD
const findLinksInMdContent = (dataMdfiles, filePath) => {
  const regex = /\[(.*?)\]\((.*?)\)/g;
  const links = [];
  let match = regex.exec(dataMdfiles);
  while (match !== null) {
    links.push({ text: match[1], url: match[2], filePath: filePath });
    console.log('SOY LINKS', links);
    match = regex.exec(dataMdfiles);
  }
  console.log('somos los links', links);
  return links;
};

// FUNCIÓN para validar los enlaces encontrados
function validateLinks(links) {
  const promises = links.map((link) => {
    return axios
      .get(link.url)
      .then((response) => {
        const isValid = response.status >= 200 && response.status < 400;
        console.log('Soy es valid', isValid);
        return {
          ...link,
          status: response.status,
          OK: isValid ? 'OK' : 'FAIL',
        };
      })
      .catch((error) => {
        if (error.response) {
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
function getLinksStats(links) {
  return new Promise((resolve, reject) => {
    try {
      const totalLinks = links.length;
      const uniqueLinks = new Set(links.map((link) => link.url)).size;
      console.log('SOY UNIQUE LINKS', uniqueLinks);
      const brokenLinks = links.filter((link) => link.OK === 'FAIL').length;
      console.log('SOY BROKEN LINKS', brokenLinks); // Contar los links rotos
      const stats = {
        total: totalLinks,
        unique: uniqueLinks,
        broken: brokenLinks,
      };
      resolve(stats);
    } catch (error) {
      reject(error.message);
    }
  });
}

// Llamar a la función para obtener los enlaces
const linksInMdFiles = findLinksInMdContent(contentFileMd, path.resolve(ruta));

// Llamar a la función para validar los enlaces
validateLinks(linksInMdFiles)
  .then((validatedLinksInMdFiles) => {
    // Mostrar los enlaces validados en la consola
    console.log('Enlaces válidos y falsos encontrados en los archivos MD:');
    console.log(validatedLinksInMdFiles);

    // Obtener y mostrar las estadísticas de los enlaces, incluyendo los broken links
    return getLinksStats(validatedLinksInMdFiles);
  })
  .then((linksStats) => {
    console.log('Estadísticas de los enlaces:');
    console.log(linksStats);
  })
  .catch((error) => {
    console.error('Ocurrió un error al validar los enlaces:', error);
  });
