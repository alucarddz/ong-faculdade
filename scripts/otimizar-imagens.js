// Gera as versões otimizadas das imagens a partir dos originais em imagens/originais/.
// Uso: npm run imagens  (rodar de novo sempre que um original for trocado)
//
// - Fotos: várias larguras (para o srcset) em AVIF, WebP e JPEG de reserva
// - Logo e ícones: redimensionados para 2x o tamanho exibido (telas de alta densidade),
//   em WebP com PNG de reserva. Nunca ampliamos além do tamanho original.

import sharp from 'sharp';
import { mkdir, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', 'imagens');
const ORIGINAIS = join(RAIZ, 'originais');

const FOTOS = [
    // Exibida de ~360px (card no celular) a ~660px (detalhe no desktop)
    { arquivo: 'hero-voluntarios.jpg', larguras: [400, 800] },
];

const ICONES = [
    { arquivo: 'logo.png', exibido: 44 },
    { arquivo: 'icones/facebook.png', exibido: 28 },
    { arquivo: 'icones/instagram.png', exibido: 28 },
    { arquivo: 'icones/youtube.png', exibido: 28 },
];

const kb = async (caminho) => ((await stat(caminho)).size / 1024).toFixed(1);
const semExtensao = (arquivo) => arquivo.replace(/\.\w+$/, '');

async function salvar(pipeline, destino) {
    await mkdir(dirname(destino), { recursive: true });
    await pipeline.toFile(destino);
    return `${destino.slice(RAIZ.length + 1)} (${await kb(destino)} KB)`;
}

for (const { arquivo, larguras } of FOTOS) {
    const origem = join(ORIGINAIS, arquivo);
    const { width } = await sharp(origem).metadata();
    const gerados = [];

    for (const largura of larguras.filter((l) => l <= width)) {
        const base = join(RAIZ, `${semExtensao(arquivo)}-${largura}`);
        const redimensionada = () => sharp(origem).resize({ width: largura });
        gerados.push(
            await salvar(redimensionada().avif({ quality: 50, effort: 6 }), `${base}.avif`),
            await salvar(redimensionada().webp({ quality: 72 }), `${base}.webp`),
            await salvar(redimensionada().jpeg({ quality: 75, mozjpeg: true, progressive: true }), `${base}.jpg`),
        );
    }
    console.log(`${arquivo} (${await kb(origem)} KB) ->\n  ${gerados.join('\n  ')}`);
}

for (const { arquivo, exibido } of ICONES) {
    const origem = join(ORIGINAIS, arquivo);
    const lado = exibido * 2;
    const base = join(RAIZ, `${semExtensao(arquivo)}-${lado}`);
    const redimensionado = () => sharp(origem).resize(lado, lado, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });

    const gerados = [
        await salvar(redimensionado().webp({ quality: 90, alphaQuality: 100 }), `${base}.webp`),
        await salvar(redimensionado().png({ palette: true, compressionLevel: 9 }), `${base}.png`),
    ];

    // Em imagens pequenas com poucas cores, o PNG com paleta pode vencer o WebP:
    // nesse caso o WebP é descartado e o HTML usa só o PNG
    if ((await stat(`${base}.webp`)).size >= (await stat(`${base}.png`)).size) {
        await rm(`${base}.webp`);
        gerados[0] += ' -> descartado, PNG ficou menor';
    }
    console.log(`${arquivo} (${await kb(origem)} KB) ->\n  ${gerados.join('\n  ')}`);
}
