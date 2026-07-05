import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRolesPermissionsAndBlocked1810000000000 implements MigrationInterface {
  name = 'AddRolesPermissionsAndBlocked1810000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "description" text,
        "permissions" jsonb NOT NULL DEFAULT '{}',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_roles_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_roles_name" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "customRoleId" uuid,
      ADD COLUMN "blocked" boolean NOT NULL DEFAULT false,
      ADD COLUMN "blockedAt" timestamp,
      ADD COLUMN "blockReason" varchar
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "FK_users_customRoleId" FOREIGN KEY ("customRoleId") REFERENCES "roles"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`CREATE INDEX "IDX_users_customRoleId" ON "users" ("customRoleId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_customRoleId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_customRoleId"`);
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "customRoleId",
      DROP COLUMN "blocked",
      DROP COLUMN "blockedAt",
      DROP COLUMN "blockReason"
    `);
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
