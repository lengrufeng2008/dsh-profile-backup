import { execFileSync } from 'node:child_process'
import { mkdir, readdir, rename, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'

function profileDir(home, profile) { return join(resolve(home), 'profiles', profile) }
function stamp() { return new Date().toISOString().replace(/[:.]/g, '-') }
async function exists(path) { return Boolean(await stat(path).catch(() => null)) }

export async function createBackup({ home, profile = 'web', output }) {
  const source = profileDir(home, profile)
  if (!(await stat(source).catch(() => null))?.isDirectory()) throw new Error(`profile not found: ${profile}`)
  const out = resolve(output || `dsh-profile-${profile}-${stamp()}.tgz`)
  execFileSync('tar', ['-czf', out, '-C', source, '--exclude', 'node_modules', '.'], { timeout: 60_000 })
  const entries = execFileSync('tar', ['-tzf', out], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)
  return { output: out, profile, entries: entries.length, bytes: (await stat(out)).size }
}

export function checkArchive(archive) {
  const entries = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)
  const issues = []
  if (!entries.includes('./package.json') && !entries.includes('package.json')) issues.push('package.json is missing from the archive')
  for (const entry of entries) {
    if (entry.startsWith('/') || entry.split('/').includes('..')) issues.push(`unsafe archive entry: ${entry}`)
  }
  return { entries, issues, safe: issues.length === 0 }
}

export async function restoreBackup({ home, profile = 'web', archive, force = false }) {
  const target = profileDir(home, profile)
  const check = checkArchive(archive)
  if (!check.safe) throw new Error(check.issues.join('; '))
  if (await exists(target)) {
    const contents = await readdir(target)
    if (contents.length && !force) throw new Error(`profile exists and is not empty: ${profile}; pass --force to archive it first`)
    if (contents.length && force) await rename(target, `${target}.bak-${stamp()}`)
  }
  await mkdir(target, { recursive: true })
  execFileSync('tar', ['-xzf', archive, '-C', target], { timeout: 60_000 })
  return { profile, target, restored: check.entries.length }
}
