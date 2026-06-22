import { MigrationInterface, QueryRunner } from 'typeorm';

export class MarketplaceC2C1780000000000 implements MigrationInterface {
  name = 'MarketplaceC2C1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // users — sellerStatus + sellerProfile
    await queryRunner.query(`ALTER TABLE "users" ADD "sellerStatus" varchar NOT NULL DEFAULT 'none'`);
    await queryRunner.query(`ALTER TABLE "users" ADD "sellerProfile" jsonb NOT NULL DEFAULT '{}'`);

    // products — sellerId + listingStatus
    await queryRunner.query(`ALTER TABLE "products" ADD "sellerId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_products_seller" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(`ALTER TABLE "products" ADD "listingStatus" varchar NOT NULL DEFAULT 'active'`);
    await queryRunner.query(`CREATE INDEX "IDX_products_sellerId" ON "products" ("sellerId")`);

    // orders — sellerId + escrow fields
    await queryRunner.query(`ALTER TABLE "orders" ADD "sellerId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_seller" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(`ALTER TABLE "orders" ADD "platformFee" numeric(10,2) NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "orders" ADD "sellerPayout" numeric(10,2) NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "orders" ADD "payoutStatus" varchar NOT NULL DEFAULT 'pending'`);

    // platform_config
    await queryRunner.query(`
      CREATE TABLE "platform_config" (
        "key"   varchar NOT NULL,
        "value" jsonb   NOT NULL,
        CONSTRAINT "PK_platform_config_key" PRIMARY KEY ("key")
      )
    `);
    await queryRunner.query(`
      INSERT INTO "platform_config" ("key", "value") VALUES
        ('commissionRate',             '10'),
        ('sellerRegistrationEnabled',  'true')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "platform_config"`);

    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payoutStatus"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "sellerPayout"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "platformFee"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_seller"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "sellerId"`);

    await queryRunner.query(`DROP INDEX "IDX_products_sellerId"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "listingStatus"`);
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_products_seller"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "sellerId"`);

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "sellerProfile"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "sellerStatus"`);
  }
}
