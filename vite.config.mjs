import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);

/**
 * Moonstone's entry imports legacy-global-bundle.css unconditionally, and the package
 * marks every stylesheet as a side effect, so no bundler can drop it. That bundle is
 * the scoped one plus global rules on *, body, button, input and textarea - rules we
 * do not want, because this app is mounted inside a page Jahia already styles.
 *
 * Redirect that one import to the scoped stylesheet, which carries the same component
 * styles, the same design tokens and the same fonts, and nothing global.
 */
function moonstoneScopedCss() {
  const scoped = require.resolve('@jahia/moonstone/scoped.css');

  return {
    name: 'moonstone-scoped-css',
    enforce: 'pre',
    resolveId(source, importer) {
      if (source.endsWith('legacy-global-bundle.css') && importer && importer.includes('@jahia')) {
        return scoped;
      }

      return null;
    }
  };
}

export default defineConfig({
  plugins: [moonstoneScopedCss(), react()],
  build: {
    emptyOutDir: true,
    outDir: path.resolve('target/frontend-dist'),
    cssCodeSplit: false,
    rollupOptions: {
      input: path.resolve('src/main/frontend/edit-user-details/main.jsx'),
      output: {
        entryFileNames: 'edit-user-details-app.js',
        assetFileNames: assetInfo => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'edit-user-details-app.css';
          }

          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
});
