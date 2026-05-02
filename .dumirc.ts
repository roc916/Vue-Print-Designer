import { defineConfig } from 'dumi';
import { resolve } from 'node:path';

const srcPath = resolve(process.cwd(), 'src');
const siteBase = process.env.SITE_BASE ?? '/';

export default defineConfig({
  title: 'React Print Designer',
  outputPath: 'dist',
  exportStatic: {},
  base: siteBase,
  publicPath: siteBase,
  alias: {
    '@': srcPath,
  },
  resolve: {
    docDirs: ['site'],
    entryFile: './src/index.tsx',
    atomDirs: [{ type: 'component', dir: 'src' }],
  },
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
    },
  },
  themeConfig: {
    logo: false,
    footer: false,
    nav: [],
    prefersColor: {
      default: 'light',
      switch: false,
    },
  },
});
