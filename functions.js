/* eslint-disable indent */
/* eslint-disable max-len */
/* eslint-disable no-console */
import fs from 'fs';

import path from 'path';

import axios from 'axios';


export function existsPath(receivedPath) {
  if (fs.existsSync(receivedPath)) {
    return true;
  } else {
    return false;
  }
}

// Función para convertir la ruta a absoluta.
export function pathToAbsolute(receivedPath) {
  if (path.isAbsolute(receivedPath) === false) {
    const pathAbsolute = path.resolve(receivedPath);
        return pathAbsolute;
  } else {
    console.log('LA RUTA YA ERA ABSOLUTA');
    return receivedPath;
  }
}

// Función para ver si el archivo es md
export function fileIsMd(receivedPath) {
  return path.extname(receivedPath) === '.md';

}

// Función para comprobar si la ruta es un directorio.
export function isDirectory(receivedPath) {
  const directory = fs.statSync(receivedPath);
  // fs.statSync es una función sincrónica que devuelve un objeto que
  // contiene información sobre el archivo o directorio.
  return directory.isDirectory();
}

// Función para extraer archivos md RECURSIVIDAD
export const extractMdFiles = (receivedPath) => {
  let pathTofiles = []; // Almacena las rutas a los archivos Markdown encontrados.

  if (fs.statSync(receivedPath).isDirectory()) {
    const files = fs.readdirSync(receivedPath);
    files.forEach((file) => {
      const pathAndFiles = path.join(receivedPath, file);
      pathTofiles = pathTofiles.concat(extractMdFiles(pathAndFiles));
    });
  } else if (path.extname(receivedPath) === '.md') {
    pathTofiles.push(receivedPath);
  }

  return pathTofiles;
};

// Función que lea el array con pathTofiles
export const readMdfiles = (pathTofiles) => {
  const dataMdfiles = [];
  pathTofiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    dataMdfiles.push(content);
  });
  return dataMdfiles;
};

// Función para encontrar los enlaces en el contenido de un archivo MD
export const extractLinksInMd = (dataMdfiles, fileAndPaths) => {
  const regex = /\[(.*?)\]\((.*?)\)/g;
  const allLinks = [];
  dataMdfiles.forEach((content, index) => {
    // Guardar en un array la ruta de cada uno en la recursividad
    const links = [];
    let match = regex.exec(content);
    while (match !== null) {
      links.push({ text: match[1], url: match[2], file: fileAndPaths[index] });
      match = regex.exec(content);
    }
    allLinks.push(...links);

  });
  return allLinks;
};

// Función para validar los enlaces encontrados
export function validateLinks(links) {
  const promises = links.map((link) => { // cada elemento de promises es una promesa que espera la solicitud http
    return axios
      .get(link.url)
      .then((response) => {
        const isValid = response.status >= 200 && response.status < 400;
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

// Función para obtener las estadísticas de los enlaces, incluyendo los broken links
export const getLinksStats = (links, optionValidate) =>
    new Promise((resolve, reject) => {
  try {
    let stats = {
      total: links.length,
      unique: new Set(links.map((link) => link.url)).size, // Set para eliminar duplicados, obteniendo así el número de enlaces únicos
    };
    if (optionValidate) {

      stats.broken = links.filter((link) => link.OK == 'FAIL').length;

      stats.working = links.filter((link) => link.OK == 'OK').length;
        }
    resolve(stats);
  } catch (error) {
    reject(error.message);
  }
});
