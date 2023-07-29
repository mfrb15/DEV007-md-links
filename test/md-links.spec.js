/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-len */
/* eslint-disable no-undef */
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  existsPath,
  pathToAbsolute,
  fileIsMd,
  extractMdFiles,
  isDirectory,
  readMdfiles,
  extractLinksInMd,
  validateLinks,
  getLinksStats,
} from '../functions';

// Verificar si la ruta existe
describe('existsPath', () => {
  // Mock fs.existsSync para simular su comportamiento
  beforeAll(() => {
    jest.spyOn(fs, 'existsSync');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return true when the path exists', () => {
    const existingPath = '/path/to/existing/file.md';
    fs.existsSync.mockReturnValue(true);

    const result = existsPath(existingPath);
    expect(result).toBe(true);
    expect(fs.existsSync).toHaveBeenCalledWith(existingPath);
  });

  test('should return false when the path does not exist', () => {
    const nonExistentPath = '/path/to/non-existent/file.md';
    fs.existsSync.mockReturnValue(false);

    const result = existsPath(nonExistentPath);
    expect(result).toBe(false);
    expect(fs.existsSync).toHaveBeenCalledWith(nonExistentPath);
  });
});

// Converir ruta a absoluta.
describe('pathToAbsolute', () => {
  test('should return the absolute path when given an absolute path', () => {
    const absolutePath = path.resolve('C:\\Users\\Mafer\\MD-links\\md-files\\test1');
    expect(pathToAbsolute(absolutePath)).toEqual(absolutePath);
  });

  test('should return the absolute path when given a relative path', () => {
    const relativePath = './src';
    const expectedAbsolutePath = path.resolve(relativePath);

    const result = pathToAbsolute(relativePath);
    expect(result).toBe(expectedAbsolutePath);
  });

  test('should return the absolute path when given a relative path with ".." (parent directory)', () => {
    const relativePathWithParentDir = '../src';
    const expectedAbsolutePath = path.resolve(relativePathWithParentDir);

    const result = pathToAbsolute(relativePathWithParentDir);
    expect(result).toBe(expectedAbsolutePath);
  });

  test('should return the same path when given an empty string', () => {
    const emptyPath = '';
    const expectedAbsolutePath = path.resolve(emptyPath);

    const result = pathToAbsolute(emptyPath);
    expect(result).toBe(expectedAbsolutePath);
  });
});
// Es un archivo Md.
describe('fileIsMd', () => {
  test('should return true for a file with ".md" extension', () => {
    const filePath = '/path/to/file.md';
    expect(fileIsMd(filePath)).toBe(true);
  });

  test('should return false for a file with a different extension', () => {
    const filePath = '/path/to/file.txt';
    expect(fileIsMd(filePath)).toBe(false);
  });

  test('should return false for a directory path', () => {
    const directoryPath = '/path/to/directory';
    expect(fileIsMd(directoryPath)).toBe(false);
  });

  test('should return false for an empty string', () => {
    const emptyPath = '';
    expect(fileIsMd(emptyPath)).toBe(false);
  });
});

// Es un directorio
describe('isDirectory', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return true for a directory path', () => {
    const directoryPath = '/path/to/directory';
    jest.spyOn(fs, 'statSync').mockReturnValue({ isDirectory: () => true });

    const result = isDirectory(directoryPath);
    expect(result).toBe(true);
  });

  test('should return false for a file path', () => {
    const filePath = '/path/to/file.md';
    jest.spyOn(fs, 'statSync').mockReturnValue({ isDirectory: () => false });

    const result = isDirectory(filePath);
    expect(result).toBe(false);
  });
});

// Leer archivos md
describe('readMdfiles', () => {
  test('should return an array with the contents of md files', () => {
    const file1Content = 'Content of file 1';
    const file2Content = 'Content of file 2';
    const mdFiles = ['/path/to/file1.md', '/path/to/file2.md'];

    jest.spyOn(fs, 'readFileSync')
      .mockReturnValueOnce(file1Content)
      .mockReturnValueOnce(file2Content);

    const result = readMdfiles(mdFiles);
    expect(result).toEqual([file1Content, file2Content]);
  });
});

