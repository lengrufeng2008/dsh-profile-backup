---
name: profile-backup
description: Backup/restore a DSH profile config without node_modules. Use before profile/plugin patch changes or when moving a profile. Includes archive path checks and force-backup semantics.
whenToUse: "A profile is about to be edited, upgraded, or moved and a recoverable config snapshot is needed."
---

# Profile backup

```bash
node bin/dsh-profile-backup.mjs backup --home ~/.dsh --profile web --out web-backup.tgz
node bin/dsh-profile-backup.mjs check --archive web-backup.tgz
node bin/dsh-profile-backup.mjs restore --archive web-backup.tgz --home ~/.dsh --profile web
```

## Behavior

- Archives the profile config (`package.json`, `cordis*.yml`, lock/workspace files, patches) and
  excludes `node_modules`.
- `check` rejects absolute/`..` entries and requires `package.json`.
- `restore` refuses a non-empty target unless `--force`; force renames the existing profile to
  `*.bak-<timestamp>` before extracting.

## Limits

- Config only; no session history, no secrets, no package cache.
- `--force` keeps a `.bak-*` but does not automatically roll back.
- It does not validate that the restored profile boots.
