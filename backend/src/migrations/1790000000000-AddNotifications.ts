import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotifications1790000000000 implements MigrationInterface {
  name = 'AddNotifications1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "type" varchar NOT NULL,
        "title" varchar NOT NULL,
        "message" text NOT NULL,
        "link" varchar,
        "read" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_userId" ON "notifications" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_userId_read" ON "notifications" ("userId", "read")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "notifications"`);
  }
}
