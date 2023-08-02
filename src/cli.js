#!/usr/bin/env node
const { mdLinks } = require('./index');

const filePath = process.argv[2];
const options = {
    validate: process.argv.includes('--validate'),
    stats: process.argv.includes('--stats'),
    validadeAndStats: process.argv.includes('--validate') && process.argv.includes('--stats'),
};


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

// função validate
function printLinks(links) {
    links.forEach((link) => {
        const {href, text, file, status} = link;
        const statusLink = status === 200 ? `ok ${status}` : `fail ${status}`;
        console.log(`File: ${file}`);
        console.log(`Text: ${text}`);
        console.log(`Link: ${href}`);
        console.log(`Status: ${statusLink}`);
        console.log(`"""""""""""""""""""""""""""""""""""""`)
    });
}

// função stats
function printStats(stats) {
    console.log(`Total: ${stats.total}`);
    console.log(`Unique: ${stats.unique}`);
}

// função validate and stats
function printStatsBroken(stats) {
    console.log(`Total: ${stats.total}`);
    console.log(`Unique: ${stats.unique}`);
    console.log(`Broken: ${stats.broken}`);
}

function mdLinksCli(path, options) {
    mdLinks(path, options)
        .then((result) => {
            if(result.length === 0){
                console.log('O arquivo não contém links');
                return;
            }

            if (options.validadeAndStats) {
                const linkStats = getStats(result);
                printStatsBroken(linkStats);
            } else if (options.validate) {
                printLinks(result);
            } else if (options.stats) {
                const stats = getStats(result);
                printStats(stats);
            } else {
                printLinks(result);
            }
        })
        .catch((error) => {
            console.error(error);
        });
}

mdLinksCli(filePath, options);