const fs = require('fs');
const path = require('path');

const {readFilesInDirectory} = require('../src/index');

jest.mock('fs', () => {
  return {
    promises: {
      stat: jest.fn((filePath) => { // Simulando um objeto de estatísticas do arquivo/diretório
        const stats = {
          isDirectory: () => true, // Simulando que é um diretório (ou false para arquivo)
        };
        return Promise.resolve(stats);
      }),
    },
  }
})

describe('readFilesInDirectory', () => {
  test('readFilesInDirectory é uma função', () => {
    expect(typeof readFilesInDirectory).toBe('function')
  })
});
