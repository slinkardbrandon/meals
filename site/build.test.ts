import { expect, test } from 'bun:test'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build } from './build'

test('index.html uses relative asset paths', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'meals-site-'))
  try {
    await build(dir)
    const html = await readFile(join(dir, 'index.html'), 'utf8')
    expect(html).not.toContain('src="/')
    expect(html).not.toContain('href="/')
    expect(html).toMatch(/src="\.\//)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}, 60_000)
