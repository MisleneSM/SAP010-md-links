const fs = require('fs'); //operações de arquivo
const path = require('path'); // caminhos
//const fetch = require('node-fetch');

// função para ler o conteudo de um diretorio / filtrar os arquivos 
function readFilesInDirectory(dirPath){
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
    if(!mdFile) {
       return Promise.reject(new Error('ERROR'))
    }
    
    return fs.promises.readFile(file, 'utf8')
        .then(data => {
            return {file: file, data: data.toString()};
        });
}

// função ler e processar o caminho do diretório ou arquivo
function readFileAndDirectory(filePath){
    return fs.promises.stat(filePath)
      .then(objectStatistics => {
        if(objectStatistics.isDirectory()) {
            return readFilesInDirectory(filePath);
        } else {
            return readMarkdownFile(filePath);
        }
      });
}

// função extrair links markdown
function extractLinks(content){
    const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
    const links = [];

    let toCheck;
    while((toCheck = linkRegex.exec(content))){
       const textLink = toCheck[1];
       const urlLink = toCheck[2];
       links.push({text: textLink, url: urlLink});
    }

    return links;
}


readFileAndDirectory(__dirname, 'index.js')
  .then(result => {
    console.log('Arquivos MD encontrados:', result);

    const linksMD = extractLinks(result[0].data);
    console.log('Links que foram encontrados', linksMD);
  })