// Extraer archivos md
describe('extractMdFiles', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return an array with the given .md file path', () => {
    const filePath = '/path/to/file.md';
    jest.spyOn(fs, 'statSync').mockReturnValue({ isDirectory: () => false });
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);

    const result = extractMdFiles(filePath);
    expect(result).toEqual([filePath]);
  });

  test('should return an array with all .md file paths in the directory', () => {
    const directoryPath = '/path/to/directory';
    const file1 = 'file1.md';
    const file2 = 'file2.md';
    const file3 = 'file3.txt';

    jest.spyOn(fs, 'statSync')
      .mockReturnValueOnce({ isDirectory: () => true })
      .mockReturnValueOnce({ isDirectory: () => false })
      .mockReturnValueOnce({ isDirectory: () => false });

    jest.spyOn(fs, 'readdirSync').mockReturnValueOnce([file1, file2, file3]);

    const expectedMdFiles = [path.join(directoryPath, file1), path.join(directoryPath, file2)];

    const result = extractMdFiles(directoryPath);
    expect(result).toEqual(expectedMdFiles);
  });

  test('should return an empty array for an empty directory', () => {
    const emptyDirectory = '/path/to/empty/directory';
    jest.spyOn(fs, 'statSync').mockReturnValue({ isDirectory: () => true });
    jest.spyOn(fs, 'readdirSync').mockReturnValue([]);

    const result = extractMdFiles(emptyDirectory);
    expect(result).toEqual([]);
  });
});
// Extraer links en archivos md
describe('extractLinksInMd', () => {
  test('should return an array of links extracted from markdown files', () => {
    const dataMdfiles = [
      'This is a [link 1](https://example.com/link1) in the content.',
      'And here is [link 2](https://example.com/link2) in another file.',
    ];

    const filePaths = ['/path/to/file1.md', '/path/to/file2.md'];

    const expectedLinks = [
      { text: 'link 1', url: 'https://example.com/link1', file: '/path/to/file1.md' },
      { text: 'link 2', url: 'https://example.com/link2', file: '/path/to/file2.md' },
    ];

    const result = extractLinksInMd(dataMdfiles, filePaths);
    expect(result).toEqual(expectedLinks);
  });

  test('should return an empty array when there are no links in the markdown files', () => {
    const dataMdfiles = [
      'This is some text without links.',
      'No links here either.',
      'More plain text.',
    ];

    const filePaths = ['/path/to/file1.md'];

    const result = extractLinksInMd(dataMdfiles, filePaths);
    expect(result).toEqual([]);
  });
});

// Validar links
const mock = new MockAdapter(axios); // para simular las respuestas de las peticiones HTTP que realiza axios.get()

describe('validateLinks', () => {
  afterEach(() => {
    mock.reset();
  });

  test('should return an array of validated links', async () => {
    const links = [
      { text: 'Link 1', url: 'https://example.com/link1' },
      { text: 'Link 2', url: 'https://example.com/link2' },
      { text: 'Link 3', url: 'https://example.com/link3' },
    ];

    // Configurar respuestas simuladas para las peticiones HTTP
    mock
      .onGet('https://example.com/link1')
      .reply(200, 'Success for link 1');
    mock
      .onGet('https://example.com/link2')
      .reply(404, 'Not found for link 2');
    mock
      .onGet('https://example.com/link3')
      .networkError();

    const expectedResults = [
      {
        text: 'Link 1',
        url: 'https://example.com/link1',
        status: 200,
        OK: 'OK',
      },
      {
        text: 'Link 2',
        url: 'https://example.com/link2',
        status: 404,
        OK: 'FAIL',
      },
      {
        text: 'Link 3',
        url: 'https://example.com/link3',
        status: 0,
        OK: 'FAIL',
      },
    ];

    const result = await validateLinks(links);
    expect(result).toEqual(expectedResults);
  });
});

// Obtener estadisticas
describe('getLinksStats', () => {
  test('should return the correct stats without validation', async () => {
    const links = [
      { url: 'https://example.com/link1', OK: 'OK' },
      { url: 'https://example.com/link2', OK: 'FAIL' },
      { url: 'https://example.com/link3', OK: 'OK' },
    ];

    const expectedStats = {
      total: 3,
      unique: 3,
    };

    const result = await getLinksStats(links, false);
    expect(result).toEqual(expectedStats);
  });

  test('should return the correct stats with validation', async () => {
    const links = [
      { url: 'https://example.com/link1', OK: 'OK' },
      { url: 'https://example.com/link2', OK: 'FAIL' },
      { url: 'https://example.com/link3', OK: 'OK' },
    ];

    const expectedStats = {
      total: 3,
      unique: 3,
      working: 2,
      broken: 1,
    };

    const result = await getLinksStats(links, true);
    expect(result).toEqual(expectedStats);
  });

  test('should return an empty object when links array is empty', async () => {
    const links = [];
    const expectedStats = {
      total: 0,
      unique: 0,
    };

    const result = await getLinksStats(links, false);
    expect(result).toEqual(expectedStats);
  });
});
