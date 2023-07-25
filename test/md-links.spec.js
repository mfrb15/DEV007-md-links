/* eslint-disable no-console */
const { mdLinks } = require('../index.js');

describe('mdLinks', () => {
  it('should...', () => {
    console.log('FIX ME!');
  });
  // it('Deberia devolver una promesa', () => {
  //   expect(mdLinks()).toBe(typeof Promise);
  // });
  it('Debería rechazar cuando el path no existe', () => {
    return mdLinks('/mafer/laboratoria/estePathNoExiste.md').catch((error) => {
      expect(error).toBe('La ruta no existe');
    });
  });
});
