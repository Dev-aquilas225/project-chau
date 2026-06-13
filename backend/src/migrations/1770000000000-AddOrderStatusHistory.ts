import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderStatusHistory1770000000000 implements MigrationInterface {
  name = 'AddOrderStatusHistory1770000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "order_status_history" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "orderId" uuid NOT NULL,
        "status" varchar NOT NULL,
        "note" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_order_status_history_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_status_history_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_order_status_history_orderId" ON "order_status_history" ("orderId")`);

    await queryRunner.query(`
      INSERT INTO "order_status_history" ("orderId", "status", "createdAt")
      SELECT "id", "status", "createdAt" FROM "orders"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "order_status_history"`);
  }
}
