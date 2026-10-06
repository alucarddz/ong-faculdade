// Servidor estático para desenvolvimento, sem dependências (só o Node).
// Necessário porque o navegador só carrega ES Modules via http://, não via file://.
// Uso: npm start  (porta padrão 5500; outra porta: PORTA=8080 npm start)

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORTA = Number(process.env.PORTA) || 5500;

const TIPOS = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

createServer(async (requisicao, resposta) => {
    const caminhoUrl = decodeURIComponent(new URL(requisicao.url, 'http://localhost').pathname);
    if (caminhoUrl === '/') {
        resposta.writeHead(302, { Location: '/html/index.html' });
        return resposta.end();
    }

    // normalize + verificação da raiz impedem acessar arquivos fora do projeto (../)
    const arquivo = join(RAIZ, normalize(caminhoUrl));
    if (!arquivo.startsWith(RAIZ)) {
        resposta.writeHead(403);
        return resposta.end('Acesso negado');
    }

    try {
        const conteudo = await readFile(arquivo);
        resposta.writeHead(200, { 'Content-Type': TIPOS[extname(arquivo)] ?? 'application/octet-stream' });
        resposta.end(conteudo);
    } catch {
        resposta.writeHead(404);
        resposta.end('Arquivo não encontrado');
    }
}).listen(PORTA, () => {
    console.log(`ONG Faculdade rodando em http://localhost:${PORTA}/html/index.html`);
});
