import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';

export default defineConfig({
    input: ['src/index.ts'],
    external: ['reflect-metadata'],
    output: [
        {
            dir: 'dist',
            entryFileNames: '[name].cjs',
            format: 'cjs',
            exports: 'named',
            sourcemap: true,
        },
        {
            dir: 'dist',
            entryFileNames: '[name].esm.js',
            format: 'esm',
            exports: 'named',
            sourcemap: true,
        },
    ],
    plugins: [
        typescript({
            tsconfig: 'tsconfig.build.json',
        }),
    ],
});
