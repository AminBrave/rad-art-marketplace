# Backup and Restore Runbook

## Scope

Back up the MySQL database, private artwork uploads, production environment configuration, and the exact application release identifier. Never store production secrets in the Git repository.

## Backup schedule

- Database: daily, with an additional backup before every release or migration.
- Private artwork storage: daily incremental backup where the hosting plan supports it; otherwise a full backup at least daily.
- Environment configuration: after every approved configuration change, stored in an encrypted secrets vault or encrypted offline backup.
- Retention: keep at least 7 daily, 4 weekly, and 3 monthly restore points, subject to the hosting provider's storage limits and applicable privacy obligations.

## Create a backup

1. Put the site into maintenance mode if the provider's backup process cannot produce a consistent database/files snapshot.
2. Export MySQL using cPanel's backup facility or `mysqldump`:

```bash
mysqldump --single-transaction --routines --triggers -u DB_USER -p DB_NAME > database-YYYY-MM-DD.sql
```

3. Archive the private upload directory (normally `storage/app/private` and any other configured private disks). Do not archive public caches or generated temporary files unless required.
4. Record the Git commit SHA, backup timestamp, application version, and schema migration state.
5. Encrypt backup archives before transferring them off the hosting account.
6. Verify archive integrity and confirm that the backup is readable.

## Restore procedure

1. Announce the maintenance window and prevent writes.
2. Provision an empty database and a private storage destination.
3. Restore the database:

```bash
mysql -u DB_USER -p DB_NAME < database-YYYY-MM-DD.sql
```

4. Restore private uploads with original directory structure and restrictive permissions.
5. Restore the matching application release and production environment configuration from the secrets vault.
6. Run `php artisan migrate:status`; do not run migrations automatically until the restored schema and code version are confirmed compatible.
7. Clear/rebuild Laravel caches with `php artisan optimize:clear` followed by `php artisan optimize`.
8. Verify login, role restrictions, artwork visibility, private image access, inquiry ownership, and mail delivery.
9. Re-enable writes only after the owner approves the restore.

## Restore testing and ownership

Perform a restore drill at least quarterly and after a major storage/database change. Record duration, missing dependencies, data loss window, and corrective actions. A backup is not considered verified until a restore has succeeded.

## Security and privacy

- Encrypt backups at rest and in transit.
- Restrict access to the smallest operational group.
- Never email raw database dumps or upload archives to public file shares.
- Apply the site's retention/deletion policy to backup expiry, while recognizing that backup rotation may delay physical erasure.
- Do not include application logs containing inquiry message bodies unless operationally necessary.
