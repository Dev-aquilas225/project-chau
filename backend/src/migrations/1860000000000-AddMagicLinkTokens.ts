import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMagicLinkTokens1860000000000 implements MigrationInterface {
  name = 'AddMagicLinkTokens1860000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "magic_link_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" varchar NOT NULL,
        "tokenHash" varchar NOT NULL,
        "expiresAt" timestamp NOT NULL,
        "usedAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_magic_link_tokens_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_magic_link_tokens_tokenHash" ON "magic_link_tokens" ("tokenHash")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_magic_link_tokens_tokenHash"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "magic_link_tokens"`);
  }
}
