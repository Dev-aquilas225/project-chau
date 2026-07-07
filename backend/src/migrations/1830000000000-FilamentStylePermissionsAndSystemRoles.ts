import { MigrationInterface, QueryRunner } from 'typeorm';

const ALL_RESOURCES = ['products', 'categories', 'orders', 'users', 'promoCodes', 'sellers', 'platformConfig'];
const ALL_ACTIONS = ['view_any', 'view', 'create', 'update', 'delete'];

// Ancien modèle : { resource: 'none' | 'view' | 'manage' }
// Nouveau modèle (inspiré de Filament Shield) : { resource: Array<'view_any'|'view'|'create'|'update'|'delete'> }
function migrateLevelToActions(level: unknown): string[] {
  if (level === 'manage') return [...ALL_ACTIONS];
  if (level === 'view') return ['view_any', 'view'];
  return [];
}

export class FilamentStylePermissionsAndSystemRoles1830000000000 implements MigrationInterface {
  name = 'FilamentStylePermissionsAndSystemRoles1830000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "roles" ADD COLUMN "isSystem" boolean NOT NULL DEFAULT false`);

    const existingRoles: Array<{ id: string; permissions: Record<string, string> }> = await queryRunner.query(
      `SELECT id, permissions FROM "roles"`,
    );
    for (const role of existingRoles) {
      const migrated: Record<string, string[]> = {};
      for (const [resource, level] of Object.entries(role.permissions ?? {})) {
        const actions = migrateLevelToActions(level);
        if (actions.length > 0) migrated[resource] = actions;
      }
      await queryRunner.query(`UPDATE "roles" SET permissions = $1 WHERE id = $2`, [
        JSON.stringify(migrated),
        role.id,
      ]);
    }

    const adminPermissions = Object.fromEntries(ALL_RESOURCES.map((r) => [r, [...ALL_ACTIONS]]));
    await queryRunner.query(
      `INSERT INTO "roles" ("name", "description", "permissions", "isSystem")
       VALUES ($1, $2, $3, true)`,
      ['Admin', 'Rôle de base : accès complet à toutes les ressources du back-office.', JSON.stringify(adminPermissions)],
    );
    await queryRunner.query(
      `INSERT INTO "roles" ("name", "description", "permissions", "isSystem")
       VALUES ($1, $2, $3, true)`,
      ['Client', "Rôle de base : compte client standard, sans accès au back-office.", JSON.stringify({})],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "roles" WHERE "isSystem" = true`);
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "isSystem"`);
  }
}
