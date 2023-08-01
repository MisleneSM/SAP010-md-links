const { mdLinks } = require('./index');
const path = require('path');

// Função para obter as estatísticas dos links
function getStats(links) {
    const totalLinks = links.length;
    const uniqueLinks = new Set(links.map(link => link.href)).size;
    const brokenLinks = links.filter(link => link.status !== 200).length;

    return {
        total: totalLinks,
        unique: uniqueLinks,
        broken: brokenLinks
    };
}

function printLinks(links) {
    links.forEach(link => {
        console.log(`File: ${link.file}`);
        console.log(`Text: ${link.text}`);
        console.log(`Link: ${link.href}`);
        console.log(`"""""""""""""""""""""""""""`)
    });
}

function printStats(stats) {
    console.log(`Total: ${stats.total}`);
    console.log(`Unique: ${stats.unique}`);
    console.log(`Broken: ${stats.broken}`);
}


const filePath = process.argv[2];
const options = {
    validate: process.argv.includes('--validate'),
    stats: process.argv.includes('--stats'),
    validadeAndStats: process.argv.includes('--validate') && process.argv.includes('--stats'),
};

function mdLinksCli(path, options) {
    mdLinks(path, options)
        .then((result) => {
            if (options.validate) {
                printLinks(result);

            } else if (options.stats) {
                const stats = getStats(result);
                printStats(stats);

            } else if (options.validadeAndStats) {
                const linkStats = getStats(result);
                printStats(linkStats)
            } else {
                printLinks(result);
            }
        })
        .catch(error => {
            console.error(error);
        })
}

//mdLinksCli(path, options);

/*mdLinksCli('./src')
    .then((result) => {
        console.log(result);
    })
    .catch((error) => {
        console.error(error);
    })*/