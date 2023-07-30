const fs = require('fs');
const path = require('path');

const { readFilesInDirectory, readMarkdownFile, readFileAndDirectory, extractLinks, validateLinks, mdLinks } = require('../src/index');



describe('Teste da função readFilesInDirectory', () => {
  test('readFilesInDirectory é uma função', () => {
    expect(typeof readFilesInDirectory).toBe('function')
  })

  test('readFilesInDirectory - Ler conteudos de um diretório', () => {
    const dirPath = path.join(__dirname, '..', 'src'); //Caminho para o diretório

    return readFilesInDirectory(dirPath).then(result => {
      expect(Array.isArray(result)).toBe(true); // Verifica se a função é um array

      const testingFileMD = result.find(file => file.file === path.join(dirPath, 'testing.md'));
      const vazioFileMD = result.find(file => file.file === path.join(dirPath, 'vazio.md'));

      expect(testingFileMD).toBeDefined(); //Verifica se o arquivo 'testing.md' está presente no diretório
      expect(vazioFileMD).toBeDefined();
    });
  });
});

describe('Teste da função readMarkdownFile', () => {
  test('readMarkdownFile é uma função', () => {
    expect(typeof readMarkdownFile).toBe('function')
  })

  test('readMarkdownFile - deve ler o conteúdo de um arquivo MD', () => {
    const fileTestPath = path.join(__dirname, '..', 'src', 'testing.md');

    return readMarkdownFile(fileTestPath)
      .then(result => {
        expect(result).toBeDefined();
        expect(result.file).toBe(fileTestPath);
        expect(result).toHaveProperty('data');
      })
  });

  test('readMarkdownFile - deve rejeitar a Promise quando o arquivo não for um MD', () => {
    const notFilePath = path.join(__dirname, '..', 'src', 'cli.js') // não possui caminho md, termina com final js

    return readMarkdownFile(notFilePath).catch(error => {
      expect(error.message).toBe('ERROR'); // Verifica se o erro esperado foi gerado
    });
  });
});

describe('Teste da função readFileAndDirectory', () => {
  test('readFileAndDirectory é uma função', () => {
    expect(typeof readFileAndDirectory).toBe('function')
  })

  test('readFileAndDirectory - Deve ler o conteúdo de um arquivo Markdown e retornar um objeto com as informações', () => {
    const testFilePath = path.join(__dirname, '..', 'src', 'testing.md')

    return readFileAndDirectory(testFilePath).then(result => {
      expect(result).toBeDefined();
      expect(result.file).toBe(testFilePath);
      expect(result).toHaveProperty('data');
    });
  });

  test('readFileAndDirectory - Deve ler o conteúdo de um diretório e retornar um array com informações dos arquivos .md', () => {
    const testDirPath = path.join(__dirname, '..', 'src')

    return readFileAndDirectory(testDirPath).then(result => {
      expect(Array.isArray(result)).toBe(true);

      const testingFileMD = result.find(file => file.file === path.join(testDirPath, 'testing.md'));
      const vazioFileMD = result.find(file => file.file === path.join(testDirPath, 'vazio.md'));

      expect(testingFileMD).toBeDefined(); //Verifica se o arquivo 'testing.md' está presente no diretório
      expect(vazioFileMD).toBeDefined();
    });
  });

  test('readFileAndDirectory - Deve rejeitar a Promise quando o arquivo não for um .md ', () => {
    const notFilePath = path.join(__dirname, '..', 'src', 'cli.js')

    return readMarkdownFile(notFilePath).catch(error => {
      expect(error.message).toBe('ERROR');
    });
  })

  test('Deve retornar "Arquivo vazio" quando o arquivo md estiver vazio', () => {
    const testFileVazio = path.join(__dirname, '..', 'src', 'vazio.md')

    return readFileAndDirectory(testFileVazio).catch(error => {
      expect(error.message).toBe('Arquivo Vazio');
    });
  })
});

