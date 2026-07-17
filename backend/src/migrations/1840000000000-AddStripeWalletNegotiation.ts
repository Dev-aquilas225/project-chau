import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStripeWalletNegotiation1840000000000 implements MigrationInterface {
  name = 'AddStripeWalletNegotiation1840000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Alter users table
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "walletBalance" numeric(10,2) NOT NULL DEFAULT 0.00,
      ADD COLUMN "bundleDiscounts" jsonb
    `);

    // 2. Alter orders table
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN "buyerConfirmed" boolean NOT NULL DEFAULT false,
      ADD COLUMN "stripePaymentIntentId" varchar,
      ADD COLUMN "shippingFee" numeric(10,2) NOT NULL DEFAULT 0.00,
      ADD COLUMN "carrierName" varchar NOT NULL DEFAULT '',
      ADD COLUMN "currency" varchar NOT NULL DEFAULT 'EUR',
      ADD COLUMN "exchangeRate" numeric(10,6) NOT NULL DEFAULT 1.000000
    `);

    // 3. Create offers table
    await queryRunner.query(`
      CREATE TABLE "offers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "productId" uuid NOT NULL,
        "buyerId" uuid NOT NULL,
        "sellerId" uuid NOT NULL,
        "suggestedPrice" numeric(10,2) NOT NULL,
        "status" varchar NOT NULL DEFAULT 'pending',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_offers_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_offers_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_offers_buyerId" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_offers_sellerId" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // 4. Create payout_requests table
    await queryRunner.query(`
      CREATE TABLE "payout_requests" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "status" varchar NOT NULL DEFAULT 'pending',
        "reviewNote" varchar,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payout_requests_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payout_requests_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // 5. Create user_reviews table
    await queryRunner.query(`
      CREATE TABLE "user_reviews" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "reviewerId" uuid NOT NULL,
        "revieweeId" uuid NOT NULL,
        "orderId" uuid NOT NULL,
        "rating" integer NOT NULL,
        "comment" text NOT NULL DEFAULT '',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_reviews_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_reviews_reviewerId" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_reviews_revieweeId" FOREIGN KEY ("revieweeId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_reviews_orderId" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_reviews"`);
    await queryRunner.query(`DROP TABLE "payout_requests"`);
    await queryRunner.query(`DROP TABLE "offers"`);
    await queryRunner.query(`
      ALTER TABLE "orders"
      DROP COLUMN "buyerConfirmed",
      DROP COLUMN "stripePaymentIntentId",
      DROP COLUMN "shippingFee",
      DROP COLUMN "carrierName",
      DROP COLUMN "currency",
      DROP COLUMN "exchangeRate"
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "walletBalance",
      DROP COLUMN "bundleDiscounts"
    `);
  }
}
