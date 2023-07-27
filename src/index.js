const fs = require('fs'); //operações de arquivo
const path = require('path'); // caminhos

// função para ler o conteudo de um diretorio / filtrar os arquivos 
function readFilesInDirectory(dirPath) {
    return fs.promises.readdir(dirPath)
        .then(filesMD => {
            const promisesFilesMD = filesMD
                .filter(file => path.extname(file) === '.md') // cria um novo array contendo os arquivos que possui extensão md
                .map(file => readFileAndDirectory(path.resolve(dirPath, file))); // percorre cada elemento do array

            return Promise.all(promisesFilesMD);
        })
        .catch((error) => {
            throw new Error('Error' + error.message);
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
        })
        .catch((error) => {
            throw new Error('Error' + error.message);
        });
}

 // função ler e processar o caminho do diretório ou arquivo
 function readFileAndDirectory(filePath) {
    return fs.promises.stat(filePath)
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

function mdLinks(filePath, options = { validate: false }) {
    // função extrair links markdown
    function extractLinks(content, filePath) {
        const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
        const links = [];
        const file = content;

        let toCheck;
        while ((toCheck = linkRegex.exec(file))) {
            const textLink = toCheck[1];
            const urlLink = toCheck[2];
            links.push({ href: urlLink, text: textLink, file: filePath });
        }

        return links;
    }

    // função validate
    function validateLinks(links) {
        const promisesLink = links.map((component) => {
            return fetch(component.href)
                .then((response) => {
                    return {
                        ...component,
                        status: response.status,
                        ok: response.ok ? 'ok' : 'fail',
                    }
                })
                .catch((error) => {
                    const status = error.response ? error.response.status : 400; //criado uma condição ficticia para que pudesse ser retornado o erro de status
                    return {
                        ...component,
                        status: status,
                        ok: 'fail',
                    };
                });
        });
        return Promise.all(promisesLink);
    }

    // retorna a função validate se obter um validate true ou false
    return readFileAndDirectory(filePath)
        .then(resolve => {
            const promisesLinks = resolve.flat().map(fileTopics => {
                const linksObj = extractLinks(fileTopics.data, fileTopics.file);
                return options.validate ? validateLinks(linksObj) : linksObj;
            });

            return Promise.all(promisesLinks)
                .then(linksArrays => {
                    const fullLinks = linksArrays.flat();
                    return fullLinks;
                });
        });
}

module.exports = {
    readFilesInDirectory,
    readMarkdownFile,
    readFileAndDirectory,
    mdLinks
};


mdLinks('./src')
    .then((result) => {
        console.log(result);
    })
    .catch((error) => {
        console.error(error);
    });