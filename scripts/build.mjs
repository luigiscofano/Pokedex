import { cp, mkdir, rm } from 'node:fs/promises';

const SOURCE_DIRECTORY = 'web';
const OUTPUT_DIRECTORY = 'dist';

// Recria somente a saída; código-fonte e snapshot versionado permanecem intactos.
await rm(OUTPUT_DIRECTORY, { recursive: true, force: true });
await mkdir(OUTPUT_DIRECTORY, { recursive: true });
await cp(SOURCE_DIRECTORY, OUTPUT_DIRECTORY, { recursive: true });
console.log('Aplicação estática gerada em dist/');
