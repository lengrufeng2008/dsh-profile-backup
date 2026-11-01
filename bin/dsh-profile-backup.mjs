#!/usr/bin/env node
import { createBackup, restoreBackup, checkArchive } from '../src/backup.mjs'
const args = process.argv.slice(2)
const value = (n) => { const i = args.indexOf(n); return i === -1 ? undefined : args[i + 1] }
const command = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--home' && args[args.indexOf(a) - 1] !== '--profile' && args[args.indexOf(a) - 1] !== '--out' && args[args.indexOf(a) - 1] !== '--archive') || 'help'
const home = value('--home') || process.env.DSH_HOME || `${process.env.HOME}/.dsh`
const profile = value('--profile') || 'web'
try {
  if (command === 'backup') console.log(JSON.stringify(await createBackup({ home, profile, output: value('--out') }), null, 2))
  else if (command === 'restore') { if (!value('--archive')) throw new Error('--archive is required'); console.log(JSON.stringify(await restoreBackup({ home, profile, archive: value('--archive'), force: args.includes('--force') }), null, 2)) }
  else if (command === 'check') { console.log(JSON.stringify(checkArchive(value('--archive') || ''), null, 2)) }
  else { console.log('dsh-profile-backup backup --home ~/.dsh --profile web [--out FILE]\\ndsh-profile-backup restore --archive FILE [--force]\\ndsh-profile-backup check --archive FILE'); process.exitCode = args.includes('--help') ? 0 : 2 }
} catch (error) { console.error(`dsh-profile-backup: ${error.message}`); process.exitCode = 2 }
