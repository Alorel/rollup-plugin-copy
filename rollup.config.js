import typescript from '@rollup/plugin-typescript';
import {join} from 'path';
import {dependencies, peerDependencies} from './package.json';
import {cleanPlugin} from '@alorel/rollup-plugin-clean';
import {dtsPlugin as dts} from '@alorel/rollup-plugin-dts';
import {copyPkgJsonPlugin} from '@alorel/rollup-plugin-copy-pkg-json';

const isSecondBuild = !!process.env.RUN_CP_DIST;

function mkOutput(overrides = {}) {
  return {
    dir: join(__dirname, 'dist'),
    assetFileNames: '[name][extname]',
    sourcemap: false,
    ...overrides
  };
}

export default {
  input: join(__dirname, 'src', 'index.ts'),
  external: Array.from(
    new Set(
      Object.keys(peerDependencies)
        .concat(Object.keys(dependencies))
        .concat('util', 'fs', 'path')
    )
  ),
  output: [
    !isSecondBuild && mkOutput({
      entryFileNames: '[name].cjs.js',
      format: 'cjs'
    }),
    isSecondBuild && mkOutput({
      entryFileNames: '[name].es.js',
      format: 'es'
    })
  ],
  watch: {
    exclude: 'node_modules/*'
  },
  plugins: [
    typescript({
      tsconfig: join(__dirname, 'tsconfig.json')
    }),
    !isSecondBuild && cleanPlugin({
      dir: join(__dirname, 'dist')
    }),
    !isSecondBuild && copyPkgJsonPlugin({
      unsetPaths: [
        'devDependencies',
        'scripts'
      ]
    }),
    !isSecondBuild && dts(),
    isSecondBuild && require('./dist/index.cjs').copyPlugin({
      defaultOpts: {
        glob: {
          cwd: __dirname
        },
        emitNameKind: 'fileName'
      },
      copy: [
        'LICENSE',
        'CHANGELOG.md',
        'README.md'
      ],
    })
  ]
}
