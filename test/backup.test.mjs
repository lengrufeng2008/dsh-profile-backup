import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createBackup, restoreBackup, checkArchive } from '../src/backup.mjs'
import { apply } from '../plugin/index.js'
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
async function env() {
  const home = await mkdtemp(join(tmpdir(), 'dsh-backup-'))
  await mkdir(join(home, 'profiles/web/node_modules/x'), { recursive: true })
  await writeFile(join(home, 'profiles/web/package.json'), '{"name":"profile"}\n')
  await writeFile(join(home, 'profiles/web/cordis.patch.yml'), '[]\n')
  await writeFile(join(home, 'profiles/web/node_modules/x/a.js'), 'junk\n')
  return home
}
test('backup excludes node_modules; restore is path-safe', async () => {
  const home = await env()
  try {
    const out = join(home, 'backup.tgz')
    const created = await createBackup({ home, profile: 'web', output: out })
    assert.ok(created.entries >= 2)
    assert.equal(checkArchive(out).safe, true)
    const targetHome = await mkdtemp(join(tmpdir(), 'dsh-backup-target-'))
    const restored = await restoreBackup({ home: targetHome, profile: 'web', archive: out })
    assert.equal(restored.profile, 'web')
    assert.equal(JSON.parse(await readFile(join(targetHome, 'profiles/web/package.json'), 'utf8')).name, 'profile')
    assert.equal((await stat(join(targetHome, 'profiles/web/node_modules')).catch(() => null)), null)
    await rm(targetHome, { recursive: true, force: true })
  } finally { await rm(home, { recursive: true, force: true }) }
})
test('restore refuses a non-empty profile without force', async () => {
  const home = await env()
  try {
    const out = join(home, 'backup.tgz'); await createBackup({ home, profile: 'web', output: out })
    await assert.rejects(() => restoreBackup({ home, profile: 'web', archive: out }), /not empty/)
    const forced = await restoreBackup({ home, profile: 'web', archive: out, force: true })
    assert.equal(forced.profile, 'web')
  } finally { await rm(home, { recursive: true, force: true }) }
})
test('plugin registers profile-backup', async () => {
  let factory; apply({ skills: { registerProvider: (fn) => { factory = fn } } })
  assert.equal((await factory().list())[0].name, 'profile-backup')
  assert.equal(await factory().get({ name: 'missing' }), undefined)
})
