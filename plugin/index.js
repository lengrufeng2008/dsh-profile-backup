import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url))
const SKILL_PATH = join(PLUGIN_DIR, '..', 'skills', 'profile-backup', 'SKILL.md')
const PROVIDER = 'dsh-profile-backup'
export const name = 'profile-backup'
export const inject = ['skills']
function stripFrontmatter(text) { if (!text.startsWith('---\n')) return text; const end = text.indexOf('\n---\n', 4); return end === -1 ? text : text.slice(end + 5) }
const summary = { name: 'profile-backup', description: 'Backup and restore a DSH profile without node_modules, with archive path-safety checks and force-backup semantics.', whenToUse: 'Before editing a profile or plugin patch, or when moving a profile between machines.', invocation: { modelInvocable: true, userInvocable: true }, source: 'bundled', provider: PROVIDER, resourceBase: { kind: 'directory', path: join(PLUGIN_DIR, '..', 'skills', 'profile-backup') }, rank: 600, locator: 'profile-backup', metadata: { domain: 'maintenance', version: '0.1.0' } }
export function apply(ctx) {
  ctx.skills.registerProvider(() => ({ name: PROVIDER, async list() { return [summary] }, async get(c) { if (c?.name !== 'profile-backup') return undefined; return { ...summary, content: stripFrontmatter(await readFile(SKILL_PATH, 'utf8')) } } }))
}
