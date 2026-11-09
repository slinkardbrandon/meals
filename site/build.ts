import tailwind from 'bun-plugin-tailwind'
import { join } from 'node:path'
import { repoRoot } from '../src/dinners'
import { writeSiteData } from './gen-data'

/** Generates data, then bundles the SPA into `outdir` with relative paths (Pages serves it under `/meals/`). */
export const build = async (outdir: string) => {
  await writeSiteData()
  const result = await Bun.build({
    entrypoints: [join(repoRoot, 'site/index.html')],
    outdir,
    publicPath: './',
    plugins: [tailwind],
    minify: true,
    // Without this, React's development build gets bundled.
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  })
  if (!result.success) throw new AggregateError(result.logs, 'Site build failed')
  return result
}

if (import.meta.main) {
  const outdir = join(repoRoot, '_site')
  await build(outdir)
  console.log(`Built ${outdir}`)
}
