# Minify Packages

## Why it matters

Smaller deployment packages:

- Reduce cold-start latency

- Lower upload/download time during deploys

- Decrease memory usage in serverless runtimes

## Recommendations

### 1. Exclude development-only files from bundles and use tree-shaking where possible.

Use .npmignore or "files" in package.json

Avoid bundling tests, docs, and source maps unless required

    ```json
    {
        "files": ["dist"],
        "scripts": {
            "build": "node build.js"
        }
    }
    ```

### 2. Enable tree-shaking & minification

Prefer bundlers optimized for serverless

Recommended bundlers:

- esbuild (fast, minimal config)

- webpack (when you need fine-grained control)

```js
// build.js
import { build } from 'esbuild';

build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  platform: 'node',
  target: 'node18',
  minify: true,
  sourcemap: false,
  treeShaking: true,
  external: ['aws-sdk', 'sharp'],
});
```

### 3. Externalize large or native dependencies

Do not bundle:

- aws-sdk (already available in many runtimes)

- Native modules (sharp, pg-native, etc.)

Let the runtime or layer handle them

### 4. Vendor only necessary runtime dependencies.

- Move dev tools to devDependencies

- Audit dependencies regularly

`npm prune --production`

## Examples

- Check this repo's build steps (see `build.js` and `package.json` scripts) and adapt bundler config for production builds.
