import { defineConfig } from 'tsup';
import fse from 'fs-extra';
import path from 'path';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  splitting: false,
  sourcemap: true,
  dts: false,
  onSuccess: async () => {
    const src = path.resolve('templates');
    const dest = path.resolve('dist', 'templates');
    fse.copySync(src, dest, { overwrite: true });
    console.log('✓ Templates copied to dist/templates/');
  },
});
