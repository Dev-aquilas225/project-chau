import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserProfileFields1800000000000 implements MigrationInterface {
  name = 'AddUserProfileFields1800000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "photoURL" varchar,
      ADD COLUMN "bio" varchar,
      ADD COLUMN "country" varchar,
      ADD COLUMN "city" varchar
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "photoURL",
      DROP COLUMN "bio",
      DROP COLUMN "country",
      DROP COLUMN "city"
    `);
  }
}
