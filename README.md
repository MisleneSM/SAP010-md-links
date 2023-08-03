# Markdown Links

## Índice

* [1. Prefácio](#1-prefácio)
* [2. Guia de instalação e uso](#2-guia-de-instalação-e-uso)
* [3. Testes Unitários](#3-testes-unitários)
* [4. Fluxograma](#4-fluxograma)
* [5. Objetivos de Aprendizagem](#4-objetivos-de-aprendizagem)
* [6. Tecnologias Utilizadas](#6-tecnologias-utilizadas)

***

## 1. Prefácio📓

[Markdown](https://pt.wikipedia.org/wiki/Markdown) é uma linguagem de marcação
muito popular entre os programadores. É usada em muitas plataformas que
manipulam texto (GitHub, fórum, blogs e etc) e é muito comum encontrar arquivos
com este formato em qualquer repositório (começando pelo tradicional
`README.md`). Os arquivos `Markdown` normalmente contém _links_ que podem estar
quebrados, ou que já não são válidos, prejudicando muito o valor da
informação que está ali.

Neste projeto, foi desenvolvido uma biblioteca que lê arquivos Markdown('md') através de uma ferramenta de linha de comando (CLI), tendo como propósito a partir de um módulo do Node.js, fazer a leitura dos arquivos, verificar a existência dos links e suas estatísticas. Para uma melhor visualização das informações no terminal, foi feito também uma estilização no CLI utilizando a biblioteca chalk.

***

## 2. Guia de instalação e uso🔍📝

### 2.1 Instalação

Para utilizar a biblioteca, instale no seu terminal o seguinte comando:
```sh
$ npm install MisleneSM/SAP010-md-links
```

Após a instalação, assegure possuir um arquivo com links:

![Alt text](image-8.png)


### 2.2 Pré-requisitos:

* É necessário ter a instalação do Node.js


### 2.3 Guia de uso

No seu terminal rode o comando md-links + o caminho do arquivo e será retornado o caminho, text e os links do arquivo selecionado, conforme exemplo abaixo:

![Alt text](image-2.png)


### Options


#### `--validate`

Se deseja fazer a validação dos links desse arquivo, utilize a propriedade `--validate`, o mesmo fará uma requisição HTTP verificando se o link é funcional ou não. Se o link resultar em um redirecionamento a uma URL que responde ok, então consideremos o link como ok. Caso contrário, teremos um retorno de fail, conforme exemplo abaixo:

![Alt text](image-3.png)


#### `--stats`

Se deseja fazer a verificação das estatísticas básicas dos links desse arquivo, utilize a propriedade `--stats`, o mesmo retornará o total de links encontrados no seu arquivo e quantos desses são únicos, conforme exemplo abaixo:

![Alt text](image-6.png)


#### `--validate` & `--stats`

Também podemos combinar as propriedades. Se deseja verificar a validação dos links e estatísticas básicas do seu arquivo, utilize  `--validate --stats`, o mesmo retornará o total de links encontrados, quantos desses são únicos e quantos estão quebrados. Segue o exemplo abaixo:

![Alt text](image-5.png)


## 3. Testes Unitários

Desenvolvido testes unitários abrangendo as funcionalidades do Node.js, garantindo mais segurança na usabilidade da biblioteca.

![Alt text](image-9.png)


## 4. Fluxograma🖊️

Para melhor visualização do planejamento de tarefas e objetivos de cada etapa, foi realizada a organização do projeto por meio de um fluxograma, conforme imagem abaixo:

![Alt text](image-7.png)



## 5. Objetivos de Aprendizagem✅

* Java Script
* Node.js
* Git e GitHub
* Fluxograma


## 6. Tecnologias Utilizadas✅

<img alt="JS" height="50" src="https://cdn2.iconfinder.com/data/icons/designer-skills/128/code-programming-javascript-software-develop-command-language-256.png"> <img alt="git" height="43"  src="https://cdn3.iconfinder.com/data/icons/social-media-2169/24/social_media_social_media_logo_git-256.png" /> <img alt="github" height="50"  src="https://cdn1.iconfinder.com/data/icons/unicons-line-vol-3/24/github-256.png"/> <img alt="nodejs" height="45" src="https://cdn.icon-icons.com/icons2/2415/PNG/512/nodejs_plain_logo_icon_146409.png"/>
