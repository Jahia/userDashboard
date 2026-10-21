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

/**
 * One build per app, picked by mode: `vite build` builds the profile app, `vite build --mode
 * projects` the projects one. Two inputs in one build would share chunks loaded through
 * `import`, which a classic <script> include cannot follow, and their CSS would collide under
 * cssCodeSplit: false. Each build therefore emits one self-contained script and one stylesheet.
 */
const APPS = {
  profile: {input: 'src/main/frontend/edit-user-details/main.jsx', name: 'edit-user-details-app'},
  projects: {input: 'src/main/frontend/projects/main.jsx', name: 'projects-app'},
  // Loaded by the profile page only when Jahia's CKEditor 5 module is installed.
  ckeditor5: {input: 'src/main/frontend/ckeditor5/main.js', name: 'ckeditor5-app'}
};

export default defineConfig(({mode}) => {
  const app = APPS[mode] || APPS.profile;

  return {
    plugins: [moonstoneScopedCss(), react()],
    build: {
      // Only the first build of the chain clears the output, so the second keeps its files.
      emptyOutDir: app === APPS.profile,
      outDir: path.resolve('target/frontend-dist'),
      cssCodeSplit: false,
      rollupOptions: {
        input: path.resolve(app.input),
        output: {
          // Each bundle is loaded as a classic <script>, and two of them can share a page (the
          // profile app and CKEditor 5): wrapped in a function, their minified top-level names
          // no longer collide in the page's global scope.
          format: 'iife',
          entryFileNames: `${app.name}.js`,
          assetFileNames: assetInfo => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return `${app.name}.css`;
            }

            return 'assets/[name]-[hash][extname]';
          }
        }
      }
    }
  };
});
