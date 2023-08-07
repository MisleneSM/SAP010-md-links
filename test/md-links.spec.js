const fs = require('fs');
const path = require('path');

const { readFilesInDirectory, readMarkdownFile, readFileAndDirectory, extractLinks, validateLinks, mdLinks } = require('../src/index');

describe('Teste da função readFilesInDirectory', () => {
  test('readFilesInDirectory é uma função', () => {
    expect(typeof readFilesInDirectory).toBe('function')
  })

  test('readFilesInDirectory - Ler conteudos de um diretório', () => {
    const dirPath = path.join(__dirname, '..', 'src');

    return readFilesInDirectory(dirPath).then(result => {
      expect(Array.isArray(result)).toBe(true);

      const testingFileMD = result.find(file => file.file === path.join(dirPath, 'testing.md'));
      const vazioFileMD = result.find(file => file.file === path.join(dirPath, 'vazio.md'));

      expect(testingFileMD).toBeDefined();
      expect(vazioFileMD).toBeDefined();
    });
  });
});

describe('Teste da função readMarkdownFile', () => {
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
    const notFilePath = path.join(__dirname, '..', 'src', 'cli.js')

    return readMarkdownFile(notFilePath).catch(error => {
      expect(error.message).toBe('ERROR');
    });
  });
});

describe('Teste da função readFileAndDirectory', () => {
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

      expect(testingFileMD).toBeDefined();
      expect(vazioFileMD).toBeDefined();
    });
  });

  test('Deve retornar "Arquivo vazio" quando o arquivo md estiver vazio', () => {
    const testFileVazio = path.join(__dirname, '..', 'src', 'vazio.md')

    return readFileAndDirectory(testFileVazio).catch(error => {
      expect(error.message).toBe('Arquivo Vazio');
    });
  })
});

describe('Teste da função extractLinks', () => {
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
  test('Deve retornar a validação dos links com sucesso', () => {
    const responsesLinks = [
      {
        href: 'https://nodejs.org/api/path.html',
        text: "Path - Documentação oficial (em inglês)",
        file: "./src/testing.md",
      },
      {
        href: 'https://nodejs.org/api/fs.html',
        text: "File system - Documentação oficial (em inglês)",
        file: "./src/testing.md",
      },
      {
        href: 'https:/googlecom',
        text: "Google",
        file: "./src/testing.md",
      },
    ];

    const mockFetch = jest.fn().mockImplementation((href) => {
      if (href === 'https:/googlecom') {
        return Promise.resolve({ status: 404, ok: false });
      } else {
        return Promise.resolve({ status: 200, ok: true });
      }
    });

    global.fetch = mockFetch;

    return validateLinks(responsesLinks)
      .then((result) => {
        expect(result).toEqual([
          {
            href: 'https://nodejs.org/api/path.html',
            text: 'Path - Documentação oficial (em inglês)',
            file: './src/testing.md',
            status: 200,
            ok: 'ok',
          },
          {
            href: 'https://nodejs.org/api/fs.html',
            text: 'File system - Documentação oficial (em inglês)',
            file: './src/testing.md',
            status: 200,
            ok: 'ok',
          },
          {
            href: 'https:/googlecom',
            text: 'Google',
            file: './src/testing.md',
            status: 404,
            ok: 'fail',
          },
        ]);
      });
  });

  test('Deve retornar status 404 quando ocorre erro sem response', () => {
    const errorWithoutResponse = {
      message: 'Algum erro sem resposta'
    };
    
    const responsesLinks = [
      {
        href:'https://nodejs.org/api/path.html',
        text: 'Path - Documentação oficial (em inglês)',
        file: './src/testing.md',
      },
      {
        href: 'https://nodejs.org/api/fs.html',
        text: "File system - Documentação oficial (em inglês)",
        file: "./src/testing.md",
      },
      {
        href: 'https:/googlecom',
        text: "Google",
        file: "./src/testing.md",
      },
    ];

    const mockFetch = jest.fn().mockRejectedValue(errorWithoutResponse);

    global.fetch = mockFetch;

    return validateLinks(responsesLinks)
      .then((result) => {
        expect(result).toEqual ([
          {
            href:'https://nodejs.org/api/path.html',
            text: 'Path - Documentação oficial (em inglês)',
            file: './src/testing.md',
            status: 404,
            ok: 'fail',
          },
          {
            href: 'https://nodejs.org/api/fs.html',
            text: "File system - Documentação oficial (em inglês)",
            file: "./src/testing.md",
            status: 404,
            ok: 'fail',
          },
          {
            href: 'https:/googlecom',
            text: "Google",
            file: "./src/testing.md",
            status: 404,
            ok: 'fail',
          },
        ]);
      });
  })
});

describe('Teste da função mdLinks', () => {
  test('Deve retornar os links com validação', () => {
    const fetchMockResponse = (status, ok) => {
      return Promise.resolve({
        status: status,
        ok: ok,
      });
    };

    global.fetch = jest.fn().mockImplementation((href) => {
      if (href === 'https://nodejs.org/api/path.html') {
        return fetchMockResponse(200, true);
      } else if (href === 'https://nodejs.org/api/fs.html') {
        return fetchMockResponse(200, true);
      } else if (href === 'https:/googlecom') {
        return fetchMockResponse(404, false);
      }
    });

    return mdLinks('src/testing.md', { validate: true })
      .then((result) => {
        expect(result).toEqual([
          { href: 'https://nodejs.org/api/path.html', text: 'Path - Documentação oficial (em inglês)', file: 'src/testing.md', status: 200, ok: 'ok' },
          { href: 'https://nodejs.org/api/fs.html', text: 'File system - Documentação oficial (em inglês)', file: 'src/testing.md', status: 200, ok: 'ok' },
          { href: 'https:/googlecom', text: 'Google', file: 'src/testing.md', status: 404, ok: 'fail' },
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
