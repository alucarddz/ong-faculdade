// Build de produção com Vite: empacota os ES Modules e minifica HTML, CSS e JS.
// Em desenvolvimento o projeto continua rodando sem build (npm start).

import { defineConfig } from 'vite';
import { minify } from 'html-minifier-terser';
import { cp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const raiz = import.meta.dirname;

// As imagens dos projetos são caminhos dentro de strings em js/data/projetos.js
// ("../imagens/..."). O Vite só reescreve caminhos que encontra no HTML/CSS, então
// a pasta é copiada inteira para a build, mantendo os mesmos caminhos relativos.
function copiarImagens() {
    return {
        name: 'copiar-imagens',
        apply: 'build',
        async closeBundle() {
            await cp(resolve(raiz, 'imagens'), resolve(raiz, 'dist/imagens'), {
                recursive: true,
                // Os originais em alta resolução são só a matriz para npm run imagens
                filter: (origem) => !origem.includes('originais'),
            });
            // As páginas ficam em dist/html/; a raiz do site redireciona para a página inicial
            await writeFile(resolve(raiz, 'dist/index.html'),
                '<!DOCTYPE html><meta charset="utf-8"><title>ONG Faculdade</title>'
                + '<meta http-equiv="refresh" content="0; url=html/index.html">'
                + '<a href="html/index.html">Abrir a ONG Faculdade</a>');
        },
    };
}

// O Vite minifica CSS e JS, mas não o HTML: este passo cuida das páginas
function minificarHtml() {
    return {
        name: 'minificar-html',
        apply: 'build',
        transformIndexHtml: {
            order: 'post',
            handler: (html) => minify(html, {
                collapseWhitespace: true,
                // Mantém um espaço entre elementos inline ("<strong>PIX:</strong> chave"),
                // senão as palavras grudariam
                conservativeCollapse: true,
                removeComments: true,
                minifyCSS: true,
                // Minifica o script inline do <head> que aplica o tema
                minifyJS: true,
            }),
        },
    };
}

export default defineConfig({
    // Caminhos relativos: a build funciona em qualquer pasta (ex.: GitHub Pages)
    base: './',
    // Os testes, o servidor local e o README não fazem parte do site
    publicDir: false,
    plugins: [minificarHtml(), copiarImagens()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        // Navegadores com suporte a ES Modules, color-mix() e <dialog>
        target: 'es2022',
        rollupOptions: {
            // As duas páginas do site; a estrutura html/ é mantida em dist/html/
            input: {
                index: resolve(raiz, 'html/index.html'),
                componentes: resolve(raiz, 'html/componentes.html'),
            },
            // O Chart.js continua vindo do CDN sob demanda (import dinâmico)
            external: [/^https:\/\//],
        },
    },
});
