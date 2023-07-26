const fs = require('fs'); //operações de arquivo
const path = require('path'); // caminhos
//const fetch = require('node-fetch');

// função para ler o conteudo de um diretorio / filtrar os arquivos 
function readFilesInDirectory(dirPath) {
    return fs.promises.readdir(dirPath)
        .then(filesMD => {
            const promisesFilesMD = filesMD
                .filter(file => path.extname(file) === '.md')
                .map(file => readFileAndDirectory(path.resolve(dirPath, file)));

            return Promise.all(promisesFilesMD);
        });
}

// lê o arquivo
function readMarkdownFile(file) {
    const mdFile = path.extname(file) === '.md';
    if (!mdFile) {
        return Promise.reject(new Error('ERROR'))
    }

    return fs.promises.readFile(file, 'utf8')
        .then(data => {
            return { file: file, data: data.toString() };
        });
}

// função ler e processar o caminho do diretório ou arquivo
function readFileAndDirectory(filePath) {
    return fs.stat(filePath)
        .then(objectStatistics => {
            if (objectStatistics.isDirectory()) {
                return readFilesInDirectory(filePath);
            } else {
                return readMarkdownFile(filePath)
                    .then(dataFile => {
                        if (!dataFile.data.trim()) {
                            return { file: filePath, data: 'Arquivo vazio' };
                        } else {
                            return dataFile;
                        }
                    });
            }
        });
}

// função extrair links markdown
function extractLinks(content) {
    const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
    const links = [];
    const file = content.data;

    let toCheck;
    while ((toCheck = linkRegex.exec(file))) {
        const textLink = toCheck[1];
        const urlLink = toCheck[2];
        links.push({ text: textLink, url: urlLink });
    }

    return links;
}

// função validate
function validateLinks(links) {
    const promisesLink = links.map((component) => {
        return fetch(component.url)
            .then((response) => {
                return {
                    ...component,
                    status: response.status,
                    ok: response.ok,
                }
            })
            .catch((error) => {
                const status = error.response ? error.response.status : 400; //criado uma condição ficticia para que pudesse ser retornado o erro de status
                return {
                    ...component,
                    status: status,
                    ok: false,
                };
            });
    });
    return Promise.all(promisesLink);
}

function mdLinks(filePath, option) {
    return new Promise((resolve, reject) => {
        readFileAndDirectory(filePath)
            .then(result => {
                const promisesLinks = result.map(fileContents => {
                    if (!Array.isArray(fileContents)) {
                        const linksObj = extractLinks(fileContents);
                        if (!option.validate) {
                            return linksObj;
                        } else {
                            return validateLinks(linksObj);
                        }
                    } else {
                        return Promise.resolve(fileContents);
                    }
                });

                Promise.all(promisesLinks)
                    .then(arrayLinks => {
                        const allLinks = arrayLinks.flat();
                        resolve(allLinks);
                    })
                    .catch(reject);
            })
            .catch(reject);
    });
}

module.exports = mdLinks;

readFileAndDirectory(__dirname, 'index.js')
    .then(result => {
        console.log('Arquivos MD encontrados:', result);

        const content = result[0];

        const links = extractLinks(content);

        if (links.length === 0) {
            console.log('Não contem links');
        } else {
            console.log('Links que foram encontrados', links);
            validateLinks(links)
                .then(linksValid => {
                    console.log('Links validos:', linksValid)
                })
                .catch(error => {
                    console.error('Erro ao validar', error);
                });

        }
    })
    .catch(error => {
        console.error('Erro ao ler o arquivo', error)
    });

