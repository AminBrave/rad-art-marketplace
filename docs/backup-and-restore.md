# Backup and Restore Runbook

## Scope

A recoverable release requires a consistent backup of:

- The MySQL database.
- Private artwork uploads (normally under `storage/app/private` on the local disk).
- Production environment configuration, stored separately in an encrypted secrets vault.
- The exact application release identifier and migration state.

Never commit production secrets or database dumps to this repository. Confirm the actual configured filesystem disk and upload paths before operating on production data.

## Backup policy

Suggested baseline, subject to the hosting provider's capabilities and applicable retention/privacy requirements:

- Database: daily and before every release or migration.
- Private artwork storage: daily incremental backup where supported; otherwise a daily full backup.
- Environment configuration: after approved changes, in an encrypted secrets vault.
- Retention: at least 7 daily, 4 weekly, and 3 monthly restore points where storage and policy permit.

Document the backup owner, location, encryption method, retention period, and recovery objective. Do not claim backups are automated until automation is configured and monitored.

## Create a backup

1. Schedule a maintenance window if the provider cannot take a consistent database/files snapshot.
2. Export MySQL using cPanel's backup facility or `mysqldump`:

```bash
mysqldump --single-transaction --routines --triggers -u DB_USER -p DB_NAME > database-YYYY-MM-DD.sql
```

3. Archive the private artwork directory and any other configured private disks. Exclude caches and temporary files unless required for recovery.
4. Record the Git commit SHA, backup timestamp, application version, and migration state (`php artisan migrate:status`).
5. Encrypt archives before transferring them off the hosting account.
6. Verify archive integrity and confirm that the files are readable.

## Restore procedure

1. Announce the maintenance window and prevent application writes.
2. Provision an empty database and private storage destination.
3. Restore the database:

```bash
mysql -u DB_USER -p DB_NAME < database-YYYY-MM-DD.sql
```

4. Restore private uploads with their original directory structure and restrictive permissions.
5. Restore the matching application release and production environment configuration from the secrets vault.
6. Run `php artisan migrate:status`. Do not run migrations until the restored code and schema compatibility have been reviewed.
7. Clear and rebuild Laravel caches:

```bash
php artisan optimize:clear
php artisan optimize
```

8. Verify login, Buyer/Artist/Admin role restrictions, profile visibility, artwork ownership and moderation, public/private image delivery, inquiry ownership, and critical pages.
9. Re-enable writes only after the responsible owner approves the restore.

## Restore testing and ownership

Perform a restore drill at least quarterly and after a major database/storage change. Record:

- Restore start/end time.
- Restored commit and migration state.
- Data loss window and any missing files.
- Failed steps and corrective actions.
- Person approving the restored service.

A backup is not verified until a restore has succeeded. No production restore drill is confirmed by this document.

## Security and privacy

- Encrypt backups at rest and in transit.
- Restrict access to the smallest operational group.
- Never email raw database dumps or upload archives to public file shares.
- Apply retention/deletion policy to backup expiry; explain that backup rotation may delay physical erasure.
- Avoid including logs containing private inquiry message bodies unless operationally necessary.
- Test access controls on backup storage independently of application access controls.
