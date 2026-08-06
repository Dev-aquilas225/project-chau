import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryActiveField1850000000000 implements MigrationInterface {
  name = 'AddCategoryActiveField1850000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "categories"
      ADD COLUMN IF NOT EXISTS "active" boolean NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "categories"
      DROP COLUMN IF EXISTS "active"
    `);
  }
}