describe('Teste da função extractLinks', () => {
  test('extractLinks é uma função', () => {
    expect(typeof extractLinks).toBe('function')
  });

  test('extractLinks - Deve extrair os links de um arquivo Markdown', () => {
    const contentMD = {
      data: `Arquivo MD com links:
      [Path](https://nodejs.org/api/path.html)
      [File system](https://nodejs.org/api/fs.html)
      [Google](https://www.google.com)
      `,
    };

    const filePath = './src/testing.md';

    const result = extractLinks(contentMD.data, filePath);

    expect(result).toEqual([
      { href: 'https://nodejs.org/api/path.html', text: 'Path', file: filePath },
      { href: 'https://nodejs.org/api/fs.html', text: 'File system', file: filePath },
      { href: 'https://www.google.com', text: 'Google', file: filePath },
    ]);
  });

  test('Deve retornar um array vazio se não houver links no arquivo md', () => {
    const contentVazio = {
      data: `Arquivo vazio sem links.`,
    };

    const filePath = './src/vazio.md';

    const result = extractLinks(contentVazio, filePath);

    expect(result).toEqual([]);
  })
});


describe('Teste da função validateLinks', () => {
  test('validateLinks é uma função', () => {
    expect(typeof validateLinks).toBe('function')
  });

  test('Deve retornar a validação dos links com sucesso', () => {

    // Função simulada para realizar a requisição HTTP
    function fetchMock(href) {

      //Simula a resposta do servidor para as requisições
      const responses = {
        'https://nodejs.org/api/path.html': { status: 200, ok: true },
        'https://nodejs.org/api/fs.html': { status: 200, ok: true },
        'https://www.googlecom': { status: 400, ok: false },
      };

      return new Promise((resolve) => {
        resolve(responses[href]);
      });
    }

    const links = [
      { href: 'https://nodejs.org/api/path.html', text: 'Path', file: './src/testing.md' },
      { href: 'https://nodejs.org/api/fs.html', text: 'File system', file: './src/testing.md' },
      { href: 'https://www.googlecom', text: 'Google', file: './src/testing.md' },
    ];

    return validateLinks(links, fetchMock)
      .then((result) => {
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(3);

        // Verificar se a validação foi adicionada corretamente aos links
        expect(result[0]).toEqual({ href: 'https://nodejs.org/api/path.html', text: 'Path', file: './src/testing.md', status: 200, ok: 'ok' });
        expect(result[1]).toEqual({ href: 'https://nodejs.org/api/fs.html', text: 'File system', file: './src/testing.md', status: 200, ok: 'ok' });
        expect(result[2]).toEqual({ href: 'https://www.googlecom', text: 'Google', file: './src/testing.md', status: 400, ok: 'fail' });
      });
  });
});


describe('Teste da função mdLinks', () => {
  test('mdLinks é uma função', () => {
    expect(typeof mdLinks).toBe('function')
  })

  test('Deve retornar os links com validação', () => {
    return mdLinks('src/testing.md', {validate: true})
    .then((result) => {
      expect (result).toEqual ([
        {href: 'https://nodejs.org/api/path.html', text: 'Path - Documentação oficial (em inglês)', file: 'src/testing.md', status: 200, ok: 'ok'},
        {href: 'https://nodejs.org/api/fs.html', text: 'File system - Documentação oficial (em inglês)', file: 'src/testing.md', status: 200, ok: 'ok'},
        {href: 'https:/googlecom', text: 'Google', file: 'src/testing.md', status: 400, ok: 'fail'},
      ]);
    });
  });

  test('deve retornar os links sem validação', () => {
    return mdLinks('src/testing.md', { validate: false }).then((result) => {
      expect(result).toEqual([
        { href: 'https://nodejs.org/api/path.html', text: 'Path - Documentação oficial (em inglês)', file: 'src/testing.md' },
        { href: 'https://nodejs.org/api/fs.html', text: 'File system - Documentação oficial (em inglês)', file: 'src/testing.md' },
        { href: 'https:/googlecom', text: 'Google', file: 'src/testing.md' },
      ]);
    });
  });

  test('deve retornar um array vazio para um arquivo sem links', () => {
    return mdLinks('src/vazio.md').then((result) => {
      expect(result).toEqual([]);
    });
  });
});

