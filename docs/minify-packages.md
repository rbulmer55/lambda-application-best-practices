# Minify Packages

[Main Menu](../README.md#quick-links--optimisations) | [Next - Memory Sizing](./memory-sizing.md)

Minification is the process of compressing the code reducing its bundle size

Reducing the bundle size will inheritly impact your **cold start** times when using ephemaral compute services like AWS Lambda. Why? On startup the service pulls down and installs your code onto the virtual machine.

## Why it matters

Smaller deployment packages:

- Reduce cold-start latency

- Lower upload/download time during deploys

- **TODO** Decrease memory usage in serverless runtimes

## Recommendations

### 1. Exclude development-only files from bundles.

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

Prefer bundlers optimised for serverless

Recommended bundlers:

- esbuild (fast, minimal config)

- webpack (when you need fine-grained control)

### 3. Externalise large or native dependencies

Do not bundle:

- aws-sdk (already available in many runtimes)

- Native modules (sharp, pg-native, etc.)

Let the runtime or layer handle them

### 4. Build only necessary runtime dependencies.

- Move dev tools to devDependencies

- Audit dependencies regularly

`npm prune --production`

## Examples

- Check this repo's build steps (see `build.js` and `package.json` scripts) and adapt bundler config for production builds.

```js
// build.js
import { build } from 'esbuild';

build({
  entryPoints: ['./application/entry-points/**/*'],
  outDir: './build/modules/functions/dist',
  bundle: true,
  minify: true,
  sourcemap: false,
  treeShaking: true,
  platform: 'node',
  target: 'es2020',
  external: ['aws-sdk'],
});
```

### Definitions

- **minify**, to rebuild an executable file with with in a storage optimised form.
- **bundle**, to pull in dependencies used in the code
- **external**, to prevent bundling duplicate dependencies that are already part of the runtime environment.
- **sourcemap**,**TODO**
- **treeShaking**,**TODO**

## Testing

We have modified our Esbuild script to handle minifed (default) and un-minified lambda deployments.

**see `<ROOTDIR>/build.js`**

> Minified size: 1.7 MB <br>
> Un-minified size: 3.7 MB <br>
> Saving: **over 50%** (2 MB)

By running tests against the unminified build, we can better observe differences in behavior and performance. The total number of dependencies included in your deployment can affect overall performance, so results may vary. Since this example uses a test project, performance differences may be limited.

**TODO**

> Please note performance tests are base on the example create-vehicle-booking lambda, **a very small application** compared to a full enterprise production build

[Main Menu](../README.md#quick-links--optimisations) | [Next - Memory Sizing](./memory-sizing.md)
