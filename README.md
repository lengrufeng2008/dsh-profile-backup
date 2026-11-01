# Profile Backup for DSH

> Config-only backup/restore for a DSH profile, without `node_modules`. Path-safe archive check and
> force-backup semantics.

## Use

```bash
node bin/dsh-profile-backup.mjs backup --home ~/.dsh --profile web --out web-backup.tgz
node bin/dsh-profile-backup.mjs check --archive web-backup.tgz
node bin/dsh-profile-backup.mjs restore --archive web-backup.tgz --home ~/.dsh --profile web
```

## Limits

- Config only; no sessions, secrets, or package cache
- `--force` renames the existing profile to `.bak-*`; no automatic rollback
- Does not boot-test the restored profile
- Not a substitute for a full machine backup

## Tests

```bash
npm test
```

## Provenance

A small independent profile snapshot tool. License: MIT.
