import { defineConfig } from 'father';
import { resolve } from 'node:path';

const srcPath = resolve(process.cwd(), 'src');

const targets = {
  edge: 141,
  firefox: 140,
  chrome: 109,
  safari: 18,
  opera: 124,
  electron: 39,
};

const baseConfig = {
  platform: 'browser',
  transformer: 'babel',
  parallel: true,
  targets,
} as const;

export default defineConfig({
  alias: {
    '@': srcPath,
  },
  esm: {
    output: 'es',
    ...baseConfig,
  },
  cjs: {
    output: 'lib',
    ...baseConfig,
  },
  umd: {
    name: 'ReactPrintDesigner',
    output: 'dist',
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      'react-dom/client': 'ReactDOM',
      antd: 'antd',
      '@ant-design/icons': 'icons',
      '@ant-design/pro-components': 'ProComponents',
    },
    chainWebpack: (memo) => {
      memo.resolve.alias.set('@', srcPath);
      return memo;
    },
    targets,
  },
});