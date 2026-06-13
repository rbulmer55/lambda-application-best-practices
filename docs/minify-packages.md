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

By running tests against both builds, we can better observe differences in behavior and performance. The total number of dependencies included in your deployment can affect overall performance, so results may vary. Since this example uses a test project, performance differences may be limited.

The table below compares the overall HTTP response times (measured in milliseconds) for the entire duration of the test.

| Metric             | Minified Lambda | Not Minified Lambda | Performance Variance                       |
| :----------------- | :-------------- | :------------------ | :----------------------------------------- |
| **Minimum**        | 397.0 ms        | 397.0 ms            | Identical                                  |
| **Median (p50)**   | 561.2 ms        | 584.2 ms            | Minified is 3.9% faster (-23.0 ms)         |
| **Mean (Average)** | 671.8 ms        | 701.3 ms            | Minified is 4.2% faster (-29.5 ms)         |
| **p75**            | 671.9 ms        | 699.4 ms            | Minified is 3.9% faster (-27.5 ms)         |
| **p90**            | 871.5 ms        | 963.1 ms            | Minified is 9.5% faster (-91.6 ms)         |
| **p95**            | 1,107.9 ms      | 1,153.1 ms          | Minified is 3.9% faster (-45.2 ms)         |
| **p99**            | 4,583.6 ms      | 4,492.8 ms          | Not Minified is slightly faster (+90.8 ms) |
| **Maximum**        | 5,807.0 ms      | 5,680.0 ms          | Not Minified is slightly lower (+127.0 ms) |

> Please note performance tests are base on the example create-vehicle-booking lambda, **a very small application** compared to a full enterprise production build

## Key Performance Insights

### 1. Steady-State (Warm) Performance

Once the Lambdas are completely warmed up and running at a stable 15 requests per second, the **Minified Lambda** is consistently faster.

- **Minified (Warm Window):** Holds a median (p50) response time of roughly **528.6 ms** and an average of **573.7 ms**.
- **Not Minified (Warm Window):** Holds a median (p50) response time of roughly **561.2 ms to 584.2 ms** and an average of **627.0 ms to 650.8 ms**.

> **Takeaway:** Minification shaves off roughly **30 ms to 50 ms** of execution time per request in a warm state. This is likely due to reduced file I/O operations and faster code parsing inside the Node.js/runtime environment.

---

### 2. Cold Start Behavior (Initial Latency)

Both configurations show a massive spike in the maximum response times (~5.6 to 5.8 seconds), which is typical behavior for AWS Lambda cold starts. However, the progression shows a key difference:

- **Minified Lambda:** In the very first 10-second interval, it successfully completed **6 responses** despite the cold start, tracking a mean response time of **4,058 ms**.
- **Not Minified Lambda:** In its first 10-second interval, it completed **0 responses** (the summary metrics are entirely blank `{}`). The code package size or initialization overhead was heavy enough to push the first batch of completions entirely into the second time interval block.

---

### 3. Total Session Length

Because the HTTP response times were shorter for the minified variant, the total virtual user session lengths were shorter as well:

- **Minified Mean Session:** 750.2 ms
- **Not Minified Mean Session:** 775.3 ms

---

## Conclusion & Verdict

> **Recommendation:** Minifying your Lambda deployment package provides a measurable performance boost. It directly improves your steady-state latencies (especially at the p90 level) and helps mitigate the initial traffic block typically felt during an architectural cold start. **It is highly recommended to keep the minification step enabled in your CI/CD build pipeline.**

[Main Menu](../README.md#quick-links--optimisations) | [Next - Memory Sizing](./memory-sizing.md)
