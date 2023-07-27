/* eslint-disable no-console */
// const { mdLinks } = require('../index.js');

// describe('mdLinks', () => {
//   it('should...', () => {
//     console.log('FIX ME!');
//   });
//   // it('Deberia devolver una promesa', () => {
//   //   expect(mdLinks()).toBe(typeof Promise);
//   // });
//   it('Debería rechazar cuando el path no existe', () => {
// return mdLinks('/mafer/laboratoria/estePathNoExiste.md').catch((error) => {
//       expect(error).toBe('La ruta no existe');
//     });
//   });
// });
// Importar la función que se va a probar
import { pathToAbsolute } from './functions.js';

// Importar el módulo 'path' para poder simular su comportamiento
const path = require('path');

// Mock para simular el módulo 'path'
jest.mock('path', () => ({
  isAbsolute: jest.fn(),
  resolve: jest.fn(),
}));

describe('pathToAbsolute', () => {
  // Prueba cuando el path es absoluto
  it('should return the received path when it is absolute', () => {
    const receivedPath = '/absolute/path/to/something';
    path.isAbsolute.mockReturnValue(true); // Simular que es un path absoluto
    expect(pathToAbsolute(receivedPath)).toBe(receivedPath);
  });

  // Prueba cuando el path no es absoluto
  it('should return the absolute path when the received path is not absolute', () => {
    const receivedPath = 'relative/path/to/something';
    const resolvedPath = '/absolute/path/to/something';
    path.isAbsolute.mockReturnValue(false); // Simular que no es un path absoluto
    path.resolve.mockReturnValue(resolvedPath); // Simular el resultado de path.resolve()
    expect(pathToAbsolute(receivedPath)).toBe(resolvedPath);
  });
});
