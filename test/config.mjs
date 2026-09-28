import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = resolve(process.argv[2])
const require = createRequire(join(root, 'probe.cjs'))
const patch = require('yaml').parse(readFileSync(new URL('../cordis.patch.yml', import.meta.url), 'utf8'))
const { Config } = await import(pathToFileURL(require.resolve('@deepseek-ai/dsh-llm-pi-ai')))
const validated = Config(patch[0].config)
const providers = typeof validated.providers.get === 'function' ? validated.providers.get() : validated.providers
assert.equal(providers.memorax.models[0].id, 'deepseek-v4-flash')
console.log('Native provider configuration accepted')
