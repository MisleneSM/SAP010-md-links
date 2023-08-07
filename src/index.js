const fs = require('fs');
const path = require('path');


function readFilesInDirectory(dirPath) {
    return fs.promises.readdir(dirPath)
        .then(filesMD => {
            const promisesFilesMD = filesMD
                .filter(file => path.extname(file) === '.md')
                .map(file => readFileAndDirectory(path.resolve(dirPath, file)));

            return Promise.all(promisesFilesMD);
        })
}


function readMarkdownFile(file) {
    const mdFile = path.extname(file) === '.md';
    if (!mdFile) {
        return Promise.reject(new Error('ERROR'))
    }

    return fs.promises.readFile(file, 'utf8')
        .then(data => {
            return { file: file, data: data.toString() };
        })
}


function readFileAndDirectory(filePath) {
    return fs.promises
        .stat(filePath)
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
        })
}


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
                const status = error.response ? error.response.status : 404;
                return {
                    ...component,
                    status: status,
                    ok: 'fail',
                };
            });
    });
    return Promise.all(promisesLink);
}

function mdLinks(filePath, options = { validate: true }) {
    // retorna a função validate se obter um validate true ou false
    return readFileAndDirectory(filePath)
        .then(resolve => {
            const dataArray = Array.isArray(resolve) ? resolve: [resolve]; 
            const promisesLinks = dataArray.flatMap(fileTopics => {
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
    extractLinks,
    validateLinks,
    mdLinks,
};