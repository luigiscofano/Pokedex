import { cp, mkdir, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('web', 'dist', { recursive: true });
console.log('Aplicação estática gerada em dist/');
